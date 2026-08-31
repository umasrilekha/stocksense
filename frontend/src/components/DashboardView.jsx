import React, { useState, useEffect } from 'react';
import { getSummary, getDecisionBySkuLocation } from '../services/api';

export default function DashboardView({ onNavigateToDecision }) {
  const [summary, setSummary] = useState(null);
  const [skuDecision, setSkuDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getSummary().catch(() => null),
      getDecisionBySkuLocation('SKU-104', 'Chennai').catch(() => null)
    ]).then(([summaryData, decisionData]) => {
      if (isMounted) {
        if (!summaryData && !decisionData) {
          setError("Backend connection unavailable.");
        } else {
          setSummary(summaryData);
          setSkuDecision(decisionData);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrencyINR = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '₹0';
    const num = Number(val);
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">Inventory Decision Center</h2>
        <p className="page-subtitle">Multi-location operational intelligence and risk mitigation dashboard.</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px' }}>
          Evaluating multi-location inventory metrics...
        </div>
      )}

      {/* Error / Offline Alert State */}
      {error && !loading && (
        <div className="alert-compact">
          <span>Backend connection unavailable</span>
        </div>
      )}

      {/* KPI Strip */}
      {!loading && summary && (
        <div className="kpi-strip">
          <div className="kpi-box">
            <div className="kpi-label">High Risk SKUs</div>
            <div className="kpi-value rose">
              {String(summary.high_risk_skus ?? summary.high_risk_count ?? 0).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Critical stock imbalances</div>
          </div>

          <div className="kpi-box">
            <div className="kpi-label">Stockout Risks</div>
            <div className="kpi-value amber">
              {String(summary.stockout_risks ?? summary.stockout_count ?? 0).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Locations facing shortage</div>
          </div>

          <div className="kpi-box">
            <div className="kpi-label">Excess Inventory</div>
            <div className="kpi-value">
              {String(summary.excess_inventory ?? summary.excess_count ?? 0).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Over-stocked warehouse sites</div>
          </div>

          <div className="kpi-box">
            <div className="kpi-label">Potential Avoidance</div>
            <div className="kpi-value emerald">
              {formatCurrencyINR(summary.potential_cost_avoidance ?? summary.cost_avoidance ?? 0)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Cost savings via optimal actions</div>
          </div>
        </div>
      )}

      {/* Prominent Decision Required Panel */}
      {!loading && skuDecision && (
        <div className="panel" style={{ borderLeft: '4px solid var(--accent-brick)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="badge badge-high" style={{ marginBottom: '8px' }}>DECISION REQUIRED</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {skuDecision.sku_id} &mdash; {skuDecision.sku_name}
              </h3>
            </div>
            {onNavigateToDecision && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigateToDecision(skuDecision.sku_id, 'Chennai')}
              >
                Evaluate Decision &rarr;
              </button>
            )}
          </div>

          {/* Quick Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', padding: '14px', backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '16px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Target Site</span>
              <strong style={{ color: 'var(--text-primary)' }}>{skuDecision.target_location || 'Chennai'} (SHORTAGE)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Current Stock</span>
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                {skuDecision.locations?.find(l => l.city === 'Chennai')?.current_stock ?? 15} units
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>14-Day Demand</span>
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                {skuDecision.locations?.find(l => l.city === 'Chennai')?.forecast_14d_demand ?? 80} units
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Net Deficit</span>
              <strong style={{ color: 'var(--accent-brick)', fontFamily: 'JetBrains Mono' }}>
                {skuDecision.locations?.find(l => l.city === 'Chennai')?.net_balance ?? -65} units
              </strong>
            </div>
          </div>

          {/* Recommended Action Highlight Banner */}
          <div style={{ backgroundColor: 'var(--accent-green-bg)', border: '1px solid var(--accent-green)', padding: '16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>RECOMMENDED HERO ACTION</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '-0.3px', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                {skuDecision.recommended_action} {skuDecision.shortage_quantity || 65} UNITS
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Transfer stock from {skuDecision.source_location || 'Bangalore'} to {skuDecision.target_location || 'Chennai'}
              </div>
            </div>
            <span className="badge badge-move" style={{ padding: '6px 12px' }}>BEST OPTION</span>
          </div>

          {/* Multi-Location Imbalance Flow Diagram */}
          {skuDecision.locations && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Warehouse Network Imbalance State
              </div>
              <div className="location-nodes-grid">
                {skuDecision.locations.map((loc, idx) => {
                  const isShortage = loc.status === 'SHORTAGE';
                  const isExcess = loc.status === 'EXCESS';

                  return (
                    <div
                      key={idx}
                      className={`location-node ${isShortage ? 'shortage' : isExcess ? 'excess' : ''}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{loc.city}</span>
                        <span className={`badge ${isShortage ? 'badge-high' : isExcess ? 'badge-low' : 'badge-medium'}`}>
                          {loc.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                        <span>Stock: {loc.current_stock}</span>
                        <span>Demand: {loc.forecast_14d_demand}</span>
                      </div>
                      <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: loc.net_balance < 0 ? 'var(--accent-brick)' : 'var(--accent-green)' }}>
                        Net Balance: {loc.net_balance > 0 ? `+${loc.net_balance}` : loc.net_balance}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
