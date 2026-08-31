import React, { useState, useEffect } from 'react';
import { getInventory } from '../services/api';

export default function InventoryView({ selectedSku, onSelectSkuAndNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getInventory()
      .then((data) => {
        if (isMounted) {
          const itemList = Array.isArray(data) ? data : (data?.skus || []);
          setItems(itemList);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Inventory getInventory error:", err);
          setError("Backend connection unavailable.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getRiskBadgeClass = (risk) => {
    const r = (risk || 'MEDIUM').toUpperCase();
    if (r.includes('HIGH')) return 'badge-risk-high';
    if (r.includes('LOW')) return 'badge-risk-low';
    return 'badge-risk-medium';
  };

  const getRecBadgeClass = (rec) => {
    const action = (rec || '').toUpperCase();
    if (action.includes('MOVE')) return 'badge-rec-move';
    if (action.includes('BUY')) return 'badge-rec-buy';
    if (action.includes('WAIT')) return 'badge-rec-wait';
    return 'badge-rec-hold';
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">Inventory Overview</h2>
        <p className="page-subtitle">Multi-location warehouse stock inventory and demand forecast overview.</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Loading inventory records...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert-card">
          <span>{error}</span>
        </div>
      )}

      {/* Inventory Table Container */}
      {!loading && !error && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Location</th>
                <th>Current Stock</th>
                <th>Forecast Demand</th>
                <th>Risk</th>
                <th>Recommendation</th>
                <th>Quantity</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const skuId = item.sku_id || item.sku || `SKU-${idx + 100}`;
                  const isSelected = skuId === selectedSku;
                  const productName = item.product || item.sku_name || item.name || 'N/A';
                  const location = item.location || item.city || item.target_location || 'Chennai';
                  const stock = item.current_stock ?? item.total_stock ?? '-';
                  const demand = item.forecast_demand ?? item.total_demand ?? item.forecast_14d_demand ?? '-';
                  const risk = item.risk ?? item.risk_level ?? (item.status?.includes('Shortage') ? 'HIGH' : 'MEDIUM');
                  const recommendation = item.recommendation ?? item.recommended_action ?? item.status ?? 'EVALUATE';
                  const quantity = item.quantity ?? item.shortage_quantity ?? '-';

                  return (
                    <tr
                      key={idx}
                      className={isSelected ? 'selected' : ''}
                      onClick={() => onSelectSkuAndNavigate(skuId, location)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span className="badge" style={{ backgroundColor: 'var(--bg-surface-alt)', color: 'var(--accent-terracotta)', border: '1px solid var(--border-color)' }}>
                          {skuId}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{productName}</td>
                      <td>{location}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{stock}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{demand}</td>
                      <td>
                        <span className={`badge ${getRiskBadgeClass(risk)}`}>
                          {risk}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getRecBadgeClass(recommendation)}`}>
                          {recommendation}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{quantity}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSkuAndNavigate(skuId, location);
                          }}
                        >
                          View Decision &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
