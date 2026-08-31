from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from data_loader import (
    get_all_skus, 
    get_sku_data, 
    get_inventory_summary, 
    get_all_forecasts, 
    get_all_decisions
)
from decision_engine import evaluate_inventory_decision

app = FastAPI(
    title="StockSense API",
    description="Inventory Decision Intelligence MVP API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationRequest(BaseModel):
    sku_id: str
    source_available_stock: Optional[int] = None
    source_location_city: Optional[str] = "Bangalore"
    transfer_cost_per_unit: Optional[float] = None
    supplier_lead_time_days: Optional[int] = None
    demand_surge_percent: Optional[float] = 0.0

class ApprovalRequest(BaseModel):
    sku_id: str
    action: str
    approved_by: str = "Demo User"
    notes: Optional[str] = None

# Store approvals in memory
approvals_db = []

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "StockSense MVP Backend",
        "version": "1.0.0",
        "message": "Inventory Decision Intelligence API is running"
    }

@app.get("/api/health")
def get_health():
    return {
        "status": "ok",
        "app": "StockSense MVP Backend",
        "version": "1.0.0"
    }

@app.get("/api/summary")
def get_summary():
    return get_inventory_summary()

@app.get("/api/inventory")
def get_inventory():
    return {"skus": get_all_skus()}

@app.get("/api/skus")
def list_skus():
    return get_all_skus()

@app.get("/api/forecast")
def get_forecast():
    return get_all_forecasts()

@app.get("/api/decisions")
def get_decisions():
    return get_all_decisions()

@app.get("/api/decisions/{sku}/{location}")
def get_decision_by_sku_location(sku: str, location: str):
    sku_data = get_sku_data(sku)
    if not sku_data:
        raise HTTPException(status_code=404, detail=f"SKU '{sku}' not found")
    
    result = evaluate_inventory_decision(sku_data)
    if location:
        result["target_location"] = location
    return result

@app.get("/api/recommendation/{sku_id}")
def get_recommendation(sku_id: str):
    sku_data = get_sku_data(sku_id)
    if not sku_data:
        raise HTTPException(status_code=404, detail=f"SKU '{sku_id}' not found")
    
    result = evaluate_inventory_decision(sku_data)
    return result

@app.post("/api/simulate")
def run_simulation(req: SimulationRequest):
    sku_data = get_sku_data(req.sku_id)
    if not sku_data:
        raise HTTPException(status_code=404, detail=f"SKU '{req.sku_id}' not found")
    
    overrides = {}
    if req.source_available_stock is not None:
        overrides["source_available_stock"] = req.source_available_stock
    if req.source_location_city:
        overrides["source_location_city"] = req.source_location_city
    if req.transfer_cost_per_unit is not None:
        overrides["inter_location_transfer_rate"] = req.transfer_cost_per_unit
    if req.supplier_lead_time_days is not None:
        overrides["supplier_lead_time_days"] = req.supplier_lead_time_days
    if req.demand_surge_percent is not None:
        overrides["demand_surge_percent"] = req.demand_surge_percent
        
    result = evaluate_inventory_decision(sku_data, overrides)
    return result

class TransferCreateRequest(BaseModel):
    sku_id: str
    sku_name: Optional[str] = None
    source_location: str
    target_location: str
    quantity: int
    priority: Optional[str] = "HIGH"
    required_by: Optional[str] = "In 2 days"
    notes: Optional[str] = None

class TransferStatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None

# In-memory storage for logistics transfers
transfers_db = [
    {
        "id": "TRF-104",
        "sku_id": "SKU-104",
        "sku_name": "Precision Surgical Gloves (Box 100)",
        "source_location": "Bangalore",
        "target_location": "Chennai",
        "quantity": 65,
        "priority": "HIGH",
        "status": "REQUESTED",
        "created_at": "Today, 10:30 AM",
        "required_by": "In 2 days",
        "notes": "Inter-warehouse transfer recommended to eliminate stockout deficit in Chennai."
    }
]

# Purchase price intelligence data
purchase_db = {
    "SKU-104": {
        "sku_id": "SKU-104",
        "sku_name": "Precision Surgical Gloves (Box 100)",
        "supplier": "Apex Medical Supplies Inc.",
        "current_purchase_price": 100.0,
        "recent_avg_price": 112.0,
        "price_trend": "DECREASING",
        "price_change_pct": -10.7,
        "inventory_coverage_units": 15,
        "inventory_coverage_days": 3,
        "supplier_lead_time_days": 7,
        "recommendation": "BUY NOW",
        "explanation": "Inventory coverage is low (15 units) and current purchase price is 10.7% below the 30-day average. Favourable window to order.",
        "price_history": [
            {"period": "30 Days Ago", "price": 120.0},
            {"period": "21 Days Ago", "price": 115.0},
            {"period": "14 Days Ago", "price": 110.0},
            {"period": "7 Days Ago", "price": 105.0},
            {"period": "Current Price", "price": 100.0}
        ]
    },
    "SKU-101": {
        "sku_id": "SKU-101",
        "sku_name": "Industrial N95 Respirators (Pack 50)",
        "supplier": "SafetyShield Global Co.",
        "current_purchase_price": 450.0,
        "recent_avg_price": 410.0,
        "price_trend": "INCREASING",
        "price_change_pct": 9.7,
        "inventory_coverage_units": 85,
        "inventory_coverage_days": 21,
        "supplier_lead_time_days": 5,
        "recommendation": "WAIT",
        "explanation": "Current inventory covers 21 days of demand and recent purchase price has surged by 9.7%. Defer purchase until prices stabilize.",
        "price_history": [
            {"period": "30 Days Ago", "price": 400.0},
            {"period": "21 Days Ago", "price": 410.0},
            {"period": "14 Days Ago", "price": 425.0},
            {"period": "7 Days Ago", "price": 440.0},
            {"period": "Current Price", "price": 450.0}
        ]
    }
}

