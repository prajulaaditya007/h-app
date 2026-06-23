import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../../store';
import { setShowPanel, setIsPublishing, setHasUnpublishedChanges } from '../../store/territorySlice';
import { TerritoryListPanel } from '../TerritoryListPanel/TerritoryListPanel';
import { AssignedBranchList } from '../AssignedBranchList/AssignedBranchList';
import { UnassignedBranchList } from '../UnassignedBranchList/UnassignedBranchList';
import { Modal } from '../../../../components/ui';
import { BankDetailsSidebar } from '../BankDetailsSidebar/BankDetailsSidebar';
import { toast } from 'sonner';
import './TerritoryMainStyles.css';

export const TerritoryMain: React.FC = () => {
  const dispatch = useAppDispatch();

  const nodesById = useAppSelector((s) => s.territory.nodesById);
  const unassignedBranches = useAppSelector((s) => s.territory.unassignedBranches);
  const selectedTerritoryId = useAppSelector((s) => s.territory.selectedTerritoryId);
  const selectedBankName = useAppSelector((s) => s.territory.selectedBankName);
  const selectedBankId = useAppSelector((s) => s.territory.selectedBankId);
  const hasUnpublishedChanges = useAppSelector((s) => s.territory.hasUnpublishedChanges);
  const isPublishing = useAppSelector((s) => s.territory.isPublishing);
  const showPanel = useAppSelector((s) => s.territory.showPanel);
  const isBankLoaded = showPanel;

  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const mainCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isBankLoaded && mainCardRef.current) {
      const timer = setTimeout(() => {
        mainCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isBankLoaded]);

  const activeTerritoryName = useMemo(() => {
    if (selectedTerritoryId === null) return selectedBankName ?? 'SELECTED BANK';
    return nodesById[selectedTerritoryId]?.nodeNm ?? 'SELECTED TERRITORY';
  }, [selectedTerritoryId, nodesById, selectedBankName]);

  const totalBranchCount = useMemo(
    () => Object.values(nodesById).reduce((sum, node) => sum + node.branches.length, 0),
    [nodesById]
  );

  const handleCloseClick = () => {
    if (hasUnpublishedChanges) {
      setShowCloseConfirm(true);
    } else {
      dispatch(setShowPanel(false));
      document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    dispatch(setShowPanel(false));
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublish = async () => {
    if (isPublishing) return;
    dispatch(setIsPublishing(true));

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bankId: selectedBankId,
          nodesById,
          unassignedBranches,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish hierarchy changes.');
      }

      toast.success(data.message || 'Hierarchy changes successfully published!');
      dispatch(setHasUnpublishedChanges(false));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error occurred while publishing.');
    } finally {
      dispatch(setIsPublishing(false));
    }
  };

  if (!isBankLoaded) {
    return (
      <div className="territory-main-wrapper">
        <div className="workspace-main-card empty-workspace-card" ref={mainCardRef}>
          <div className="empty-state-content">
            <div className="empty-state-icon">🏦</div>
            <h3>Search for an Institution or Bank</h3>
            <p>
              Please search using an <strong>Individual ID</strong> or a <strong>Branch ID</strong> above to load the hierarchy manager.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="territory-main-wrapper">
      {/* Loading Overlay */}
      {isPublishing && (
        <div className="loading-overlay-custom">
          <div className="overlay-spinner" role="status" />
          <div className="overlay-text">Publishing hierarchy changes...</div>
        </div>
      )}

      {/* Unified Outer Big Card */}
      <div className="workspace-main-card" ref={mainCardRef}>
        {/* Card Header inside the big card */}
        <div className="card-header-inner">
          <div className="card-header-left">
            <h2 className="active-bank-title">{activeTerritoryName}</h2>
            <button
              className="link-detail"
              onClick={() => setShowDetails(true)}
              disabled={isPublishing}
            >
              view details
            </button>
          </div>
          <div className="card-header-actions">
            <button
              className="btn-outline-primary"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
            <button
              className="btn-close-panel"
              aria-label="Close Panel"
              onClick={handleCloseClick}
              disabled={isPublishing}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="card-header-divider" />

        {/* Side-by-Side Flex Layout containing inner sub-cards */}
        <div className="workspace-inner-grid">
          {/* Left inner card: Hierarchy tree & Assigned branches with divider */}
          <div className="left-inner-container">
            <div className="hierarchy-column">
              <TerritoryListPanel totalBranchCount={totalBranchCount} />
            </div>
            <div className="vertical-divider-line" />
            <div className="assigned-column">
              <AssignedBranchList />
            </div>
          </div>

          {/* Right inner card: Unassigned branches */}
          <div className="right-inner-container">
            <UnassignedBranchList />
          </div>
        </div>
      </div>

      {/* Close Confirmation Modal */}
      <Modal
        isOpen={showCloseConfirm}
        title="Discard Changes"
        onClose={() => setShowCloseConfirm(false)}
        footer={
          <div className="form-actions-footer">
            <button
              className="btn-secondary"
              onClick={() => setShowCloseConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
              onClick={handleConfirmClose}
            >
              Discard Changes
            </button>
          </div>
        }
      >
        <p>Are you sure? You will lose all your unpublished changes.</p>
      </Modal>

      {/* Bank Details sidebar */}
      <BankDetailsSidebar isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </div>
  );
};
