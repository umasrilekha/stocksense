import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SKUSelector from './components/SKUSelector';
import RecommendationCard from './components/RecommendationCard';
import ComparisonMatrix from './components/ComparisonMatrix';
import WhatIfSimulator from './components/WhatIfSimulator';
import ApprovalModal from './components/ApprovalModal';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import LogisticsView from './components/LogisticsView';
import PurchaseIntelligenceView from './components/PurchaseIntelligenceView';
import {
  getSkus,
  getDecisionBySkuLocation,
  runSimulation,
  approveAction,
  getHealth,
  createLogisticsTransfer
} from './services/api';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [skus, setSkus] = useState([]);
  const [selectedSku, setSelectedSku] = useState('SKU-104');
  const [selectedLocation, setSelectedLocation] = useState('Chennai');
  const [recommendation, setRecommendation] = useState(null);
  const [apiStatus, setApiStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [decisionError, setDecisionError] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeTransferId, setActiveTransferId] = useState(null);

  // Check health and fetch SKU list on mount
  useEffect(() => {
    getHealth()
      .then(() => setApiStatus(true))
      .catch(() => setApiStatus(false));

    getSkus()
      .then(data => {
        const itemList = Array.isArray(data) ? data : (data?.skus || []);
        setSkus(itemList);
        setApiStatus(true);
      })
      .catch(err => {
        console.error("API connection error on getSkus:", err);
        setApiStatus(false);
      });
  }, []);

  // Fetch Recommendation when selected SKU or Location changes
  const fetchRecommendation = (skuId, location) => {
    setLoading(true);
    setDecisionError(null);
    getDecisionBySkuLocation(skuId, location || selectedLocation)
      .then(data => {
        setRecommendation(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Recommendation fetch error:", err);
        setDecisionError("Backend connection unavailable.");
        setRecommendation(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecommendation(selectedSku, selectedLocation);
  }, [selectedSku, selectedLocation]);

  // Handle inventory selection and navigation
  const handleSelectSkuAndNavigate = (skuId, location) => {
    setSelectedSku(skuId);
    if (location) {
      setSelectedLocation(location);
    }
    setActiveView('decisions');
  };

  // Run What-If Simulation
  const handleSimulation = (simPayload) => {
    setLoading(true);
    setDecisionError(null);
    runSimulation(simPayload)
      .then(data => {
        setRecommendation(data);
        setLoading(false);
        showToast("Simulation updated decision recommendation.");
      })
      .catch(err => {
        console.error("Simulation error:", err);
        setDecisionError("Backend connection unavailable.");
        setLoading(false);
      });
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    fetchRecommendation(selectedSku, selectedLocation);
    showToast("Reset simulation parameters to default baseline.");
  };

  // Handle Approval Confirmation
  const handleApprovalConfirm = (approvalPayload) => {
    approveAction(approvalPayload)
      .then(() => {
        setApprovalModalOpen(false);
        showToast(`Action '${approvalPayload.action}' approved. Operational log recorded.`);
      })
      .catch(err => {
        console.error("Approval error:", err);
        setApprovalModalOpen(false);
        showToast(`Approval endpoint unreachable.`);
      });
  };

  // Create Transfer from decision workflow
  const handleCreateTransferFromDecision = (transferData) => {
    createLogisticsTransfer(transferData)
      .then((res) => {
        const trfId = res.transfer?.id || 'TRF-104';
        setActiveTransferId(trfId);
        const notifyMsg = res.message || `Warehouse ${transferData.source_location} has been notified to prepare ${transferData.quantity} units for transfer to ${transferData.target_location}.`;
        showToast(notifyMsg);
        setActiveView('logistics');
      })
      .catch(() => {
        const notifyMsg = `Warehouse ${transferData.source_location} has been notified to prepare ${transferData.quantity} units for transfer to ${transferData.target_location}.`;
        showToast(notifyMsg);
        setActiveView('logistics');
      });
  };

  // View Purchase Intelligence from decision workflow
  const handleNavigateToPurchaseIntelligence = (skuId) => {
    if (skuId) setSelectedSku(skuId);
    setActiveView('purchase-intelligence');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="app-shell">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        apiStatus={apiStatus}
      />

      <main className="app-main">
        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99,
            backgroundColor: 'var(--bg-header)',
            color: 'var(--text-on-dark)',
            fontWeight: 600,
            padding: '12px 20px',
            borderRadius: '6px',
            fontSize: '13px',
            boxShadow: '0 4px 16px rgba(42, 30, 23, 0.3)',
            border: '1px solid var(--accent-terracotta)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View Switcher Routing */}
        {activeView === 'dashboard' && (
          <DashboardView onNavigateToDecision={handleSelectSkuAndNavigate} />
        )}

        {activeView === 'inventory' && (
          <InventoryView
            selectedSku={selectedSku}
            onSelectSkuAndNavigate={handleSelectSkuAndNavigate}
          />
        )}

        {activeView === 'decisions' && (
          <div className="page-container">
            <SKUSelector
              skus={skus}
              selectedSku={selectedSku}
              onSelectSku={(sku) => setSelectedSku(sku)}
            />

            {loading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                Evaluating decision matrix...
              </div>
            ) : decisionError ? (
              <div className="alert-compact">
                <span>{decisionError}</span>
              </div>
            ) : (
              <>
                <RecommendationCard
                  recommendation={recommendation}
                  onApproveClick={() => setApprovalModalOpen(true)}
                  onCreateTransferClick={handleCreateTransferFromDecision}
                  onViewPurchaseIntelligenceClick={handleNavigateToPurchaseIntelligence}
                />

                <ComparisonMatrix
                  comparison={recommendation?.comparison}
                  recommendedAction={recommendation?.recommended_action}
                />
              </>
            )}
          </div>
        )}

        {activeView === 'simulator' && (
          <div className="page-container">
            <WhatIfSimulator
              selectedSku={selectedSku}
              recommendation={recommendation}
              onSimulate={handleSimulation}
              onReset={handleResetSimulation}
            />

            {loading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                Calculating simulation results...
              </div>
            ) : decisionError ? (
              <div className="alert-compact">
                <span>{decisionError}</span>
              </div>
            ) : (
              recommendation && (
                <>
                  <RecommendationCard
                    recommendation={recommendation}
                    onApproveClick={() => setApprovalModalOpen(true)}
                    onCreateTransferClick={handleCreateTransferFromDecision}
                    onViewPurchaseIntelligenceClick={handleNavigateToPurchaseIntelligence}
                  />

                  <ComparisonMatrix
                    comparison={recommendation?.comparison}
                    recommendedAction={recommendation?.recommended_action}
                  />
                </>
              )
            )}
          </div>
        )}

        {activeView === 'logistics' && (
          <LogisticsView
            activeTransferId={activeTransferId}
            onShowToast={showToast}
          />
        )}

        {activeView === 'purchase-intelligence' && (
          <PurchaseIntelligenceView
            selectedSku={selectedSku}
            onSelectSku={(sku) => setSelectedSku(sku)}
          />
        )}
      </main>

      <footer className="app-footer">
        StockSense &bull; Inventory Decision Intelligence System
      </footer>

      <ApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        recommendation={recommendation}
        onConfirm={handleApprovalConfirm}
      />
    </div>
  );
}
