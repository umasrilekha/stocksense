from typing import Dict, Any, List

def evaluate_inventory_decision(sku_data: Dict[str, Any], overrides: Dict[str, Any] = None) -> Dict[str, Any]:
    if not sku_data:
        return {"error": "SKU not found"}

    overrides = overrides or {}
    
    sku_id = sku_data["sku_id"]
    sku_name = sku_data["name"]
    unit_cost = sku_data["unit_cost"]
    
    supplier_lead_time = overrides.get("supplier_lead_time_days", sku_data["supplier_lead_time_days"])
    supplier_unit_price = sku_data["supplier_unit_price"]
    supplier_shipping_flat = sku_data["supplier_shipping_flat"]
    
    transfer_rate = overrides.get("inter_location_transfer_rate", sku_data["inter_location_transfer_rate"])
    transfer_handling = sku_data["inter_location_handling_flat"]
    transfer_lead_time = overrides.get("inter_location_lead_time_days", sku_data["inter_location_lead_time_days"])
    
    holding_cost_per_day = sku_data["holding_cost_per_day"]
    stockout_penalty_per_unit = sku_data["stockout_penalty_per_unit"]
    
    locations = sku_data["locations"]
    
    # Process location balances
    processed_locations = []
    shortage_locs = []
    excess_locs = []
    
    demand_multiplier = (1.0 + float(overrides.get("demand_surge_percent", 0))) / 100.0 if "demand_surge_percent" in overrides else 1.0
    
    for loc in locations:
        city = loc["city"]
        stock = loc["current_stock"]
        
        # Check source location stock override
        if overrides.get("source_location_city") and city.lower() == overrides["source_location_city"].lower():
            if "source_available_stock" in overrides:
                stock = int(overrides["source_available_stock"])
                
        forecast_demand = int(loc["forecast_14d_demand"] * demand_multiplier)
        net_balance = stock - forecast_demand
        
        loc_info = {
            "city": city,
            "current_stock": stock,
            "safety_stock": loc["safety_stock"],
            "forecast_14d_demand": forecast_demand,
            "net_balance": net_balance,
            "status": "SHORTAGE" if net_balance < 0 else ("EXCESS" if net_balance > 30 else "BALANCED")
        }
        processed_locations.append(loc_info)
        
        if net_balance < 0:
            shortage_locs.append((city, abs(net_balance)))
        elif net_balance > 0:
            excess_locs.append((city, net_balance))
            
    # Target shortage location & required qty
    if shortage_locs:
        target_city, needed_qty = shortage_locs[0]
    else:
        target_city, needed_qty = ("General", 0)
        
    # Source excess location
    if excess_locs:
        source_city, available_excess = excess_locs[0]
    else:
        source_city, available_excess = ("None", 0)
        
    # Option 1: BUY
    buy_qty = needed_qty if needed_qty > 0 else 50
    buy_cost = (buy_qty * supplier_unit_price) + supplier_shipping_flat
    buy_stockout_penalty = (needed_qty * stockout_penalty_per_unit * 0.5) if supplier_lead_time > 3 else 0
    buy_total_cost = buy_cost + buy_stockout_penalty
    
    # Option 2: MOVE
    move_possible_qty = min(needed_qty, available_excess) if needed_qty > 0 else 0
    if move_possible_qty > 0:
        move_cost = (move_possible_qty * transfer_rate) + transfer_handling
        move_stockout_penalty = (needed_qty - move_possible_qty) * stockout_penalty_per_unit
        move_total_cost = move_cost + move_stockout_penalty
        move_feasible = True
    else:
        move_cost = transfer_handling
        move_total_cost = 9999.0
        move_feasible = False
        
    # Option 3: WAIT
    wait_stockout_penalty = needed_qty * stockout_penalty_per_unit * 1.2
    wait_total_cost = wait_stockout_penalty
    
    # Option 4: HOLD
    total_excess_units = sum(b for _, b in excess_locs)
    hold_cost = (total_excess_units * holding_cost_per_day * 14) + (needed_qty * stockout_penalty_per_unit)
    hold_total_cost = hold_cost

    # Build comparison matrix
    comparison = [
        {
            "action": "MOVE",
            "title": f"Inter-location Transfer ({source_city} -> {target_city})",
            "quantity": move_possible_qty,
            "cost": round(move_total_cost, 2),
            "lead_time_days": transfer_lead_time,
            "risk_level": "LOW" if move_possible_qty >= needed_qty else "MEDIUM",
            "feasible": move_feasible,
            "details": f"Transfer {move_possible_qty} units from {source_city} excess to {target_city}."
        },
        {
            "action": "BUY",
            "title": f"Procure from Supplier",
            "quantity": buy_qty,
            "cost": round(buy_total_cost, 2),
            "lead_time_days": supplier_lead_time,
            "risk_level": "MEDIUM",
            "feasible": True,
            "details": f"Purchase {buy_qty} units at ${supplier_unit_price}/unit + ${supplier_shipping_flat} shipping."
        },
        {
            "action": "WAIT",
            "title": f"Wait for Demand Update / Incoming Stock",
            "quantity": 0,
            "cost": round(wait_total_cost, 2),
            "lead_time_days": 3.0,
            "risk_level": "HIGH" if needed_qty > 0 else "LOW",
            "feasible": True,
            "details": f"Defer action. High stockout penalty risk if demand persists."
        },
        {
            "action": "HOLD",
            "title": f"Hold Current Status Quo",
            "quantity": 0,
            "cost": round(hold_total_cost, 2),
            "lead_time_days": 0.0,
            "risk_level": "HIGH" if needed_qty > 0 else "MEDIUM",
            "feasible": True,
            "details": f"Do nothing. Incurs holding cost on excess stock and stockout costs at shortage sites."
        }
    ]
    
    # Recommendation logic
    if move_feasible and move_possible_qty >= needed_qty and move_total_cost < buy_total_cost:
        recommended_action = "MOVE"
        savings = round(buy_total_cost - move_total_cost, 2)
        explanation = (
            f"Recommend **MOVE** {move_possible_qty} units from {source_city} to {target_city}. "
            f"{source_city} has {available_excess} excess units while {target_city} faces a shortage of {needed_qty} units. "
            f"Inter-location transfer takes only {transfer_lead_time} days at ${round(move_total_cost, 2)} cost, "
            f"saving ${savings} compared to supplier purchasing (${round(buy_total_cost, 2)} cost, {supplier_lead_time} days lead time)."
        )
    elif needed_qty > 0:
        recommended_action = "BUY"
        explanation = (
            f"Recommend **BUY** {buy_qty} units from supplier. "
            f"Existing excess at other locations is insufficient to cover the shortage of {needed_qty} units at {target_city}."
        )
    elif total_excess_units > 50:
        recommended_action = "HOLD"
        explanation = "Inventory levels meet local forecasted demand. Hold current stock levels."
    else:
        recommended_action = "WAIT"
        explanation = "Stock levels are balanced across all locations. No immediate action required."

    return {
        "sku_id": sku_id,
        "sku_name": sku_name,
        "recommended_action": recommended_action,
        "explanation": explanation,
        "target_location": target_city,
        "source_location": source_city,
        "shortage_quantity": needed_qty,
        "excess_quantity": available_excess,
        "locations": processed_locations,
        "comparison": comparison,
        "is_simulated": bool(overrides)
    }
