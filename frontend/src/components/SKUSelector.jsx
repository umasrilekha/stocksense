import React from 'react';

export default function SKUSelector({ skus, selectedSku, onSelectSku }) {
  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
            Select Inventory SKU
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Choose an item to evaluate decision matrix metrics and action options.
          </p>
        </div>
        <div>
          <select 
            value={selectedSku} 
            onChange={(e) => onSelectSku(e.target.value)}
            className="form-select"
            style={{ minWidth: '240px' }}
          >
            {skus.map(s => (
              <option key={s.sku_id} value={s.sku_id}>
                {s.sku_id} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SKU Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {skus.map((s) => {
          const isSelected = s.sku_id === selectedSku;

          return (
            <button
              key={s.sku_id}
              type="button"
              onClick={() => onSelectSku(s.sku_id)}
              style={{
                textAlign: 'left',
                padding: '14px',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'var(--accent-ochre-bg)' : 'var(--bg-surface-alt)',
                border: isSelected ? '1px solid var(--accent-terracotta)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--accent-terracotta)', border: '1px solid var(--border-color)' }}>
                  {s.sku_id}
                </span>
                {isSelected && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-terracotta)', textTransform: 'uppercase' }}>Selected</span>
                )}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.name}>
                {s.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                <span>Stock: <strong style={{ color: 'var(--text-primary)' }}>{s.total_stock}</strong></span>
                <span>Demand: <strong style={{ color: 'var(--text-primary)' }}>{s.total_demand}</strong></span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
