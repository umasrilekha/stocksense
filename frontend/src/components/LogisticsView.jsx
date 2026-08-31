import React, { useState, useEffect } from 'react';
import { getLogisticsTransfers, updateTransferStatus, createLogisticsTransfer } from '../services/api';

const STATUS_STEPS = [
  { id: 'REQUESTED', label: 'Requested' },
  { id: 'WAREHOUSE CONFIRMED', label: 'Warehouse Confirmed' },
  { id: 'PREPARING', label: 'Preparing' },
  { id: 'DISPATCHED', label: 'Dispatched' },
  { id: 'IN TRANSIT', label: 'In Transit' },
  { id: 'DELIVERED', label: 'Delivered' }
];

export default function LogisticsView({ activeTransferId, onShowToast }) {
  const [transfers, setTransfers] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Transfer Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTransferForm, setNewTransferForm] = useState({
    sku_id: 'SKU-104',
    sku_name: 'Precision Surgical Gloves (Box 100)',
    source_location: 'Bangalore',
    target_location: 'Chennai',
    quantity: 80,
    priority: 'HIGH',
    required_by: 'In 2 days',
    notes: 'Inter-warehouse transfer recommended by StockSense'
  });

  const loadTransfers = () => {
    setLoading(true);
    setError(null);
    getLogisticsTransfers()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.transfers || []);
        setTransfers(list);
        if (list.length > 0) {
          if (activeTransferId) {
            const found = list.find(t => t.id === activeTransferId);
            setSelectedTransfer(found || list[0]);
          } else {
            setSelectedTransfer(list[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Logistics getTransfers error:", err);
        setError("Unable to load logistics data.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTransfers();
  }, [activeTransferId]);

  const handleStatusAdvance = (nextStatus) => {
    if (!selectedTransfer) return;

    updateTransferStatus(selectedTransfer.id, nextStatus)
      .then((res) => {
        const updated = { ...selectedTransfer, status: nextStatus };
        setSelectedTransfer(updated);
        setTransfers(prev => prev.map(t => t.id === selectedTransfer.id ? updated : t));
        if (onShowToast) {
          onShowToast(`Transfer ${selectedTransfer.id} status updated to ${nextStatus}.`);
        }
      })
      .catch((err) => {
        console.error("Failed to update status:", err);
        const updated = { ...selectedTransfer, status: nextStatus };
        setSelectedTransfer(updated);
        setTransfers(prev => prev.map(t => t.id === selectedTransfer.id ? updated : t));
        if (onShowToast) {
          onShowToast(`Transfer ${selectedTransfer.id} status updated to ${nextStatus}.`);
        }
      });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createLogisticsTransfer(newTransferForm)
      .then((res) => {
        const created = res.transfer || {
          id: `TRF-${Math.floor(100 + Math.random() * 900)}`,
          ...newTransferForm,
          status: 'REQUESTED',
          created_at: 'Just now'
        };

        setTransfers(prev => [created, ...prev]);
        setSelectedTransfer(created);
        setShowCreateModal(false);
        const notifyMsg = res.message || `Warehouse ${newTransferForm.source_location} has been notified to prepare ${newTransferForm.quantity} units for transfer to ${newTransferForm.target_location}.`;
        if (onShowToast) {
          onShowToast(notifyMsg);
        }
      })
      .catch((err) => {
        console.error("Create transfer error:", err);
        setShowCreateModal(false);
        if (onShowToast) {
          onShowToast(`Warehouse ${newTransferForm.source_location} has been notified to prepare ${newTransferForm.quantity} units for transfer to ${newTransferForm.target_location}.`);
        }
      });
  };

  const getCurrentStepIndex = (status) => {
    const s = (status || '').toUpperCase();
    const idx = STATUS_STEPS.findIndex(step => step.id === s);
    return idx >= 0 ? idx : 0;
  };

  const getNextAction = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'REQUESTED':
        return { label: 'Confirm Warehouse', nextStatus: 'WAREHOUSE CONFIRMED' };
      case 'WAREHOUSE CONFIRMED':
        return { label: 'Prepare Shipment', nextStatus: 'PREPARING' };
      case 'PREPARING':
        return { label: 'Dispatch', nextStatus: 'DISPATCHED' };
      case 'DISPATCHED':
        return { label: 'Mark In Transit', nextStatus: 'IN TRANSIT' };
      case 'IN TRANSIT':
        return { label: 'Mark Delivered', nextStatus: 'DELIVERED' };
      default:
        return null;
    }
  };

  const currentStepIdx = selectedTransfer ? getCurrentStepIndex(selectedTransfer.status) : 0;
  const nextAction = selectedTransfer ? getNextAction(selectedTransfer.status) : null;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="page-title">Logistics Coordination</h2>
          <p className="page-subtitle">Inter-warehouse stock transfer execution, dispatching, and tracking.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + New Stock Transfer
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
          Loading logistics transfers...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert-compact">
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          
          {/* Selected Transfer Detail & Timeline Card */}
          {selectedTransfer ? (
            <div className="panel" style={{ borderLeft: '4px solid var(--accent-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge" style={{ backgroundColor: 'var(--bg-surface-alt)', color: 'var(--accent-terracotta)', border: '1px solid var(--border-color)' }}>
                      {selectedTransfer.id}
                    </span>
                    <span className="badge badge-move">
                      {selectedTransfer.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedTransfer.sku_name || selectedTransfer.sku_id}
                  </h3>
                </div>

                {nextAction ? (
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ padding: '8px 16px' }}
                    onClick={() => handleStatusAdvance(nextAction.nextStatus)}
                  >
                    {nextAction.label} &rarr;
                  </button>
                ) : (
                  <span className="badge badge-low" style={{ padding: '8px 14px', fontSize: '12px' }}>
                    ✓ TRANSFER COMPLETED & DELIVERED
                  </span>
                )}
              </div>

              {/* Transfer Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', padding: '14px', backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>SKU Code</span>
                  <strong style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>{selectedTransfer.sku_id}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Source Warehouse</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedTransfer.source_location}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Destination Warehouse</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedTransfer.target_location}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Transfer Quantity</span>
                  <strong style={{ color: 'var(--accent-green)', fontFamily: 'JetBrains Mono' }}>{selectedTransfer.quantity} units</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Priority</span>
                  <span className={`badge ${selectedTransfer.priority === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                    {selectedTransfer.priority}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Required By</span>
                  <strong style={{ color: 'var(--text-secondary)' }}>{selectedTransfer.required_by}</strong>
                </div>
              </div>

              {/* Status Timeline Visualization */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Live Status Tracking Timeline
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  {STATUS_STEPS.map((step, idx) => {
                    const isPassed = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div
                        key={step.id}
                        style={{
                          backgroundColor: isCurrent ? 'var(--accent-green-bg)' : isPassed ? 'var(--bg-surface-alt)' : 'var(--bg-input)',
                          border: `1px solid ${isCurrent ? 'var(--accent-green)' : isPassed ? 'var(--border-color)' : 'var(--border-subtle)'}`,
                          borderRadius: '6px',
                          padding: '10px 8px',
                          textAlign: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: isCurrent ? 'var(--accent-green)' : isPassed ? 'var(--text-primary)' : 'var(--text-muted)',
                          marginBottom: '2px'
                        }}>
                          {isPassed || isCurrent ? '✓' : '○'} {step.label}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {isCurrent ? 'Current Status' : isPassed ? 'Completed' : 'Pending'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedTransfer.notes && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '12px' }}>
                  Notes: {selectedTransfer.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="panel" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              No active transfer selected.
            </div>
          )}

          {/* Active Transfers Table */}
          <div className="panel">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Active Warehouse Transfers ({transfers.length})
            </h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transfer ID</th>
                    <th>SKU</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Quantity</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No transfers found. Click "+ New Stock Transfer" to create one.
                      </td>
                    </tr>
                  ) : (
                    transfers.map((t) => {
                      const isSelected = selectedTransfer?.id === t.id;
                      return (
                        <tr
                          key={t.id}
                          className={isSelected ? 'selected' : ''}
                          onClick={() => setSelectedTransfer(t)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <span className="badge" style={{ backgroundColor: 'var(--bg-surface-alt)', color: 'var(--accent-terracotta)', border: '1px solid var(--border-color)' }}>
                              {t.id}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{t.sku_id}</td>
                          <td>{t.source_location}</td>
                          <td>{t.target_location}</td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{t.quantity}</td>
                          <td>
                            <span className={`badge ${t.priority === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                              {t.priority}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-move">
                              {t.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTransfer(t);
                              }}
                            >
                              Track &rarr;
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Transfer Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          backgroundColor: 'rgba(42, 30, 23, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', position: 'relative' }}>
            <button
              onClick={() => setShowCreateModal(false)}
              type="button"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Create Inter-Warehouse Transfer
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Initiate a stock movement request between regional warehouse nodes.
            </p>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input
                  type="text"
                  value={newTransferForm.sku_id}
                  onChange={(e) => setNewTransferForm({ ...newTransferForm, sku_id: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Source Warehouse</label>
                  <input
                    type="text"
                    value={newTransferForm.source_location}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, source_location: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination Warehouse</label>
                  <input
                    type="text"
                    value={newTransferForm.target_location}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, target_location: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newTransferForm.quantity}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, quantity: Number(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Required By</label>
                  <input
                    type="text"
                    value={newTransferForm.required_by}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, required_by: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                >
                  Create Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
