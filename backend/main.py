from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from data_loader import get_all_skus, get_sku_data
from decision_engine import evaluate_inventory_decision
import logistics_engine

app = FastAPI(
    title="StockSense API",
    description="Inventory Decision Intelligence & Logistics Coordination MVP API",
    version="1.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
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

class CreateTransferRequest(BaseModel):
    sku: str
    product: Optional[str] = None
    source: str
    destination: str
    quantity: int
    priority: Optional[str] = "HIGH"
    required_days: Optional[int] = 3

class UpdateStatusRequest(BaseModel):
    status: str
    note: Optional[str] = None

class NotifyRequest(BaseModel):
    message: str

# Store approvals in memory
approvals_db = []

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "StockSense Backend",
        "version": "1.1.0",
        "modules": ["Demand & Decision Engine", "Logistics Coordination"],
        "message": "Inventory Decision & Execution API is running"
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

# =========================================================
# PERSON 3 - LOGISTICS COORDINATION ENDPOINTS
# =========================================================

@app.post("/api/logistics/transfers")
def create_logistics_transfer(req: CreateTransferRequest):
    transfer = logistics_engine.create_transfer_request(req.dict())
    return {
        "status": "success",
        "message": f"Transfer request {transfer['transfer_id']} created successfully",
        "transfer": transfer
    }

@app.get("/api/logistics/transfers")
def list_logistics_transfers():
    transfers = logistics_engine.get_all_transfers()
    notifications = logistics_engine.get_all_notifications()
    return {
        "transfers": transfers,
        "notifications": notifications
    }

@app.get("/api/logistics/transfers/{transfer_id}")
def get_logistics_transfer(transfer_id: str):
    transfer = logistics_engine.get_transfer_by_id(transfer_id)
    if not transfer:
        raise HTTPException(status_code=404, detail=f"Transfer '{transfer_id}' not found")
    return transfer

@app.patch("/api/logistics/transfers/{transfer_id}/status")
def update_logistics_status(transfer_id: str, req: UpdateStatusRequest):
    updated = logistics_engine.update_transfer_status(transfer_id, req.status, req.note)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Transfer '{transfer_id}' not found")
    return {
        "status": "success",
        "message": f"Transfer {transfer_id} updated to {updated['status']}",
        "transfer": updated
    }

@app.post("/api/logistics/transfers/{transfer_id}/notify")
def notify_warehouse(transfer_id: str, req: NotifyRequest):
    transfer = logistics_engine.get_transfer_by_id(transfer_id)
    if not transfer:
        raise HTTPException(status_code=404, detail=f"Transfer '{transfer_id}' not found")
    
    notif = logistics_engine.add_notification(transfer_id, req.message)
    return {
        "status": "success",
        "notification": notif
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
