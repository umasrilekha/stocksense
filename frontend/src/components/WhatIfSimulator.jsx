import React, { useState } from 'react';

export default function WhatIfSimulator({ selectedSku, onSimulate, onReset }) {
  const [sourceStock, setSourceStock] = useState(160);
  const [transferRate, setTransferRate] = useState(1.5);
  const [supplierLeadTime, setSupplierLeadTime] = useState(7);
  const [demandSurge, setDemandSurge] = useState(0);

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
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🧪 Interactive What-If Simulator</span>
            <span className="text-xs font-normal text-slate-400">Test supply chain scenario variations</span>
          </h2>
          <p className="text-xs text-slate-400">Adjust parameters to simulate how changing warehouse conditions alter the AI recommendation</p>
        </div>
        <button
          onClick={handleResetClick}
          type="button"
          className="text-xs text-slate-400 hover:text-white underline"
        >
          Reset Defaults
        </button>
      </div>

      <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Source Stock Control */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex justify-between">
            <span>Bangalore Stock (Units)</span>
            <span className="text-indigo-400 font-mono">{sourceStock}</span>
          </label>
          <input
            type="range"
            min="0"
            max="300"
            step="5"
            value={sourceStock}
            onChange={(e) => setSourceStock(e.target.value)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="text-[11px] text-slate-500 block">Simulate Bangalore stock exhaustion</span>
        </div>

        {/* Transfer Cost Control */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex justify-between">
            <span>Transfer Cost ($/unit)</span>
            <span className="text-indigo-400 font-mono">${transferRate}</span>
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="25.0"
            value={transferRate}
            onChange={(e) => setTransferRate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
          />
          <span className="text-[11px] text-slate-500 block">Inter-location freight surge rate</span>
        </div>

        {/* Supplier Lead Time Control */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex justify-between">
            <span>Supplier Lead Time (Days)</span>
            <span className="text-indigo-400 font-mono">{supplierLeadTime}d</span>
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={supplierLeadTime}
            onChange={(e) => setSupplierLeadTime(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
          />
          <span className="text-[11px] text-slate-500 block">Purchasing lead time delay</span>
        </div>

        {/* Demand Surge Control */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex justify-between">
            <span>Demand Surge (%)</span>
            <span className="text-indigo-400 font-mono">+{demandSurge}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={demandSurge}
            onChange={(e) => setDemandSurge(e.target.value)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="text-[11px] text-slate-500 block">Regional demand spike simulation</span>
        </div>

        <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            Run Dynamic Simulation ⚡
          </button>
        </div>
      </form>
    </div>
  );
}
