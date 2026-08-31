/**
 * Dedicated Mock Data File for Purchase Price Intelligence
 * Contains structured inventory purchase price data, price history, supplier options, and decision recommendations.
 */

export const MOCK_PURCHASE_DATA = {
  "SKU-104": {
    sku_id: "SKU-104",
    sku_name: "Precision Surgical Gloves (Box 100)",
    supplier: "Apex Medical Supplies Inc.",
    current_purchase_price: 100.0,
    recent_avg_price: 112.0,
    price_trend: "DECREASING",
    price_change_pct: -10.7,
    inventory_coverage_units: 15,
    inventory_coverage_days: 3,
    supplier_lead_time_days: 7,
    recommendation: "BUY NOW",
    explanation: "Inventory coverage is low (15 units) and current unit purchase price is 10.7% below the 30-day average. Favourable window to order.",
    price_history: [
      { period: "30 Days Ago", price: 120.0 },
      { period: "21 Days Ago", price: 115.0 },
      { period: "14 Days Ago", price: 110.0 },
      { period: "7 Days Ago", price: 105.0 },
      { period: "Current Price", price: 100.0 }
    ],
    suppliers: [
      { name: "Apex Medical Supplies Inc.", current_price: 100.0, lead_time_days: 7, trend: "DECREASING", recent_avg: 112.0, is_primary: true },
      { name: "BioCare Health Logistics", current_price: 108.0, lead_time_days: 5, trend: "STABLE", recent_avg: 109.0, is_primary: false },
      { name: "MedTech Distribution Hub", current_price: 112.0, lead_time_days: 10, trend: "INCREASING", recent_avg: 105.0, is_primary: false }
    ]
  },
  "SKU-101": {
    sku_id: "SKU-101",
    sku_name: "Industrial N95 Respirators (Pack 50)",
    supplier: "SafetyShield Global Co.",
    current_purchase_price: 450.0,
    recent_avg_price: 410.0,
    price_trend: "INCREASING",
    price_change_pct: 9.7,
    inventory_coverage_units: 85,
    inventory_coverage_days: 21,
    supplier_lead_time_days: 5,
    recommendation: "WAIT",
    explanation: "Current inventory covers 21 days of demand and recent purchase price has surged by 9.7%. Defer purchase until prices stabilize.",
    price_history: [
      { period: "30 Days Ago", price: 400.0 },
      { period: "21 Days Ago", price: 410.0 },
      { period: "14 Days Ago", price: 425.0 },
      { period: "7 Days Ago", price: 440.0 },
      { period: "Current Price", price: 450.0 }
    ],
    suppliers: [
      { name: "SafetyShield Global Co.", current_price: 450.0, lead_time_days: 5, trend: "INCREASING", recent_avg: 410.0, is_primary: true },
      { name: "ProGuard Safety Equipment", current_price: 435.0, lead_time_days: 8, trend: "STABLE", recent_avg: 430.0, is_primary: false },
      { name: "Vanguard Direct Supplies", current_price: 460.0, lead_time_days: 4, trend: "INCREASING", recent_avg: 420.0, is_primary: false }
    ]
  },
  "SKU-102": {
    sku_id: "SKU-102",
    sku_name: "Digital Infusion Pumps",
    supplier: "OmniHealth Solutions",
    current_purchase_price: 1250.0,
    recent_avg_price: 1250.0,
    price_trend: "STABLE",
    price_change_pct: 0.0,
    inventory_coverage_units: 40,
    inventory_coverage_days: 14,
    supplier_lead_time_days: 12,
    recommendation: "WAIT",
    explanation: "Current inventory coverage is adequate for 14 days and purchase price remains stable at baseline average. Routine reorder window.",
    price_history: [
      { period: "30 Days Ago", price: 1250.0 },
      { period: "21 Days Ago", price: 1250.0 },
      { period: "14 Days Ago", price: 1250.0 },
      { period: "7 Days Ago", price: 1250.0 },
      { period: "Current Price", price: 1250.0 }
    ],
    suppliers: [
      { name: "OmniHealth Solutions", current_price: 1250.0, lead_time_days: 12, trend: "STABLE", recent_avg: 1250.0, is_primary: true }
    ]
  }
};
