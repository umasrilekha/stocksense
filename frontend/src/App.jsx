import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SKUSelector from './components/SKUSelector';
import RecommendationCard from './components/RecommendationCard';
import ComparisonMatrix from './components/ComparisonMatrix';
import WhatIfSimulator from './components/WhatIfSimulator';
import ApprovalModal from './components/ApprovalModal';
import LogisticsTracker from './components/LogisticsTracker';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('decision'); // 'decision' or 'logistics'
  const [skus, setSkus] = useState([]);
  const [selectedSku, setSelectedSku] = useState('SKU-104');
  const [recommendation, setRecommendation] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [apiStatus, setApiStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch SKUs & Logistics on mount
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
        setSkus([
          { sku_id: 'SKU-104', name: 'Precision Surgical Gloves (Box 100)', total_stock: 220, total_demand: 150, status: 'Imbalanced (Shortage + Excess)' },
          { sku_id: 'SKU-101', name: 'N95 Medical Respirators', total_stock: 470, total_demand: 270, status: 'Shortage' },
          { sku_id: 'SKU-102', name: 'Infrared Thermal Scanners', total_stock: 115, total_demand: 85, status: 'Balanced' },
          { sku_id: 'SKU-103', name: 'Full Body Hazards Protection Suit', total_stock: 13, total_demand: 140, status: 'Shortage' }
        ]);
      });

    fetchLogisticsTransfers();
  }, []);

  const fetchLogisticsTransfers = () => {
    fetch(`${API_BASE}/logistics/transfers`)
      .then(res => res.json())
      .then(data => {
        if (data.transfers) setTransfers(data.transfers);
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(err => {
        console.error("Logistics fetch error:", err);
        // Fallback local state for TR-001
        setTransfers([
          {
            transfer_id: 'TR-001',
            sku: 'SKU-104',
            product: 'Precision Surgical Gloves (Box 100)',
            source: 'Bangalore',
            destination: 'Chennai',
            quantity: 80,
            priority: 'HIGH',
            required_days: 3,
            status: 'REQUESTED',
            transport: { carrier: 'StockSense Express Logistics' },
            history: [{ status: 'REQUESTED', timestamp: '12:00', note: 'Transfer created' }]
          }
        ]);
        setNotifications([
          { id: 1, transfer_id: 'TR-001', message: 'Warehouse Bangalore notified for 80 units SKU-104.', timestamp: '12:00', type: 'LOGISTICS_UPDATE' }
        ]);
      });
  };

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

  // Create Transfer Action
  const handleCreateTransferFromRecommendation = () => {
    if (!recommendation) return;

    const payload = {
      sku: recommendation.sku_id,
      product: recommendation.sku_name,
      source: recommendation.source_location || 'Bangalore',
      destination: recommendation.target_location || 'Chennai',
      quantity: recommendation.shortage_quantity || 80,
      priority: 'HIGH',
      required_days: 3
    };

    fetch(`${API_BASE}/logistics/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        fetchLogisticsTransfers();
        setActiveTab('logistics');
        showToast(`🚚 Transfer Request ${data.transfer?.transfer_id || 'Created'} Initiated!`);
      })
      .catch(err => {
        console.error("Create transfer error:", err);
        setActiveTab('logistics');
        showToast("🚚 Transfer Request Initiated!");
      });
  };

  // Update Status Action
  const handleUpdateLogisticsStatus = (transferId, newStatus, note) => {
    fetch(`${API_BASE}/logistics/transfers/${transferId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note })
    })
      .then(res => res.json())
      .then(() => {
        fetchLogisticsTransfers();
        showToast(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
      })
      .catch(err => {
        console.error("Update status error:", err);
        // Fallback update local state
        setTransfers(prev => prev.map(t => t.transfer_id === transferId ? { ...t, status: newStatus } : t));
        showToast(`Status updated to ${newStatus}`);
      });
  };

  // Notify Warehouse Action
  const handleNotifyWarehouse = (transferId, message) => {
    fetch(`${API_BASE}/logistics/transfers/${transferId}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
      .then(res => res.json())
      .then(() => {
        fetchLogisticsTransfers();
        showToast("🔔 Warehouse Alert Sent!");
      })
      .catch(err => {
        console.error("Notify error:", err);
        showToast("🔔 Warehouse Alert Triggered!");
      });
  };

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

      <main className="max-w-7xl mx-auto px-6 pt-6 w-full flex-grow">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-extrabold px-6 py-3 rounded-2xl shadow-2xl animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab('decision')}
            className={`px-6 py-3 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'decision'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/60 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💡 Decision Center</span>
          </button>

          <button
            onClick={() => setActiveTab('logistics')}
            className={`px-6 py-3 font-extrabold text-sm border-b-2 transition flex items-center gap-2 relative ${
              activeTab === 'logistics'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/60 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🚚 Person 3: Logistics Coordination</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
              Module 3
            </span>
          </button>
        </div>

        {/* TAB 1: DECISION CENTER */}
        {activeTab === 'decision' && (
          <>
            {/* Demo Overview Badge */}
            <div className="glass-card rounded-2xl p-6 mb-8 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Live Techathon Story
                    </span>
                    <span className="text-xs font-mono text-slate-400">Decision &rarr; Execution Pipeline</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    StockSense forecasts inventory imbalances and recommends <strong className="text-white">MOVE</strong> actions, seamlessly handing over to <strong className="text-emerald-400">Logistics Coordination</strong> for warehouse fulfillment.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                    Forecast &rarr; Risk &rarr; Decision &rarr; Logistics Transfer &rarr; Delivered
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
                  onCreateTransferClick={handleCreateTransferFromRecommendation}
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
          </>
        )}

        {/* TAB 2: LOGISTICS COORDINATION (PERSON 3 MODULE) */}
        {activeTab === 'logistics' && (
          <LogisticsTracker
            transfers={transfers}
            notifications={notifications}
            onUpdateStatus={handleUpdateLogisticsStatus}
            onNotifyWarehouse={handleNotifyWarehouse}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        StockSense MVP &bull; Module 3: Logistics Coordination &bull; Built with React, FastAPI & Tailwind
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
