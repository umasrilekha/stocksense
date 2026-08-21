import React from 'react';

export default function SKUSelector({ skus, selectedSku, onSelectSku }) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📦 Select Inventory SKU</span>
            <span className="text-xs font-normal text-slate-400">Choose item to evaluate multi-location risk</span>
          </h2>
        </div>
        <div className="w-full md:w-auto">
          <select 
            value={selectedSku} 
            onChange={(e) => onSelectSku(e.target.value)}
            className="w-full md:w-64 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {skus.map((s) => {
          const isSelected = s.sku_id === selectedSku;
          const isDemo = s.sku_id === 'SKU-104';

          return (
            <button
              key={s.sku_id}
              onClick={() => onSelectSku(s.sku_id)}
              className={`text-left p-4 rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">
                  {s.sku_id}
                </span>
                {isDemo && (
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    Demo Preset
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-slate-100 truncate mb-1" title={s.name}>
                {s.name}
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Stock: <strong className="text-slate-200">{s.total_stock}</strong></span>
                <span>Demand: <strong className="text-slate-200">{s.total_demand}</strong></span>
              </div>
              <div className="mt-2 text-[11px] font-medium text-amber-400">
                {s.status}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
