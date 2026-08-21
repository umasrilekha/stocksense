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
    for item in data.get("skus", []):
        total_stock = sum(loc["current_stock"] for loc in item["locations"])
        total_demand = sum(loc["forecast_14d_demand"] for loc in item["locations"])
        has_shortage = any(loc["current_stock"] < loc["forecast_14d_demand"] for loc in item["locations"])
        has_excess = any((loc["current_stock"] - loc["forecast_14d_demand"]) > 50 for loc in item["locations"])
        
        status = "Balanced"
        if has_shortage and has_excess:
            status = "Imbalanced (Shortage + Excess)"
        elif has_shortage:
            status = "Shortage"
        elif has_excess:
            status = "Excess Stock"

        result.append({
            "sku_id": item["sku_id"],
            "name": item["name"],
            "category": item["category"],
            "total_stock": total_stock,
            "total_demand": total_demand,
            "status": status,
            "locations_count": len(item["locations"])
        })
    return result
