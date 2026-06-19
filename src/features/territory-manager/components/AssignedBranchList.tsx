import React, { useState, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import {
  setSelectedBranches,
  openModal,
  removeBranchFromNode,
  removeBranchesBatch,
  unassignBranch,
} from '../store/territorySlice';
import { useLazyList } from '../utils/useLazyList';
import { useAssignedBranches } from '../utils/useAssignedBranches';
import { AssignedBranchItem } from './AssignedBranchItem';
import { Search } from './common/Search';
import { UnassignModal } from './common/UnassignModal';
import { toast } from 'sonner';

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

  /** Popover — Reassign: select only this branch then open the move modal */
  const handleReassign = useCallback(
    (brancheId: string) => {
      dispatch(setSelectedBranches([brancheId]));
      dispatch(openModal({ title: 'Reassign Branch', type: 'MOVE_BRANCHES_ASSIGNED' }));
    },
    [dispatch]
  );

  /** Popover — Unassign: move branch back to the unassigned pool */
  const handleUnassign = useCallback(
    (brancheId: string) => {
      dispatch(unassignBranch(brancheId));
      toast.success('Branch moved back to Unassigned. Changes are not yet published.');
    },
    [dispatch]
  );

  /** Popover — Delete: remove branch from the hierarchy entirely */
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
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="h6 text-uppercase fw-bold text-muted mb-0">
          Assigned Branches — {filteredBranches.length}
        </h3>
      </div>

      <div className="mb-2">
        <Search id="search-assigned" placeholder="Search assigned branches..." value={searchQuery} onChange={setSearchQuery} />
      </div>

      {filteredBranches.length > 0 && (
        <div className="d-flex align-items-center justify-content-between p-2 border rounded bg-light mb-2">
          <div className="d-flex align-items-center gap-2">
            <input type="checkbox" className="form-check-input" checked={areAllSelected} onChange={handleSelectAll}
              id="select-all-assigned" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <label htmlFor="select-all-assigned" className="form-check-label small fw-semibold mb-0" style={{ cursor: 'pointer', userSelect: 'none' }}>
              Select ALL
            </label>
          </div>
          {selectedBranchIdsForThisColumn.length > 0 && (
            <span className="badge bg-secondary-subtle text-secondary-emphasis border small">
              {selectedBranchIdsForThisColumn.length} selected
            </span>
          )}
        </div>
      )}

      <div className="overflow-y-auto flex-grow-1 pe-1" style={{ maxHeight: '50vh', minHeight: '350px' }}>
        {filteredBranches.length === 0 ? (
          <div className="text-muted text-center py-5 small border border-dashed rounded">
            No assigned branches match your criteria.
          </div>
        ) : (
          <div className="list-group">
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
              <div ref={observerTargetRef} className="text-center py-2 text-muted small border-top bg-light">
                Loading more branches...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="mt-auto pt-3 border-top bg-white d-flex gap-2">
        <button
          type="button"
          className="btn btn-outline-danger btn-sm flex-grow-1"
          style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: 600 }}
          disabled={filteredBranches.length === 0}
          onClick={handleDeleteAll}
        >
          Delete All ({filteredBranches.length})
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm flex-grow-1"
          style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: 600 }}
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
