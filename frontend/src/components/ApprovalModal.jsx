import React, { useState } from 'react';

export default function ApprovalModal({ isOpen, onClose, recommendation, onConfirm }) {
  const [approverName, setApproverName] = useState('Inventory Manager (Demo)');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
        >
          &times;
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/30">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Approve Action Workflow</h3>
            <p className="text-xs text-slate-400">Human-in-the-Loop Decision Sign-off</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
          <div className="text-xs text-slate-400 mb-1">Target Action</div>
          <div className="text-base font-bold text-emerald-400 mb-2">
            {recommendation.recommended_action}: {recommendation.source_location} &rarr; {recommendation.target_location} ({recommendation.shortage_quantity} units)
          </div>
          <div className="text-xs text-slate-300">
            {recommendation.sku_id} - {recommendation.sku_name}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Approver Name / Role</label>
            <input
              type="text"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Approval Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm px-6 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Confirm Approval ✓
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
