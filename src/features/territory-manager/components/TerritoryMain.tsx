import React, { useMemo, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { setShowPanel, setIsPublishing, setHasUnpublishedChanges } from '../store/territorySlice';
import { TerritoryListPanel } from './TerritoryListPanel';
import { AssignedBranchList } from './AssignedBranchList';
import { UnassignedBranchList } from './UnassignedBranchList';
import { Modal } from './Modal';
import { BankDetailsSidebar } from './BankDetailsSidebar';
import { toast } from 'sonner';

/**
 * Main 3-column workspace panel.
 * Reads all state from Redux — no props required.
 */
export const TerritoryMain: React.FC = () => {
  const dispatch = useAppDispatch();

  const nodesById = useAppSelector((s) => s.territory.nodesById);
  const unassignedBranches = useAppSelector((s) => s.territory.unassignedBranches);
  const selectedTerritoryId = useAppSelector((s) => s.territory.selectedTerritoryId);
  const selectedBankName = useAppSelector((s) => s.territory.selectedBankName);
  const selectedBankId = useAppSelector((s) => s.territory.selectedBankId);
  const hasUnpublishedChanges = useAppSelector((s) => s.territory.hasUnpublishedChanges);
  const isPublishing = useAppSelector((s) => s.territory.isPublishing);

  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    dispatch(setShowPanel(false));
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

  return (
    <div className="card shadow-sm border-light bg-white p-3 mb-4 flex-grow-1 position-relative">
      {/* Loading Overlay */}
      {isPublishing && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75 rounded"
          style={{ zIndex: 10, backdropFilter: 'blur(2px)' }}
        >
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="fw-semibold text-dark">Publishing hierarchy changes...</div>
        </div>
      )}

      {/* Panel Header */}
      <div className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
        <div>
          <h2 className="h4 text-uppercase fw-bold text-dark mb-0">{activeTerritoryName}</h2>
          <button
            className="btn btn-link p-0 text-primary small text-decoration-underline border-0"
            onClick={() => setShowDetails(true)}
            disabled={isPublishing}>
            view details
          </button>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-dark fw-semibold px-3 py-1 d-flex align-items-center gap-2"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </button>
          <button className="btn btn-light border-0 fs-5 p-1 px-2" aria-label="Close Panel"
            onClick={handleCloseClick}
            disabled={isPublishing}>
            ✕
          </button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="row g-3">
        <div className="col-12 col-lg-4 border-end">
          <TerritoryListPanel totalBranchCount={totalBranchCount} />
        </div>
        <div className="col-12 col-md-6 col-lg-4 border-end">
          <AssignedBranchList />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <UnassignedBranchList />
        </div>
      </div>

      {/* Close Confirmation Modal */}
      <Modal
        isOpen={showCloseConfirm}
        title="Discard Changes"
        onClose={() => setShowCloseConfirm(false)}
        footer={
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowCloseConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleConfirmClose}
            >
              Discard Changes
            </button>
          </div>
        }
      >
        <p className="mb-0">Are you sure? You will lose all your unpublished changes.</p>
      </Modal>

      {/* Bank Details sidebar — slides in from the right */}
      <BankDetailsSidebar isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </div>
  );
};
