import React from 'react';

export default function ComparisonMatrix({ comparison, recommendedAction }) {
  if (!comparison || comparison.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📊 Action Comparison Matrix</span>
            <span className="text-xs font-normal text-slate-400">Comparing BUY / MOVE / WAIT / HOLD</span>
          </h2>
          <p className="text-xs text-slate-400">Quantitative evaluation of cost, lead time, and stockout risk mitigation</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Transfer / Order Qty</th>
              <th className="py-3.5 px-4">Est. Total Cost ($)</th>
              <th className="py-3.5 px-4">Lead Time</th>
              <th className="py-3.5 px-4">Risk Level</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {comparison.map((item, idx) => {
              const isRecommended = item.action === recommendedAction;

              const badgeStyles = {
                MOVE: 'badge-move',
                BUY: 'badge-buy',
                WAIT: 'badge-wait',
                HOLD: 'badge-hold'
              };

              const riskStyles = {
                LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              };

              return (
                <tr
                  key={idx}
                  className={`transition ${
                    isRecommended
                      ? 'bg-indigo-950/40 border-l-4 border-l-emerald-400 font-semibold'
                      : 'hover:bg-slate-900/40'
                  }`}
                >
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-mono font-extrabold uppercase ${badgeStyles[item.action]}`}>
                        {item.action}
                      </span>
                      {isRecommended && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Recommended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-200">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.details}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-100 font-bold">
                    {item.quantity > 0 ? `${item.quantity} units` : '-'}
                  </td>
                  <td className="py-4 px-4 font-mono font-extrabold text-white text-base">
                    ${item.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-300">
                    {item.lead_time_days} days
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${riskStyles[item.risk_level] || riskStyles.MEDIUM}`}>
                      {item.risk_level}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {isRecommended ? (
                      <span className="text-xs text-emerald-400 font-extrabold flex items-center justify-end gap-1">
                        <span>✓ Best Choice</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Alternative</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
