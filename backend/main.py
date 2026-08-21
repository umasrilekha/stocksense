from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from data_loader import get_all_skus, get_sku_data
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

@app.get("/api/inventory")
def get_inventory():
    return {"skus": get_all_skus()}

@app.get("/api/skus")
def list_skus():
    return get_all_skus()

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
