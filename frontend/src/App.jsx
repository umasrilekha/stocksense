import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SKUSelector from './components/SKUSelector';
import RecommendationCard from './components/RecommendationCard';
import ComparisonMatrix from './components/ComparisonMatrix';
import WhatIfSimulator from './components/WhatIfSimulator';
import ApprovalModal from './components/ApprovalModal';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  const [skus, setSkus] = useState([]);
  const [selectedSku, setSelectedSku] = useState('SKU-104');
  const [recommendation, setRecommendation] = useState(null);
  const [apiStatus, setApiStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch SKUs on mount
  useEffect(() => {
    fetch(`${API_BASE}/skus`)
      .then(res => res.json())
      .then(data => {
        setSkus(data);
        setApiStatus(true);
      })
      .catch(err => {
        console.error("API connection error:", err);
        setApiStatus(false);
        // Fallback default SKUs for frontend resiliency
        setSkus([
          { sku_id: 'SKU-104', name: 'Precision Surgical Gloves (Box 100)', total_stock: 220, total_demand: 150, status: 'Imbalanced (Shortage + Excess)' },
          { sku_id: 'SKU-101', name: 'N95 Medical Respirators', total_stock: 470, total_demand: 270, status: 'Shortage' },
          { sku_id: 'SKU-102', name: 'Infrared Thermal Scanners', total_stock: 115, total_demand: 85, status: 'Balanced' },
          { sku_id: 'SKU-103', name: 'Full Body Hazards Protection Suit', total_stock: 13, total_demand: 140, status: 'Shortage' }
        ]);
      });
  }, []);

  // Fetch Recommendation when selected SKU changes
  const fetchRecommendation = (skuId) => {
    setLoading(true);
    fetch(`${API_BASE}/recommendation/${skuId}`)
      .then(res => res.json())
      .then(data => {
        setRecommendation(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Recommendation fetch error:", err);
        // Hardcoded demo fallback data for SKU-104
        if (skuId === 'SKU-104') {
          setRecommendation({
            sku_id: 'SKU-104',
            sku_name: 'Precision Surgical Gloves (Box 100)',
            recommended_action: 'MOVE',
            explanation: 'Recommend MOVE 65 units from Bangalore to Chennai. Bangalore has 130 excess units while Chennai faces a shortage of 65 units. Inter-location transfer takes only 1.5 days at $147.50 cost, saving $1,107.50 compared to supplier purchasing ($1,255.00 cost, 7 days lead time).',
            target_location: 'Chennai',
            source_location: 'Bangalore',
            shortage_quantity: 65,
            excess_quantity: 130,
            locations: [
              { city: 'Chennai', current_stock: 15, safety_stock: 20, forecast_14d_demand: 80, net_balance: -65, status: 'SHORTAGE' },
              { city: 'Bangalore', current_stock: 160, safety_stock: 30, forecast_14d_demand: 30, net_balance: 130, status: 'EXCESS' },
              { city: 'Hyderabad', current_stock: 45, safety_stock: 25, forecast_14d_demand: 40, net_balance: 5, status: 'BALANCED' }
            ],
            comparison: [
              { action: 'MOVE', title: 'Inter-location Transfer (Bangalore -> Chennai)', quantity: 65, cost: 147.5, lead_time_days: 1.5, risk_level: 'LOW', feasible: true, details: 'Transfer 65 units from Bangalore excess to Chennai.' },
              { action: 'BUY', title: 'Procure from Supplier', quantity: 65, cost: 1255.0, lead_time_days: 7, risk_level: 'MEDIUM', feasible: true, details: 'Purchase 65 units at $12.0/unit + $150.0 shipping.' },
              { action: 'WAIT', title: 'Wait for Demand Update / Incoming Stock', quantity: 0, cost: 780.0, lead_time_days: 3.0, risk_level: 'HIGH', feasible: true, details: 'Defer action. High stockout penalty risk if demand persists.' },
              { action: 'HOLD', title: 'Hold Current Status Quo', quantity: 0, cost: 801.2, lead_time_days: 0.0, risk_level: 'HIGH', feasible: true, details: 'Do nothing. Incurs holding cost on excess stock and stockout costs at shortage sites.' }
            ],
            is_simulated: false
          });
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecommendation(selectedSku);
  }, [selectedSku]);

  // Run What-If Simulation
  const handleSimulation = (simPayload) => {
    setLoading(true);
    fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simPayload)
    })
      .then(res => res.json())
      .then(data => {
        setRecommendation(data);
        setLoading(false);
        showToast("⚡ Simulation updated recommendation!");
      })
      .catch(err => {
        console.error("Simulation error:", err);
        setLoading(false);
      });
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    fetchRecommendation(selectedSku);
    showToast("Reset simulation parameters");
  };

  // Handle Approval Confirmation
  const handleApprovalConfirm = (approvalPayload) => {
    fetch(`${API_BASE}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalPayload)
    })
      .then(res => res.json())
      .then(() => {
        setApprovalModalOpen(false);
        showToast(`✓ Action '${approvalPayload.action}' approved! Decision logged.`);
      })
      .catch(err => {
        console.error("Approval error:", err);
        setApprovalModalOpen(false);
        showToast(`✓ Action '${approvalPayload.action}' approved locally.`);
      });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      <Navbar apiStatus={apiStatus} />

      <main className="max-w-7xl mx-auto px-6 pt-8 w-full flex-grow">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-extrabold px-6 py-3 rounded-2xl shadow-2xl animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Demo Overview Badge */}
        <div className="glass-card rounded-2xl p-6 mb-8 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Live Hackathon Demo Flow
                </span>
                <span className="text-xs font-mono text-slate-400">Persona: Person 3 (Integration & Release)</span>
              </div>
              <p className="text-sm text-slate-300">
                Evaluating multi-location inventory imbalances between <strong className="text-white">Chennai</strong> (shortage) and <strong className="text-white">Bangalore</strong> (excess).
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                Core Flow: Forecast &rarr; Risk &rarr; Compare &rarr; Recommend &rarr; Simulate
              </span>
            </div>
          </div>
        </div>

        {/* SKU Selector */}
        <SKUSelector
          skus={skus}
          selectedSku={selectedSku}
          onSelectSku={setSelectedSku}
        />

        {/* Recommendation & Breakdown */}
        {loading ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 animate-pulse mb-8">
            Evaluating AI decision matrix...
          </div>
        ) : (
          <>
            <RecommendationCard
              recommendation={recommendation}
              onApproveClick={() => setApprovalModalOpen(true)}
            />

            <ComparisonMatrix
              comparison={recommendation?.comparison}
              recommendedAction={recommendation?.recommended_action}
            />

            <WhatIfSimulator
              selectedSku={selectedSku}
              onSimulate={handleSimulation}
              onReset={handleResetSimulation}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        StockSense MVP &bull; Built with React, FastAPI, Python, Pandas, SQLite &bull; Person 3 Integration Release
      </footer>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        recommendation={recommendation}
        onConfirm={handleApprovalConfirm}
      />
    </div>
  );
}
