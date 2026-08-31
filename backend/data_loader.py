import json
import os
import pandas as pd

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sample_inventory.json"))

def load_inventory_data():
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"skus": []}

def get_sku_data(sku_id: str):
    data = load_inventory_data()
    for item in data.get("skus", []):
        if item["sku_id"].upper() == sku_id.upper():
            return item
    return None

def get_all_skus():
    data = load_inventory_data()
    result = []
    from decision_engine import evaluate_inventory_decision

    for item in data.get("skus", []):
        total_stock = sum(loc["current_stock"] for loc in item["locations"])
        total_demand = sum(loc["forecast_14d_demand"] for loc in item["locations"])
        decision = evaluate_inventory_decision(item)

        has_shortage = any(loc["current_stock"] < loc["forecast_14d_demand"] for loc in item["locations"])
        has_excess = any((loc["current_stock"] - loc["forecast_14d_demand"]) > 30 for loc in item["locations"])

        status = "Balanced"
        if has_shortage and has_excess:
            status = "Imbalanced (Shortage + Excess)"
        elif has_shortage:
            status = "Shortage"
        elif has_excess:
            status = "Excess Stock"

        result.append({
            "sku_id": item["sku_id"],
            "sku": item["sku_id"],
            "name": item["name"],
            "sku_name": item["name"],
            "category": item["category"],
            "total_stock": total_stock,
            "total_demand": total_demand,
            "current_stock": total_stock,
            "forecast_demand": total_demand,
            "status": status,
            "locations_count": len(item["locations"]),
            "risk": "HIGH" if has_shortage else ("LOW" if not has_excess else "MEDIUM"),
            "recommendation": decision.get("recommended_action", "HOLD"),
            "quantity": decision.get("shortage_quantity", 0) or decision.get("excess_quantity", 0),
            "target_location": decision.get("target_location", "Chennai")
        })
    return result

def get_inventory_summary():
    data = load_inventory_data()
    from decision_engine import evaluate_inventory_decision

    high_risk = 0
    stockout_count = 0
    excess_count = 0
    total_savings = 0.0

    for item in data.get("skus", []):
        decision = evaluate_inventory_decision(item)
        shortage = decision.get("shortage_quantity", 0)
        excess = decision.get("excess_quantity", 0)
        
        if shortage > 0:
            high_risk += 1
            stockout_count += 1
        if excess > 0:
            excess_count += 1
            
        comp = decision.get("comparison", [])
        buy_cost = next((c["cost"] for c in comp if c["action"] == "BUY"), 0)
        move_cost = next((c["cost"] for c in comp if c["action"] == "MOVE" and c["feasible"]), 0)
        if buy_cost > 0 and move_cost > 0 and buy_cost > move_cost:
            total_savings += (buy_cost - move_cost)

    return {
        "high_risk_skus": high_risk,
        "high_risk_count": high_risk,
        "stockout_risks": stockout_count,
        "stockout_count": stockout_count,
        "excess_inventory": excess_count,
        "excess_count": excess_count,
        "potential_cost_avoidance": round(total_savings, 2),
        "cost_avoidance": round(total_savings, 2)
    }

def get_all_forecasts():
    data = load_inventory_data()
    forecasts = []
    for item in data.get("skus", []):
        for loc in item["locations"]:
            forecasts.append({
                "sku_id": item["sku_id"],
                "sku_name": item["name"],
                "location": loc["city"],
                "current_stock": loc["current_stock"],
                "safety_stock": loc["safety_stock"],
                "forecast_14d_demand": loc["forecast_14d_demand"],
                "net_balance": loc["current_stock"] - loc["forecast_14d_demand"]
            })
    return forecasts

def get_all_decisions():
    data = load_inventory_data()
    from decision_engine import evaluate_inventory_decision
    decisions = []
    for item in data.get("skus", []):
        decisions.append(evaluate_inventory_decision(item))
    return decisions

