import React, { useState, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import {
  setSelectedBranches,
  openModal,
  removeUnassignedBranch,
  removeUnassignedBranchesBatch,
} from '../store/territorySlice';
import { useLazyList } from '../utils/useLazyList';
import { UnassignedBranchItem } from './UnassignedBranchItem';
import { Search } from './common/Search';
import { AssignModal } from './common/AssignModal';
import { toast } from 'sonner';

export const UnassignedBranchList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const unassignedBranches = useAppSelector((s) => s.territory.unassignedBranches);
  const selectedBranchIds = useAppSelector((s) => s.territory.selectedBranchIds);
  const globalSearchQuery = useAppSelector((s) => s.territory.globalSearchQuery);
  const searchType = useAppSelector((s) => s.territory.searchType);

  const branchesList = useMemo(() => Object.values(unassignedBranches), [unassignedBranches]);

  const activeQuery = useMemo(() => {
    if (searchType === 'branch' && globalSearchQuery.trim()) return globalSearchQuery;
    return searchQuery;
  }, [globalSearchQuery, searchType, searchQuery]);

  const filteredBranches = useMemo(() => {
    const q = activeQuery.toLowerCase().trim();
    if (!q) return branchesList;
    return branchesList.filter(
      (b) => b.branchNm.toLowerCase().includes(q) || b.brancheId.toLowerCase().includes(q)
    );
  }, [branchesList, activeQuery]);

  const { visibleItems, hasMore, observerTargetRef } = useLazyList(filteredBranches, 50);

  const selectedForThisColumn = useMemo(
    () => selectedBranchIds.filter((id) => unassignedBranches[id] !== undefined),
    [selectedBranchIds, unassignedBranches]
  );

  const filteredBranchIds = useMemo(
    () => filteredBranches.map((b) => b.brancheId),
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

  /** Popover — Assign: select only this branch then open the assign modal */
  const handleAssign = useCallback(
    (brancheId: string) => {
      dispatch(setSelectedBranches([brancheId]));
      dispatch(openModal({ title: 'Assign Branch', type: 'MOVE_BRANCHES_UNASSIGNED' }));
    },
    [dispatch]
  );

  /** Popover — Delete: remove branch from the unassigned pool entirely */
  const handleDelete = useCallback(
    (brancheId: string) => {
      dispatch(removeUnassignedBranch(brancheId));
      toast.success('Branch deleted. Changes are not yet published.');
    },
    [dispatch]
  );

  const handleDeleteAll = () => {
    if (filteredBranches.length === 0) return;
    const count = filteredBranches.length;
    const confirmMsg = `Are you sure you want to delete all ${count} unassigned branch${count === 1 ? '' : 'es'} currently listed? This cannot be undone.`;
    if (window.confirm(confirmMsg)) {
      const branchIds = filteredBranches.map(b => b.brancheId);
      dispatch(removeUnassignedBranchesBatch(branchIds));
      toast.success(`Successfully deleted ${count} unassigned branch${count === 1 ? '' : 'es'}. Changes are not yet published.`);
    }
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="h6 text-uppercase fw-bold text-muted mb-0">
          Unassigned Branches — {filteredBranches.length}
        </h3>
      </div>

      <div className="mb-2">
        <Search id="search-unassigned" placeholder="Search unassigned branches..." value={searchQuery} onChange={setSearchQuery} />
      </div>

      {filteredBranches.length > 0 && (
        <div className="d-flex align-items-center justify-content-between p-2 border rounded bg-light mb-2">
          <div className="d-flex align-items-center gap-2">
            <input type="checkbox" className="form-check-input" checked={areAllSelected} onChange={handleSelectAll}
              id="select-all-unassigned" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <label htmlFor="select-all-unassigned" className="form-check-label small fw-semibold mb-0" style={{ cursor: 'pointer', userSelect: 'none' }}>
              Select ALL
            </label>
          </div>
          {selectedForThisColumn.length > 0 && (
            <span className="badge bg-secondary-subtle text-secondary-emphasis border small">
              {selectedForThisColumn.length} selected
            </span>
          )}
        </div>
      )}

      <div className="overflow-y-auto flex-grow-1 pe-1" style={{ maxHeight: '50vh', minHeight: '350px' }}>
        {filteredBranches.length === 0 ? (
          <div className="text-muted text-center py-5 small border border-dashed rounded">
            No unassigned branches match your criteria.
          </div>
        ) : (
          <div className="list-group">
            {visibleItems.map((branch) => (
              <UnassignedBranchItem
                key={branch.brancheId}
                branch={branch}
                isSelected={selectedBranchIds.includes(branch.brancheId)}
                onSelectChange={handleSelectChange}
                onAssign={handleAssign}
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
          disabled={selectedForThisColumn.length === 0}
          onClick={() => dispatch(openModal({ title: 'Assign Selected Branches', type: 'MOVE_BRANCHES_UNASSIGNED' }))}
        >
          Assign ({selectedForThisColumn.length})
        </button>
      </div>

      <AssignModal selectedBranchIds={selectedForThisColumn} />
    </div>
  );
};
