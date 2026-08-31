import React from 'react';

export default function RecommendationCard({
  recommendation,
  onApproveClick,
  onCreateTransferClick,
  onViewPurchaseIntelligenceClick
}) {
  if (!recommendation) return null;

  const {
    sku_id,
    sku_name,
    recommended_action,
    explanation,
    locations,
    target_location,
    source_location,
    shortage_quantity,
    is_simulated
  } = recommendation;

  const getActionStyle = (action) => {
    switch (action) {
      case 'MOVE':
        return { color: 'var(--accent-green)', bg: 'var(--accent-green-bg)', border: '1px solid var(--accent-green)' };
      case 'BUY':
        return { color: 'var(--accent-blue)', bg: 'var(--accent-blue-bg)', border: '1px solid var(--accent-blue)' };
      case 'WAIT':
        return { color: 'var(--accent-ochre)', bg: 'var(--accent-ochre-bg)', border: '1px solid var(--accent-ochre)' };
      default:
        return { color: 'var(--text-muted)', bg: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)' };
    }
  };

  const actionStyle = getActionStyle(recommended_action);

  return (
    <div className="panel" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Simulation Banner tag if active */}
      {is_simulated && (
        <div style={{
          backgroundColor: 'var(--accent-ochre)',
          color: '#FFFDF8',
          fontWeight: 700,
          fontSize: '11px',
          padding: '6px 12px',
          textAlign: 'center',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          margin: '-20px -20px 16px -20px'
        }}>
          Simulation Active — Dynamic Recommendation Recalculated
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge" style={{ backgroundColor: 'var(--bg-surface-alt)', color: 'var(--accent-terracotta)', border: '1px solid var(--border-color)' }}>
              {sku_id}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{sku_name}</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Inventory Decision Engine Evaluation</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {recommended_action === 'MOVE' && onCreateTransferClick && (
            <button
              type="button"
              onClick={() => onCreateTransferClick({
                sku_id,
                sku_name,
                source_location: source_location || 'Bangalore',
                target_location: target_location || 'Chennai',
                quantity: shortage_quantity || 80
              })}
              className="btn btn-primary"
              style={{ padding: '10px 18px' }}
            >
              Create Transfer &rarr;
            </button>
          )}

          {recommended_action === 'BUY' && onViewPurchaseIntelligenceClick && (
            <button
              type="button"
              onClick={() => onViewPurchaseIntelligenceClick(sku_id)}
              className="btn btn-primary"
              style={{ padding: '10px 18px', backgroundColor: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}
            >
              View Purchase Intelligence &rarr;
            </button>
          )}

          <button
            type="button"
            onClick={onApproveClick}
            className="btn btn-success"
            style={{ padding: '10px 18px' }}
          >
            Approve {recommended_action} Action
          </button>
        </div>
      </div>

      {/* Visual Imbalance Transfer Banner */}
      {source_location && target_location && (
        <div className="transfer-arrow-banner">
          {source_location.toUpperCase()} &mdash;&mdash;&mdash; {recommended_action} {shortage_quantity || 65} UNITS &mdash;&mdash;&mdash;&gt; {target_location.toUpperCase()}
        </div>
      )}

      {/* Prominent Recommendation Card Box */}
      <div style={{
        backgroundColor: actionStyle.bg,
        border: actionStyle.border,
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
            RECOMMENDED ACTION
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: actionStyle.color, letterSpacing: '-0.5px', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
            {recommended_action} {shortage_quantity ? `${shortage_quantity} UNITS` : ''}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {source_location && target_location ? `${source_location} → ${target_location}` : 'Evaluated optimal action'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {recommended_action === 'MOVE' && onCreateTransferClick && (
            <button
              type="button"
              className="btn btn-success"
              style={{ fontSize: '12px', padding: '6px 14px' }}
              onClick={() => onCreateTransferClick({
                sku_id,
                sku_name,
                source_location: source_location || 'Bangalore',
                target_location: target_location || 'Chennai',
                quantity: shortage_quantity || 80
              })}
            >
              Create Transfer
            </button>
          )}

          {recommended_action === 'BUY' && onViewPurchaseIntelligenceClick && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 14px', backgroundColor: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}
              onClick={() => onViewPurchaseIntelligenceClick(sku_id)}
            >
              View Purchase Intelligence
            </button>
          )}

          <div className="badge badge-move" style={{ padding: '6px 14px', fontSize: '11px' }}>
            RECOMMENDED
          </div>
        </div>
      </div>


      {/* Decision Reasoning Box */}
      <div style={{ backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '14px', marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
          Decision Reasoning
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {explanation}
        </p>
      </div>

      {/* Multi-Location Inventory Breakdown Grid */}
      {locations && locations.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Multi-Location Warehouse Network Status
          </div>
          <div className="location-nodes-grid">
            {locations.map((loc, idx) => {
              const isShortage = loc.status === 'SHORTAGE';
              const isExcess = loc.status === 'EXCESS';

              return (
                <div key={idx} className={`location-node ${isShortage ? 'shortage' : isExcess ? 'excess' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{loc.city}</strong>
                    <span className={`badge ${isShortage ? 'badge-high' : isExcess ? 'badge-low' : 'badge-medium'}`}>
                      {loc.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    <span>Stock: {loc.current_stock}</span>
                    <span>14D Demand: {loc.forecast_14d_demand}</span>
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
  );
}
