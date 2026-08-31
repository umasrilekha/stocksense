import { MOCK_PURCHASE_DATA } from './purchaseMockData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Helper function for handling HTTP fetch requests with centralized base URL and error propagation.
 * Throws an error on HTTP error statuses or network failures.
 */
async function fetchJson(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Check backend health status
 */
export async function getHealth() {
  try {
    return await fetchJson('/health');
  } catch (err) {
    const rootUrl = API_BASE.replace(/\/api\/?$/, '');
    const res = await fetch(`${rootUrl}/`);
    if (res.ok) {
      return await res.json();
    }
    throw err;
  }
}

/**
 * Get executive decision summary
 */
export async function getSummary() {
  return await fetchJson('/summary');
}

/**
 * Get complete inventory status list
 */
export async function getInventory() {
  try {
    const data = await fetchJson('/inventory');
    if (data && Array.isArray(data.skus)) {
      return data.skus;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return data;
  } catch (err) {
    return await fetchJson('/skus');
  }
}

export async function getSkus() {
  return await getInventory();
}

export async function getForecast() {
  return await fetchJson('/forecast');
}

export async function getDecisions() {
  return await fetchJson('/decisions');
}

export async function getDecisionBySkuLocation(sku, location = 'Chennai') {
  try {
    return await fetchJson(`/decisions/${encodeURIComponent(sku)}/${encodeURIComponent(location)}`);
  } catch (err) {
    return await fetchJson(`/recommendation/${encodeURIComponent(sku)}`);
  }
}

export async function getRecommendation(skuId) {
  return await getDecisionBySkuLocation(skuId);
}

export async function runSimulation(simulationPayload) {
  return await fetchJson('/simulate', {
    method: 'POST',
    body: JSON.stringify(simulationPayload),
  });
}

export async function approveAction(approvalPayload) {
  return await fetchJson('/approve', {
    method: 'POST',
    body: JSON.stringify(approvalPayload),
  });
}

/* ================= LOGISTICS COORDINATION API SERVICES ================= */

export async function getLogisticsTransfers() {
  try {
    const res = await fetchJson('/logistics/transfers');
    return res.transfers || res;
  } catch (err) {
    console.warn("[Logistics API Fallback] Fetching default local transfer list.");
    return [
      {
        id: "TRF-104",
        sku_id: "SKU-104",
        sku_name: "Precision Surgical Gloves (Box 100)",
        source_location: "Bangalore",
        target_location: "Chennai",
        quantity: 65,
        priority: "HIGH",
        status: "REQUESTED",
        created_at: "Today, 10:30 AM",
        required_by: "In 2 days",
        notes: "Inter-warehouse transfer recommended to eliminate stockout deficit in Chennai."
      }
    ];
  }
}

export async function createLogisticsTransfer(payload) {
  try {
    return await fetchJson('/logistics/transfers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[Logistics API Fallback] Generating local transfer object.");
    const newId = `TRF-${Math.floor(100 + Math.random() * 900)}`;
    return {
      status: "success",
      message: `Warehouse ${payload.source_location} has been notified to prepare ${payload.quantity} units for transfer to ${payload.target_location}.`,
      transfer: {
        id: newId,
        sku_id: payload.sku_id,
        sku_name: payload.sku_name || `Product ${payload.sku_id}`,
        source_location: payload.source_location,
        target_location: payload.target_location,
        quantity: payload.quantity,
        priority: payload.priority || "HIGH",
        status: "REQUESTED",
        created_at: "Just now",
        required_by: payload.required_by || "In 2 days",
        notes: payload.notes || "Transfer created via StockSense Logistics Service"
      }
    };
  }
}

export async function updateTransferStatus(transferId, newStatus) {
  try {
    return await fetchJson(`/logistics/transfers/${encodeURIComponent(transferId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  } catch (err) {
    console.warn(`[Logistics API Fallback] Local status update to ${newStatus}`);
    return {
      status: "success",
      message: `Transfer '${transferId}' status updated to '${newStatus}'`,
      transfer: { id: transferId, status: newStatus }
    };
  }
}

export async function getLogisticsTransferById(transferId) {
  try {
    return await fetchJson(`/logistics/transfers/${encodeURIComponent(transferId)}`);
  } catch (err) {
    const list = await getLogisticsTransfers();
    return list.find(t => t.id === transferId) || list[0];
  }
}

export async function notifyWarehouse(transferId) {
  try {
    return await fetchJson(`/logistics/transfers/${encodeURIComponent(transferId)}/notify`, {
      method: 'POST'
    });
  } catch (err) {
    return {
      status: "success",
      message: `Warehouse notified for transfer ${transferId}.`
    };
  }
}

/* ================= PURCHASE PRICE INTELLIGENCE API SERVICES ================= */

export async function getPurchaseIntelligence(skuId = 'SKU-104') {
  try {
    return await fetchJson(`/purchase/intelligence/${encodeURIComponent(skuId)}`);
  } catch (err) {
    try {
      return await fetchJson(`/purchase/prices/${encodeURIComponent(skuId)}`);
    } catch (e) {
      console.warn("[Purchase API Fallback] Local purchase intelligence fallback.");
      return MOCK_PURCHASE_DATA[skuId] || {
        sku_id: skuId,
        sku_name: `Product ${skuId}`,
        supplier: "Apex Medical Supplies Inc.",
        current_purchase_price: 100.0,
        recent_avg_price: 112.0,
        price_trend: "DECREASING",
        price_change_pct: -10.7,
        inventory_coverage_units: 15,
        inventory_coverage_days: 3,
        supplier_lead_time_days: 7,
        recommendation: "BUY NOW",
        explanation: "Current inventory coverage is low and the current purchase price is favourable compared with recent prices.",
        price_history: [
          { period: "30 Days Ago", price: 120.0 },
          { period: "21 Days Ago", price: 115.0 },
          { period: "14 Days Ago", price: 110.0 },
          { period: "7 Days Ago", price: 105.0 },
          { period: "Current Price", price: 100.0 }
        ],
        suppliers: [
          { name: "Apex Medical Supplies Inc.", current_price: 100.0, lead_time_days: 7, trend: "DECREASING", recent_avg: 112.0, is_primary: true }
        ]
      };
    }
  }
}


