import datetime
from typing import Dict, Any, List, Optional

# In-memory storage for transfers and notifications
transfers_db: Dict[str, Dict[str, Any]] = {}
notifications_db: List[Dict[str, Any]] = []

STATUS_FLOW = [
    "REQUESTED",
    "WAREHOUSE_CONFIRMED",
    "PREPARING",
    "DISPATCHED",
    "IN_TRANSIT",
    "DELIVERED"
]

def init_demo_logistics_data():
    """Initializes demo transfer TR-001 for SKU-104 (Bangalore -> Chennai)"""
    if "TR-001" not in transfers_db:
        create_transfer_request({
            "transfer_id": "TR-001",
            "sku": "SKU-104",
            "product": "Precision Surgical Gloves (Box 100)",
            "source": "Bangalore",
            "destination": "Chennai",
            "quantity": 80,
            "priority": "HIGH",
            "required_days": 3
        })

def create_transfer_request(data: Dict[str, Any]) -> Dict[str, Any]:
    transfer_id = data.get("transfer_id") or f"TR-00{len(transfers_db) + 1}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    
    transfer = {
        "transfer_id": transfer_id,
        "sku": data.get("sku", "SKU-104"),
        "product": data.get("product", "Laptop / Component"),
        "source": data.get("source", "Bangalore"),
        "destination": data.get("destination", "Chennai"),
        "quantity": int(data.get("quantity", 80)),
        "priority": data.get("priority", "HIGH"),
        "required_days": int(data.get("required_days", 3)),
        "status": "REQUESTED",
        "created_at": now_str,
        "updated_at": now_str,
        "transport": {
            "transport_id": f"TP-{transfer_id}",
            "carrier": "StockSense Express Logistics",
            "dispatch_date": "Pending Dispatch",
            "expected_delivery": f"In {data.get('required_days', 3)} Days",
            "driver_contact": "Simulated Carrier Logistics"
        },
        "history": [
            {
                "status": "REQUESTED",
                "timestamp": now_str,
                "note": f"Transfer request generated for {data.get('quantity', 80)} units from {data.get('source', 'Bangalore')} to {data.get('destination', 'Chennai')}."
            }
        ]
    }
    
    transfers_db[transfer_id] = transfer
    
    # Store notification
    add_notification(
        transfer_id=transfer_id,
        message=f"Warehouse {transfer['source']} has been notified to prepare {transfer['quantity']} units of {transfer['sku']} for transfer to {transfer['destination']}."
    )
    
    return transfer

def get_all_transfers() -> List[Dict[str, Any]]:
    init_demo_logistics_data()
    return list(transfers_db.values())

def get_transfer_by_id(transfer_id: str) -> Optional[Dict[str, Any]]:
    init_demo_logistics_data()
    return transfers_db.get(transfer_id)

def update_transfer_status(transfer_id: str, new_status: str, note: Optional[str] = None) -> Optional[Dict[str, Any]]:
    init_demo_logistics_data()
    transfer = transfers_db.get(transfer_id)
    if not transfer:
        return None
    
    new_status_upper = new_status.upper().replace(" ", "_")
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    
    transfer["status"] = new_status_upper
    transfer["updated_at"] = now_str
    
    if new_status_upper == "DISPATCHED":
        transfer["transport"]["dispatch_date"] = now_str
    elif new_status_upper == "DELIVERED":
        transfer["transport"]["expected_delivery"] = f"Delivered at {now_str}"
        
    status_note = note or f"Status updated to {new_status_upper}."
    transfer["history"].append({
        "status": new_status_upper,
        "timestamp": now_str,
        "note": status_note
    })
    
    # Add notification for status change
    add_notification(
        transfer_id=transfer_id,
        message=f"Shipment {transfer_id} ({transfer['sku']}): Status changed to {new_status_upper} ({transfer['source']} -> {transfer['destination']})."
    )
    
    return transfer

def add_notification(transfer_id: str, message: str) -> Dict[str, Any]:
    now_str = datetime.datetime.now().strftime("%H:%M:%S")
    notif = {
        "id": len(notifications_db) + 1,
        "transfer_id": transfer_id,
        "message": message,
        "timestamp": now_str,
        "type": "LOGISTICS_UPDATE"
    }
    notifications_db.insert(0, notif) # Most recent first
    return notif

def get_all_notifications() -> List[Dict[str, Any]]:
    return notifications_db

# Initialize data on import
init_demo_logistics_data()
