import React from 'react';

export default function Navbar({ apiStatus }) {
  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center font-extrabold text-indigo-400 text-lg">
              SS
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">StockSense</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
                MVP v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Inventory Decision Intelligence System</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className={`h-2 w-2 rounded-full ${apiStatus ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-slate-300 font-medium">
              API Status: <span className="text-slate-100">{apiStatus ? 'Connected (FastAPI)' : 'Connecting...'}</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 font-mono font-medium">
            <span>Chennai &rarr; Bangalore Demo Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}
