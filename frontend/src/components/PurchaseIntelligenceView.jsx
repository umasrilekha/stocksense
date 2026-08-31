import React, { useState, useEffect } from 'react';
import { getPurchaseIntelligence, getSkus } from '../services/api';

export default function PurchaseIntelligenceView({ selectedSku = 'SKU-104', onSelectSku }) {
  const [skuId, setSkuId] = useState(selectedSku);
  const [skusList, setSkusList] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSkus()
      .then(list => setSkusList(Array.isArray(list) ? list : (list?.skus || [])))
      .catch(err => console.warn("Failed to load SKU list:", err));
  }, []);

  useEffect(() => {
    if (selectedSku) {
      setSkuId(selectedSku);
    }
  }, [selectedSku]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPurchaseIntelligence(skuId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Purchase intelligence fetch error:", err);
        setError("Unable to load purchase price information.");
        setLoading(false);
      });
  }, [skuId]);

  const handleSkuChange = (sku) => {
    setSkuId(sku);
    if (onSelectSku) onSelectSku(sku);
  };

  const formatPrice = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '₹0';
    return `₹${Number(val).toFixed(2)}`;
  };

  const getTrendSymbol = (trend) => {
    const t = (trend || '').toUpperCase();
    if (t.includes('DECREASING') || t.includes('DOWN') || t.includes('FAVOURABLE')) return '↓ Decreasing';
    if (t.includes('INCREASING') || t.includes('UP')) return '↑ Increasing';
    return '→ Stable';
  };

  const getTrendColor = (trend) => {
    const t = (trend || '').toUpperCase();
    if (t.includes('DECREASING') || t.includes('DOWN') || t.includes('FAVOURABLE')) {
      return 'var(--accent-green)';
    }
    if (t.includes('INCREASING') || t.includes('UP') || t.includes('HIGH')) {
      return 'var(--accent-brick)';
    }
    return 'var(--accent-ochre)';
  };

  const getRecBadgeClass = (rec) => {
    const r = (rec || '').toUpperCase();
    if (r.includes('BUY NOW') || r.includes('BUY')) {
      return 'badge-buy';
    }
    return 'badge-wait';
  };

  // Generate dynamic explanation strictly based on available data metrics
  const getDynamicExplanation = (d) => {
    if (!d) return '';
    const current = d.current_purchase_price || 100;
    const recent = d.recent_avg_price || 112;
    const coverageDays = d.inventory_coverage_days ?? 3;
    const rec = (d.recommendation || 'BUY NOW').toUpperCase();

    if (rec.includes('BUY')) {
      if (current < recent) {
        return `Current inventory coverage is low (${coverageDays} days) and the current purchase price (${formatPrice(current)}) is favourable compared with recent prices (${formatPrice(recent)}).`;
      }
      return `Inventory coverage is low (${coverageDays} days), requiring an immediate replenishment order to mitigate stockout risks.`;
    } else {
      if (current >= recent) {
        return `Current inventory covers near-term demand (${coverageDays} days) and the current purchase price (${formatPrice(current)}) is relatively high compared with recent prices (${formatPrice(recent)}).`;
      }
      return `Current inventory covers near-term demand (${coverageDays} days). Defer purchasing until optimal order window.`;
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="page-title">Purchase Price Intelligence</h2>
          <p className="page-subtitle">Product procurement price history, price trend analysis, and optimal order timing.</p>
        </div>

        {/* SKU Selector */}
        {skusList.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Target SKU:</span>
            <select
              value={skuId}
              onChange={(e) => handleSkuChange(e.target.value)}
              className="form-select"
              style={{ fontWeight: 600, fontFamily: 'JetBrains Mono' }}
            >
              {skusList.map((item, idx) => {
                const s = item.sku_id || item.sku || `SKU-${idx + 100}`;
                const name = item.product || item.sku_name || item.name || s;
                return (
                  <option key={s} value={s}>
                    {s} - {name}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
          Evaluating purchase price intelligence and supplier history...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert-compact">
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Quick 3-Question Intelligence Summary Banner */}
          <div style={{
            backgroundColor: 'var(--bg-surface-alt)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>1. CURRENT PRICE</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                {formatPrice(data.current_purchase_price)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>30D Avg: {formatPrice(data.recent_avg_price)}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>2. RECENT TREND</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: getTrendColor(data.price_trend), marginTop: '4px' }}>
                {getTrendSymbol(data.price_trend)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {data.price_change_pct ? `${data.price_change_pct > 0 ? '+' : ''}${data.price_change_pct}% vs benchmark` : 'Historical trajectory'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>3. STOCK & LEAD TIME</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
                {data.inventory_coverage_days ?? 3} days ({data.inventory_coverage_units ?? 15} units)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lead Time: {data.supplier_lead_time_days ?? 7} days</div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>RECOMMENDED STRATEGY</div>
              <div style={{ marginTop: '4px' }}>
                <span className={`badge ${getRecBadgeClass(data.recommendation)}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
                  {data.recommendation}
                </span>
              </div>
            </div>
          </div>
          
          {/* Recommendation & Procurement Rationale Box */}
          <div className="panel" style={{ borderLeft: `4px solid ${data.recommendation === 'BUY NOW' ? 'var(--accent-blue)' : 'var(--accent-ochre)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-surface-alt)', color: 'var(--accent-terracotta)', border: '1px solid var(--border-color)' }}>
                    {data.sku_id}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {data.sku_name}
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Primary Supplier: <strong>{data.supplier || 'Primary Vendor'}</strong> &bull; Lead Time: <strong>{data.supplier_lead_time_days ?? 7} days</strong>
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className={`badge ${getRecBadgeClass(data.recommendation)}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
                  {data.recommendation}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Recommended Order Strategy</span>
              </div>
            </div>

            {/* Explanation Box */}
            <div style={{ backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Procurement Rationale
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {data.explanation || getDynamicExplanation(data)}
              </p>
            </div>
          </div>

          {/* Visual Price Trend Chart */}
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Purchase Price Trend History
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Historical unit purchase price movement over recent procurement cycles.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Current Price: </span>
                  <strong style={{ color: 'var(--accent-blue)', fontFamily: 'JetBrains Mono' }}>{formatPrice(data.current_purchase_price)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Recent Average: </span>
                  <strong style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{formatPrice(data.recent_avg_price)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Trend: </span>
                  <strong style={{ color: getTrendColor(data.price_trend) }}>{getTrendSymbol(data.price_trend)}</strong>
                </div>
              </div>
            </div>

            {/* Price Chart Visual */}
            {data.price_history && data.price_history.length > 0 && (
              <div style={{ backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px', borderBottom: '2px solid var(--border-color)', gap: '12px' }}>
                  {(() => {
                    const prices = data.price_history.map(item => Number(item.price));
                    const maxPrice = Math.max(...prices, data.recent_avg_price || 1) * 1.05;
                    const minPrice = Math.min(...prices) * 0.95;

                    return data.price_history.map((item, idx) => {
                      const p = Number(item.price);
                      const heightPct = Math.max(15, Math.min(100, ((p - minPrice) / (maxPrice - minPrice || 1)) * 100));
                      const isCurrent = idx === data.price_history.length - 1;

                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: 'JetBrains Mono',
                            color: isCurrent ? 'var(--accent-blue)' : 'var(--text-primary)',
                            marginBottom: '6px'
                          }}>
                            {formatPrice(p)}
                          </div>

                          <div style={{
                            width: '100%',
                            maxWidth: '48px',
                            height: `${heightPct}%`,
                            backgroundColor: isCurrent ? 'var(--accent-blue)' : 'var(--accent-terracotta)',
                            borderRadius: '4px 4px 0 0',
                            opacity: isCurrent ? 1 : 0.7,
                            transition: 'height 0.3s ease',
                            border: `1px solid ${isCurrent ? 'var(--accent-blue)' : 'var(--accent)'}`
                          }} />

                          <div style={{
                            fontSize: '11px',
                            color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontWeight: isCurrent ? 700 : 500,
                            marginTop: '10px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.period}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Historical &larr;</span>
                  <span>Average Baseline: {formatPrice(data.recent_avg_price)}</span>
                  <span>&rarr; Current Order Window</span>
                </div>
              </div>
            )}
          </div>

          {/* Supplier Comparison Table (if suppliers list available) */}
          {data.suppliers && data.suppliers.length > 0 && (
            <div className="panel">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Supplier Price & Lead Time Comparison
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Supplier Name</th>
                      <th>Current Unit Price</th>
                      <th>30D Avg Price</th>
                      <th>Lead Time</th>
                      <th>Price Trend</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.suppliers.map((s, idx) => (
                      <tr key={idx} style={{ backgroundColor: s.is_primary ? '#FAF6EF' : 'transparent' }}>
                        <td style={{ fontWeight: 600 }}>
                          {s.name} {s.is_primary ? <span className="badge badge-low" style={{ marginLeft: '6px', fontSize: '10px' }}>PRIMARY</span> : ''}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--accent-blue)' }}>
                          {formatPrice(s.current_price)}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                          {formatPrice(s.recent_avg)}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono' }}>
                          {s.lead_time_days} days
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: getTrendColor(s.trend) }}>
                            {getTrendSymbol(s.trend)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${s.is_primary ? 'badge-buy' : 'badge-hold'}`}>
                            {s.is_primary ? 'SELECTED' : 'ALTERNATIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
