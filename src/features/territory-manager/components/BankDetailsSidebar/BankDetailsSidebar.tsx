import React, { useEffect } from 'react';
import { useAppSelector } from '../../../../store';
import './BankDetailsSidebarStyles.css';

interface BankDetailsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BankDetailsSidebar: React.FC<BankDetailsSidebarProps> = ({ isOpen, onClose }) => {
  const nodesById = useAppSelector((s) => s.territory.nodesById);
  const selectedBankName = useAppSelector((s) => s.territory.selectedBankName);
  const selectedBankId = useAppSelector((s) => s.territory.selectedBankId);

  // Prevent body scroll while sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Derived stats (memoized and evaluated only when open)
  const rootNodeCount = useAppSelector((s) => s.territory.rootNodeIds.length);

  const { totalBranches, subTerritoryCount } = React.useMemo(() => {
    if (!isOpen) return { totalBranches: 0, subTerritoryCount: 0 };
    const allNodes = Object.values(nodesById);
    const total = allNodes.reduce((n, nd) => n + nd.branches.length, 0);
    const subCount = allNodes.filter((n) => n.parentNodeId !== undefined && n.parentNodeId !== null).length;
    return { totalBranches: total, subTerritoryCount: subCount };
  }, [nodesById, isOpen]);

  const bankIdLabel = selectedBankId
    ? selectedBankId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '—';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bank Details"
        className={`sidebar-panel ${isOpen ? 'open' : ''}`}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div>
            <div className="sidebar-header-label">Bank Details</div>
            <h2 className="sidebar-header-title">
              {selectedBankName ?? bankIdLabel}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-sidebar-close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="sidebar-body">
          {/* Status pill */}
          <div className="sidebar-status-wrapper">
            <span className="status-pill">
              <span className="status-pill-dot" />
              Active
            </span>
          </div>

          {/* Detail rows */}
          <div className="sidebar-details-list">
            <DetailRow label="Bank ID" value={selectedBankId ?? '—'} />
            <DetailRow label="Territories (Regions)" value={String(rootNodeCount)} />
            <DetailRow label="Sub-territories" value={String(subTerritoryCount)} />
            <DetailRow label="Total Branches" value={String(totalBranches)} />
            <hr className="sidebar-divider" />
            <DetailRow label="Established" value="01/01/2000" />
            <DetailRow label="End Date" value="12/31/9999" />
          </div>

          {/* Informational note */}
          <div className="sidebar-info-note">
            📋 Details shown reflect the current in-memory state. Publish changes to persist them.
          </div>
        </div>
      </div>
    </>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="sidebar-detail-row">
    <span className="sidebar-detail-label">{label}</span>
    <span className="sidebar-detail-value">{value}</span>
  </div>
);
