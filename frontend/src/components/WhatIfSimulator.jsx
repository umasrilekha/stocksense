import React, { useState } from 'react';

export default function WhatIfSimulator({ selectedSku, recommendation, onSimulate, onReset }) {
  const [sourceStock, setSourceStock] = useState(160);
  const [transferRate, setTransferRate] = useState(1.5);
  const [supplierLeadTime, setSupplierLeadTime] = useState(7);
  const [demandSurge, setDemandSurge] = useState(0);

  const currentAction = recommendation?.recommended_action || 'MOVE';
  const isSimulated = recommendation?.is_simulated || false;

  const handleApply = (e) => {
    e.preventDefault();
    onSimulate({
      sku_id: selectedSku,
      source_available_stock: Number(sourceStock),
      source_location_city: 'Bangalore',
      transfer_cost_per_unit: Number(transferRate),
      supplier_lead_time_days: Number(supplierLeadTime),
      demand_surge_percent: Number(demandSurge)
    });
  };

  const handleResetClick = () => {
    setSourceStock(160);
    setTransferRate(1.5);
    setSupplierLeadTime(7);
    setDemandSurge(0);
    onReset();
  };

  return (
    <div className="panel">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
            What-If Scenario Simulator
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Simulate supply chain parameters to test decision sensitivity under operational changes.
          </p>
        </div>

        <button
          onClick={handleResetClick}
          type="button"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '11px' }}
        >
          Reset Defaults
        </button>
      </div>

      {/* BASELINE vs. SIMULATED Outcome Transition Header */}
      <div style={{ backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>BASELINE DECISION</span>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-green)', fontFamily: 'JetBrains Mono' }}>
            {isSimulated ? 'MOVE' : currentAction}
          </div>
        </div>

        {isSimulated && (
          <>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 700 }}>
              &rarr;
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--accent-ochre)', textTransform: 'uppercase', fontWeight: 700 }}>SIMULATED OUTCOME</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: currentAction === 'BUY' ? 'var(--accent-blue)' : 'var(--accent-green)', fontFamily: 'JetBrains Mono' }}>
                {currentAction}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Simulator Form Controls */}
      <form onSubmit={handleApply}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* Control 1: Stock Availability */}
          <div className="form-group">
            <div className="form-label">
              <span>Bangalore Available Stock</span>
              <span style={{ color: 'var(--accent-terracotta)', fontFamily: 'JetBrains Mono' }}>{sourceStock} units</span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="5"
              value={sourceStock}
              onChange={(e) => setSourceStock(e.target.value)}
              className="form-range"
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Set to 0 to simulate stock exhaustion</span>
          </div>

          {/* Control 2: Transfer Rate */}
          <div className="form-group">
            <div className="form-label">
              <span>Freight Transfer Rate</span>
              <span style={{ color: 'var(--accent-terracotta)', fontFamily: 'JetBrains Mono' }}>₹{transferRate}/unit</span>
            </div>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="25.0"
              value={transferRate}
              onChange={(e) => setTransferRate(e.target.value)}
              className="form-input"
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Inter-warehouse shipping cost per unit</span>
          </div>

          {/* Control 3: Supplier Lead Time */}
          <div className="form-group">
            <div className="form-label">
              <span>Supplier Lead Time</span>
              <span style={{ color: 'var(--accent-terracotta)', fontFamily: 'JetBrains Mono' }}>{supplierLeadTime} days</span>
            </div>
            <input
              type="number"
              min="1"
              max="30"
              value={supplierLeadTime}
              onChange={(e) => setSupplierLeadTime(e.target.value)}
              className="form-input"
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vendor purchasing lead time</span>
          </div>

          {/* Control 4: Demand Surge */}
          <div className="form-group">
            <div className="form-label">
              <span>Demand Surge (%)</span>
              <span style={{ color: 'var(--accent-terracotta)', fontFamily: 'JetBrains Mono' }}>+{demandSurge}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={demandSurge}
              onChange={(e) => setDemandSurge(e.target.value)}
              className="form-range"
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Regional demand spike override</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '10px 20px' }}
          >
            Run Simulation
          </button>
        </div>
      </form>
    </div>
  );
}
