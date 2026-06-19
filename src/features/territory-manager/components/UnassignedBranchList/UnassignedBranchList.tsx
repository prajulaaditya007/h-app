import React, { useState, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  setSelectedBranches,
  openModal,
  removeUnassignedBranch,
  removeUnassignedBranchesBatch,
} from '../../store/territorySlice';
import { useLazyList } from '../../utils/useLazyList';
import { UnassignedBranchItem } from '../UnassignedBranchItem/UnassignedBranchItem';
import { Search } from '../common/Search/Search';
import { AssignModal } from '../common/AssignModal/AssignModal';
import { toast } from 'sonner';
import './UnassignedBranchListStyles.css';

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

  const handleAssign = useCallback(
    (brancheId: string) => {
      dispatch(setSelectedBranches([brancheId]));
      dispatch(openModal({ title: 'Assign Branch', type: 'MOVE_BRANCHES_UNASSIGNED' }));
    },
    [dispatch]
  );

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
    <div className="unassigned-branch-list">
      <div className="unassigned-header-title">
        <h3>Unassigned Branches — {filteredBranches.length}</h3>
      </div>

      <div className="unassigned-search-wrapper">
        <Search id="search-unassigned" placeholder="Search unassigned branches..." value={searchQuery} onChange={setSearchQuery} />
      </div>

      {filteredBranches.length > 0 && (
        <div className="bulk-select-row">
          <div className="bulk-select-left">
            <input 
              type="checkbox" 
              className="bulk-select-checkbox" 
              checked={areAllSelected} 
              onChange={handleSelectAll}
              id="select-all-unassigned" 
            />
            <label htmlFor="select-all-unassigned" className="bulk-select-label">
              Select ALL
            </label>
          </div>
          {selectedForThisColumn.length > 0 && (
            <span className="selected-count-badge">
              {selectedForThisColumn.length} selected
            </span>
          )}
        </div>
      )}

      <div className="unassigned-branches-scroll-container">
        {filteredBranches.length === 0 ? (
          <div className="no-branches-placeholder">
            No unassigned branches match your criteria.
          </div>
        ) : (
          <div className="unassigned-branches-list-group">
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
              <div ref={observerTargetRef} className="loading-more-branches">
                Loading more branches...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="unassigned-footer-actions">
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