@app.post("/api/approve")
def approve_action(req: ApprovalRequest):
    record = {
        "id": len(approvals_db) + 1,
        "sku_id": req.sku_id,
        "action": req.action,
        "approved_by": req.approved_by,
        "notes": req.notes or "Action approved during demo session",
        "timestamp": "Just now"
    }
    approvals_db.append(record)
    return {
        "status": "success",
        "message": f"Action '{req.action}' approved for {req.sku_id}",
        "approval": record
    }

# Logistics Coordination Endpoints
@app.get("/api/logistics/transfers")
def get_logistics_transfers():
    return {"transfers": transfers_db}

@app.post("/api/logistics/transfers")
def create_logistics_transfer(req: TransferCreateRequest):
    new_id = f"TRF-{100 + len(transfers_db) + 1}"
    record = {
        "id": new_id,
        "sku_id": req.sku_id,
        "sku_name": req.sku_name or f"Product {req.sku_id}",
        "source_location": req.source_location,
        "target_location": req.target_location,
        "quantity": req.quantity,
        "priority": req.priority or "HIGH",
        "status": "REQUESTED",
        "created_at": "Just now",
        "required_by": req.required_by or "In 2 days",
        "notes": req.notes or "Transfer order dispatched via StockSense Logistics Decision System"
    }
    transfers_db.insert(0, record)
    return {
        "status": "success",
        "message": f"Warehouse {req.source_location} has been notified to prepare {req.quantity} units for transfer to {req.target_location}.",
        "transfer": record
    }

@app.get("/api/logistics/transfers/{transfer_id}")
def get_logistics_transfer_by_id(transfer_id: str):
    trf = next((t for t in transfers_db if t["id"] == transfer_id), None)
    if not trf:
        raise HTTPException(status_code=404, detail=f"Transfer '{transfer_id}' not found")
    return trf

@app.patch("/api/logistics/transfers/{transfer_id}/status")
def update_logistics_transfer_status(transfer_id: str, req: TransferStatusUpdateRequest):
    trf = next((t for t in transfers_db if t["id"] == transfer_id), None)
    if not trf:
        raise HTTPException(status_code=404, detail=f"Transfer '{transfer_id}' not found")
    trf["status"] = req.status
    if req.notes:
        trf["notes"] = req.notes
    return {
        "status": "success",
        "message": f"Transfer '{transfer_id}' status updated to '{req.status}'",
        "transfer": trf
    }

@app.post("/api/logistics/transfers/{transfer_id}/notify")
def notify_warehouse(transfer_id: str):
    trf = next((t for t in transfers_db if t["id"] == transfer_id), None)
    if not trf:
        raise HTTPException(status_code=404, detail=f"Transfer '{transfer_id}' not found")
    return {
        "status": "success",
        "message": f"Warehouse {trf['source_location']} notified for transfer {transfer_id}."
    }

# Purchase Price Intelligence Endpoints
@app.get("/api/purchase/intelligence/{sku_id}")
def get_purchase_intelligence(sku_id: str):
    data = purchase_db.get(sku_id)
    if not data:
        # Default fallback intelligence structure
        data = {
            "sku_id": sku_id,
            "sku_name": f"Product {sku_id}",
            "supplier": "Global Logistics & Supplies Co.",
            "current_purchase_price": 120.0,
            "recent_avg_price": 130.0,
            "price_trend": "DECREASING",
            "price_change_pct": -7.7,
            "inventory_coverage_units": 20,
            "inventory_coverage_days": 4,
            "supplier_lead_time_days": 7,
            "recommendation": "BUY NOW",
            "explanation": "Inventory coverage is low and current unit purchase price is 7.7% below recent 30-day average.",
            "price_history": [
                {"period": "30 Days Ago", "price": 140.0},
                {"period": "21 Days Ago", "price": 135.0},
                {"period": "14 Days Ago", "price": 132.0},
                {"period": "7 Days Ago", "price": 128.0},
                {"period": "Current Price", "price": 120.0}
            ]
        }
    return data

@app.get("/api/purchase/prices/{sku_id}")
def get_purchase_prices(sku_id: str):
    return get_purchase_intelligence(sku_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)



