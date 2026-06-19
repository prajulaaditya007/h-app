import React from 'react';
import { TerritorySearch } from '../TerritorySearch/TerritorySearch';
import { TerritoryMain } from '../TerritoryMain/TerritoryMain';
import { Footer } from '../common/Footer/Footer';
import './WorkspaceLayoutStyles.css';

export const WorkspaceLayout: React.FC = () => {

  return (
    <div className="app-container">
      {/* 1. Header */}
      <header className="app-header">
        <span className="app-logo">Hierarchy App</span>
        <div className="user-profile-section">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name">John Doe</span>
          </div>
          <button className="btn-logout" onClick={() => console.log('Logout clicked')}>
            Logout
          </button>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="main-content">
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="breadcrumbs-nav">
          <ol className="breadcrumbs-list">
            <li className="breadcrumb-item">Home</li>
            <span className="breadcrumb-separator">/</span>
            <li className="breadcrumb-item">Hierarchy</li>
            <span className="breadcrumb-separator">/</span>
            <li className="breadcrumb-item active" aria-current="page">Territory Hierarchy</li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="page-header-title">
          <h1>Territory Hierarchy</h1>
        </div>

        {/* Global Search Card */}
        <TerritorySearch />

        {/* Main Territory Grid */}
        <TerritoryMain />

        {/* Minimal Footer */}
        <Footer />
      </main>
    </div>
  );
};
