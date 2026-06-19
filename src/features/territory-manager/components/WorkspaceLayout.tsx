import React from 'react';
import { useAppSelector } from '../store';
import { TerritorySearch } from './TerritorySearch';
import { TerritoryMain } from './TerritoryMain';

/**
 * WorkspaceLayout is a pure layout shell.
 * All search state lives in the Redux store (managed by TerritorySearch).
 * This component only reads `showPanel` to conditionally render TerritoryMain.
 */
export const WorkspaceLayout: React.FC = () => {
  const showPanel = useAppSelector(state => state.territory.showPanel);

  return (
    <div className="bg-light min-vh-100 d-flex flex-column" style={{ padding: '0 2rem' }}>

      {/* 1. Header */}
      <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-3 py-2 justify-content-between mb-2">
        <span className="navbar-brand fw-bold text-dark fs-4">Header</span>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-5">👤</span>
            <span className="fw-semibold">John Doe</span>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => console.log('Logout clicked')}>
            Logout
          </button>
        </div>
      </header>

      {/* 2. Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb small text-muted mb-0 bg-transparent p-0">
          <li className="breadcrumb-item">Home</li>
          <li className="breadcrumb-item">Hierarchy</li>
          <li className="breadcrumb-item active text-dark" aria-current="page">Territory Hierarchy</li>
        </ol>
      </nav>

      {/* 3. Page Title */}
      <div className="mb-3">
        <h1 className="h2 text-dark fw-bold text-uppercase mb-0">Territory Hierarchy</h1>
      </div>

      {/* 4. Global Search Card — owns its own logic via Redux */}
      <TerritorySearch />

      {/* 5. Main Territory Grid — or placeholder when no bank selected */}
      {showPanel ? (
        <TerritoryMain />
      ) : (
        <div className="card shadow-sm border-light bg-white p-5 mb-4 flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.4 }}>🏦</div>
            <h3 className="text-muted fw-semibold">Search for an Institution or a Bank</h3>
            <p className="text-muted small mb-0">
              Use the search bar above to find and load a bank's territory hierarchy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
