import React, { useState } from 'react';

const STATUS_STEPS = [
  { id: 'REQUESTED', label: 'Requested', icon: '📝' },
  { id: 'WAREHOUSE_CONFIRMED', label: 'Warehouse Confirmed', icon: '🏢' },
  { id: 'PREPARING', label: 'Preparing', icon: '📦' },
  { id: 'DISPATCHED', label: 'Dispatched', icon: '🚚' },
  { id: 'IN_TRANSIT', label: 'In Transit', icon: '⚡' },
  { id: 'DELIVERED', label: 'Delivered', icon: '✅' }
];

export default function LogisticsTracker({ transfers, notifications, onUpdateStatus, onNotifyWarehouse }) {
  const [selectedTransferId, setSelectedTransferId] = useState(transfers[0]?.transfer_id || 'TR-001');
  const [customNote, setCustomNote] = useState('');

  const activeTransfer = transfers.find(t => t.transfer_id === selectedTransferId) || transfers[0];

  if (!activeTransfer) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
        No active stock transfers found. Initiate a transfer from the Decision Center!
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === activeTransfer.status);

  const handleNextStatus = (targetStatus) => {
    onUpdateStatus(activeTransfer.transfer_id, targetStatus, customNote || `Advanced to ${targetStatus}`);
    setCustomNote('');
  };

  const handleSimulateNotify = () => {
    onNotifyWarehouse(
      activeTransfer.transfer_id,
      `Warehouse ${activeTransfer.source} has been alerted to prioritize shipment of ${activeTransfer.quantity} units (${activeTransfer.sku}).`
    );
  };

  return (
    <div className="space-y-8 mb-12">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/30 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/30">
                Person 3 &bull; Logistics Coordination Module
              </span>
              <span className="text-xs font-mono text-slate-400">Inter-Location Transfer Execution</span>
            </div>
            <h2 className="text-xl font-black text-white">Stock Transfer Workflow & Tracking</h2>
          </div>
          <button
            onClick={handleSimulateNotify}
            className="bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition border border-indigo-400/30 shadow-lg flex items-center gap-2"
          >
            <span>🔔 Trigger Simulated Warehouse Alert</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Transfers List */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>📋 Active Transfers</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-indigo-400 rounded-full">
              {transfers.length} Total
            </span>
          </h3>

          <div className="space-y-3">
            {transfers.map((t) => {
              const isSelected = t.transfer_id === selectedTransferId;
              return (
                <div
                  key={t.transfer_id}
                  onClick={() => setSelectedTransferId(t.transfer_id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {t.transfer_id}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white mb-1">
                    {t.sku} - {t.product}
                  </div>

                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>{t.source} &rarr; {t.destination}</span>
                    <span className="text-emerald-300 font-bold">{t.quantity} units</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notifications Feed Card */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              📢 Warehouse Notification Log
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                    <span>{n.transfer_id}</span>
                    <span>{n.timestamp}</span>
                  </div>
                  <p className="text-slate-300 leading-snug">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2-Columns: Transfer Details & Stepper */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transfer Summary Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-slate-400">Transfer Request ID</span>
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <span>{activeTransfer.transfer_id}</span>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Priority: {activeTransfer.priority}
                  </span>
                </h3>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-slate-400 block">Route:</span>
                <span className="text-base font-bold text-emerald-400">
                  {activeTransfer.source} &rarr; {activeTransfer.destination}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-xs block">SKU Item</span>
                <span className="text-sm font-bold text-white font-mono">{activeTransfer.sku}</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-xs block">Transfer Quantity</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{activeTransfer.quantity} Units</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-xs block">Required By</span>
                <span className="text-sm font-bold text-white font-mono">{activeTransfer.required_days} Days</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-xs block">Carrier</span>
                <span className="text-xs font-bold text-slate-300 truncate block" title={activeTransfer.transport.carrier}>
                  {activeTransfer.transport.carrier}
                </span>
              </div>
            </div>

            {/* Stepper Timeline Visualizer */}
            <div className="mb-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Shipment Status Timeline
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-xl border text-center transition ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-500/20 text-white'
                          : isCompleted
                          ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                          : 'bg-slate-950/40 border-slate-850 text-slate-600'
                      }`}
                    >
                      <div className="text-lg mb-1">{step.icon}</div>
                      <div className="text-[11px] font-bold tracking-tight leading-tight">
                        {step.label}
                      </div>
                      <div className="mt-1">
                        {isCompleted ? (
                          <span className="text-[10px] text-emerald-400 font-extrabold">✓ Done</span>
                        ) : (
                          <span className="text-[10px] text-slate-600">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stepper Control Buttons */}
            <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Advance Logistics Workflow
              </h4>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  disabled={currentStepIndex >= 1}
                  onClick={() => handleNextStatus('WAREHOUSE_CONFIRMED')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                    currentStepIndex < 1
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  1. Confirm Warehouse
                </button>

                <button
                  disabled={currentStepIndex >= 2}
                  onClick={() => handleNextStatus('PREPARING')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                    currentStepIndex === 1
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  2. Prepare Shipment
                </button>

                <button
                  disabled={currentStepIndex >= 3}
                  onClick={() => handleNextStatus('DISPATCHED')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                    currentStepIndex === 2
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  3. Dispatch
                </button>

                <button
                  disabled={currentStepIndex >= 4}
                  onClick={() => handleNextStatus('IN_TRANSIT')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                    currentStepIndex === 3
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  4. Mark In Transit
                </button>

                <button
                  disabled={currentStepIndex >= 5}
                  onClick={() => handleNextStatus('DELIVERED')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                    currentStepIndex === 4
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  5. Mark Delivered ✓
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Optional log note (e.g., Driver dispatched via Express Freight)..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* History Log Table */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Transfer Audit History
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Audit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {activeTransfer.history.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{h.timestamp}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{h.status}</td>
                      <td className="py-2.5 px-3 text-slate-300">{h.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
