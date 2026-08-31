import React, { useState } from 'react';

export default function ApprovalModal({ isOpen, onClose, recommendation, onConfirm }) {
  const [approverName, setApproverName] = useState('Inventory Manager');
  const [notes, setNotes] = useState('Approved optimal inter-warehouse transfer action to eliminate stockout risk.');

  if (!isOpen || !recommendation) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      sku_id: recommendation.sku_id,
      action: recommendation.recommended_action,
      approved_by: approverName,
      notes: notes
    });
  };

  return (
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
      <div className="card" style={{ width: '100%', maxWidth: '520px', position: 'relative', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
        <button
          onClick={onClose}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            backgroundColor: 'var(--accent-green-bg)',
            border: '1px solid var(--accent-green)',
            color: 'var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px'
          }}>
            GO
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>Approve Action Workflow</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Human-in-the-Loop Operational Sign-off</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '14px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
            Target Action
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '4px' }}>
            {recommendation.recommended_action}: {recommendation.source_location || 'Bangalore'} &rarr; {recommendation.target_location || 'Chennai'} ({recommendation.shortage_quantity || 80} units)
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {recommendation.sku_id} - {recommendation.sku_name}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Approver Name / Role</label>
            <input
              type="text"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Approval Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="form-input"
              style={{ resize: 'none' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
            >
              Confirm Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
