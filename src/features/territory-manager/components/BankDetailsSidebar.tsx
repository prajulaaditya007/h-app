import React, { useEffect } from 'react';
import { useAppSelector } from '../store';

interface BankDetailsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * BankDetailsSidebar — slides in from the right edge of the viewport.
 * Shows high-level details for the currently loaded bank.
 */
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

  // Derived stats
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
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
          zIndex: 1200,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bank Details"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '360px',
          maxWidth: '90vw',
          backgroundColor: '#fff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          zIndex: 1201,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 20px 16px',
            borderBottom: '1px solid #e9ecef',
            position: 'sticky',
            top: 0,
            backgroundColor: '#fff',
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Details</div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#212529' }}>
              {selectedBankName ?? bankIdLabel}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: '#6c757d',
              lineHeight: 1,
              padding: '4px',
              borderRadius: '4px',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', flex: 1 }}>
          {/* Status pill */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '20px',
              backgroundColor: '#d1fae5', color: '#065f46',
              fontSize: '0.78rem', fontWeight: 600,
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              Active
            </span>
          </div>

          {/* Detail rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <DetailRow label="Bank ID" value={selectedBankId ?? '—'} />
            <DetailRow label="Territories (Regions)" value={String(rootNodeCount)} />
            <DetailRow label="Sub-territories" value={String(subTerritoryCount)} />
            <DetailRow label="Total Branches" value={String(totalBranches)} />
            <hr style={{ margin: '4px 0', borderColor: '#e9ecef' }} />
            <DetailRow label="Established" value="01/01/2000" />
            <DetailRow label="End Date" value="12/31/9999" />
          </div>

          {/* Informational note */}
          <div style={{
            marginTop: '28px', padding: '12px 14px',
            backgroundColor: '#f8f9fa', borderRadius: '8px',
            border: '1px solid #e9ecef',
            fontSize: '0.78rem', color: '#6c757d', lineHeight: 1.5,
          }}>
            📋 Details shown reflect the current in-memory state. Publish changes to persist them.
          </div>
        </div>
      </div>
    </>
  );
};

/** Small label + value row for the sidebar detail list */
const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
    <span style={{ fontSize: '0.8rem', color: '#6c757d', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#212529', textAlign: 'right' }}>{value}</span>
  </div>
);
