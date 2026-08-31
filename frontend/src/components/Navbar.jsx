import React from 'react';

export default function Navbar({ activeView, setActiveView, apiStatus }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'decisions', label: 'Decisions' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'logistics', label: 'Logistics' },
    { id: 'purchase-intelligence', label: 'Purchase Intelligence' },
  ];

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="brand-section">
            <div className="brand-logo">SS</div>
            <div className="brand-info">
              <h1 className="brand-title">StockSense</h1>
              <span className="brand-subtitle">Inventory Decision Intelligence System</span>
            </div>
          </div>

          <div className="status-badge">
            <span className={`status-dot ${apiStatus ? 'connected' : 'disconnected'}`}></span>
            <span>{apiStatus ? 'Backend Online' : 'Backend Offline'}</span>
          </div>
        </div>
      </header>

      <nav className="app-nav-bar">
        <div className="nav-container">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
