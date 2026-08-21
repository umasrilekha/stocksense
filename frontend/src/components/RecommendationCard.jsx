import React from 'react';

export default function RecommendationCard({ recommendation, onApproveClick }) {
  if (!recommendation) return null;

  const {
    sku_id,
    sku_name,
    recommended_action,
    explanation,
    target_location,
    source_location,
    shortage_quantity,
    excess_quantity,
    locations,
    is_simulated
  } = recommendation;

  const actionColors = {
    MOVE: 'from-emerald-600/30 to-teal-900/40 border-emerald-500/50 text-emerald-400',
    BUY: 'from-blue-600/30 to-indigo-900/40 border-blue-500/50 text-blue-400',
    WAIT: 'from-amber-600/30 to-orange-900/40 border-amber-500/50 text-amber-400',
    HOLD: 'from-slate-600/30 to-slate-900/40 border-slate-500/50 text-slate-400'
  };

  const badgeBg = actionColors[recommended_action] || actionColors.MOVE;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl mb-8 relative overflow-hidden">
      {/* Simulation Banner tag if active */}
      {is_simulated && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs px-4 py-1 text-center -mx-6 -mt-6 mb-6 tracking-wide uppercase">
          ⚡ Live Simulation Active - Dynamic Recommendation Recalculated
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {sku_id}
            </span>
            <h2 className="text-xl font-extrabold text-white">{sku_name}</h2>
          </div>
          <p className="text-sm text-slate-400">Decision Intelligence Engine Evaluation</p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-5 py-2.5 rounded-xl border bg-gradient-to-br ${badgeBg} shadow-lg flex items-center gap-3`}>
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">Recommended Action:</span>
            <span className="text-2xl font-black tracking-tight">{recommended_action}</span>
          </div>

          <button
            onClick={onApproveClick}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm px-5 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Approve {recommended_action} Action &rarr;
          </button>
        </div>
      </div>

      {/* Decision Explanation Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-indigo-400 text-xl">💡</div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">Decision AI Explanation</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{explanation}</p>
          </div>
        </div>
      </div>

      {/* Multi-location Stock Breakdown */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Multi-Location Inventory Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {locations.map((loc, idx) => {
            const isShortage = loc.status === 'SHORTAGE';
            const isExcess = loc.status === 'EXCESS';

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition ${
                  isShortage
                    ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                    : isExcess
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : 'bg-slate-900/40 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-white">{loc.city} Warehouse</span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    isShortage ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    isExcess ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {loc.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Current Stock</span>
                    <span className="text-base font-bold text-white">{loc.current_stock}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">14D Demand</span>
                    <span className="text-base font-bold text-white">{loc.forecast_14d_demand}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-between text-xs font-mono">
                  <span>Net Balance:</span>
                  <span className={`font-bold ${loc.net_balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {loc.net_balance > 0 ? `+${loc.net_balance}` : loc.net_balance} units
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
