import React, { useState, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../../store';
import {
  setSelectedBranches,
  openModal,
  removeBranchFromNode,
  removeBranchesBatch,
  unassignBranch,
} from '../../store/territorySlice';
import { useLazyList } from '../../../../hooks/useLazyList';
import { useAssignedBranches } from '../../hooks/useAssignedBranches';
import { AssignedBranchItem } from '../AssignedBranchItem/AssignedBranchItem';
import { Search } from '../../../../components/ui';
import { UnassignModal } from '../modals/UnassignModal/UnassignModal';
import { toast } from 'sonner';
import './AssignedBranchListStyles.css';

export const AssignedBranchList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedBranchIds = useAppSelector((s) => s.territory.selectedBranchIds);
  const nodesById = useAppSelector((s) => s.territory.nodesById);

  const filteredBranches = useAssignedBranches(searchQuery);
  const { visibleItems, hasMore, observerTargetRef } = useLazyList(filteredBranches, 50);

  const allAssignedIds = useMemo(
    () => new Set(Object.values(nodesById).flatMap((n) => n.branches.map((b) => b.brancheId))),
    [nodesById]
  );
  const selectedBranchIdsForThisColumn = useMemo(
    () => selectedBranchIds.filter((id) => allAssignedIds.has(id)),
    [selectedBranchIds, allAssignedIds]
  );

  const filteredBranchIds = useMemo(
    () => filteredBranches.map((e) => e.branch.brancheId),
    [filteredBranches]
  );
  const areAllSelected =
    filteredBranchIds.length > 0 &&
    filteredBranchIds.every((id) => selectedBranchIds.includes(id));

  const handleSelectChange = useCallback(
    (brancheId: string) => {
      const next = selectedBranchIds.includes(brancheId)
        ? selectedBranchIds.filter((id) => id !== brancheId)
        : [...selectedBranchIds, brancheId];
      dispatch(setSelectedBranches(next));
    },
    [selectedBranchIds, dispatch]
  );

  const handleSelectAll = () => {
    const next = areAllSelected
      ? selectedBranchIds.filter((id) => !filteredBranchIds.includes(id))
      : Array.from(new Set([...selectedBranchIds, ...filteredBranchIds]));
    dispatch(setSelectedBranches(next));
  };

  const handleReassign = useCallback(
    (brancheId: string) => {
      dispatch(setSelectedBranches([brancheId]));
      dispatch(openModal({ title: 'Reassign Branch', type: 'MOVE_BRANCHES_ASSIGNED' }));
    },
    [dispatch]
  );

  const handleUnassign = useCallback(
    (brancheId: string) => {
      dispatch(unassignBranch(brancheId));
      toast.success('Branch moved back to Unassigned. Changes are not yet published.');
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (brancheId: string) => {
      dispatch(removeBranchFromNode(brancheId));
      toast.success('Branch deleted. Changes are not yet published.');
    },
    [dispatch]
  );

  const handleDeleteAll = () => {
    if (filteredBranches.length === 0) return;
    const count = filteredBranches.length;
    const confirmMsg = `Are you sure you want to delete all ${count} assigned branch${count === 1 ? '' : 'es'} currently listed? This cannot be undone.`;
    if (window.confirm(confirmMsg)) {
      const branchIds = filteredBranches.map(e => e.branch.brancheId);
      dispatch(removeBranchesBatch(branchIds));
      toast.success(`Successfully deleted ${count} branch${count === 1 ? '' : 'es'}. Changes are not yet published.`);
    }
  };

  return (
    <div className="assigned-branch-list">
      <div className="assigned-header-title">
        <h3>Assigned Branches — {filteredBranches.length}</h3>
      </div>

      <div className="assigned-search-wrapper">
        <Search id="search-assigned" placeholder="Search assigned branches..." value={searchQuery} onChange={setSearchQuery} />
      </div>

      {filteredBranches.length > 0 && (
        <div className="bulk-select-row">
          <div className="bulk-select-left">
            <input 
              type="checkbox" 
              className="bulk-select-checkbox" 
              checked={areAllSelected} 
              onChange={handleSelectAll}
              id="select-all-assigned" 
            />
            <label htmlFor="select-all-assigned" className="bulk-select-label">
              Select ALL
            </label>
          </div>
          {selectedBranchIdsForThisColumn.length > 0 && (
            <span className="selected-count-badge">
              {selectedBranchIdsForThisColumn.length} selected
            </span>
          )}
        </div>
      )}

      <div className="assigned-branches-scroll-container">
        {filteredBranches.length === 0 ? (
          <div className="no-branches-placeholder">
            No assigned branches match your criteria.
          </div>
        ) : (
          <div className="assigned-branches-list-group">
            {visibleItems.map(({ branch, nodeNm }) => (
              <AssignedBranchItem
                key={branch.brancheId}
                branch={branch}
                nodeNm={nodeNm}
                isSelected={selectedBranchIds.includes(branch.brancheId)}
                onSelectChange={handleSelectChange}
                onReassign={handleReassign}
                onUnassign={handleUnassign}
                onDelete={handleDelete}
              />
            ))}
            {hasMore && (
              <div ref={observerTargetRef} className="loading-more-branches">
                Loading more branches...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="assigned-footer-actions">
        <button
          type="button"
          className="btn-danger-outline"
          disabled={filteredBranches.length === 0}
          onClick={handleDeleteAll}
        >
          Delete All ({filteredBranches.length})
        </button>
        <button
          type="button"
          className="btn-primary-action"
          disabled={selectedBranchIdsForThisColumn.length === 0}
          onClick={() => dispatch(openModal({ title: 'Move Selected Branches', type: 'MOVE_BRANCHES_ASSIGNED' }))}
        >
          Reassign ({selectedBranchIdsForThisColumn.length})
        </button>
      </div>

      <UnassignModal selectedBranchIds={selectedBranchIdsForThisColumn} />
    </div>
  );
};
