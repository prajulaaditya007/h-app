import React, { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { setSelectedTerritory } from '../../store/territorySlice';
import { TerritoryAccordion } from '../TerritoryAccordion/TerritoryAccordion';
import { Search } from '../common/Search/Search';
import './TerritoryListPanelStyles.css';

interface TerritoryListPanelProps {
  totalBranchCount: number;
}

export const TerritoryListPanel: React.FC<TerritoryListPanelProps> = ({
  totalBranchCount,
}) => {
  const dispatch = useAppDispatch();
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const nodesById = useAppSelector((s) => s.territory.nodesById);
  const rootNodeIds = useAppSelector((s) => s.territory.rootNodeIds);
  const selectedTerritoryId = useAppSelector((s) => s.territory.selectedTerritoryId);
  const globalSearchQuery = useAppSelector((s) => s.territory.globalSearchQuery);
  const searchType = useAppSelector((s) => s.territory.searchType);
  const hasUnpublishedChanges = useAppSelector((s) => s.territory.hasUnpublishedChanges);

  const allNodesList = useMemo(() => Object.values(nodesById), [nodesById]);

  const visibleNodeIds = useMemo(() => {
    const visible = new Set<number>();
    const query = (localSearchQuery.trim() || (searchType === 'individual' ? globalSearchQuery.trim() : '')).toLowerCase();
    if (!query) {
      allNodesList.forEach((n) => visible.add(n.nodeId));
      return visible;
    }

    const matches = allNodesList.filter((n) => n.nodeNm.toLowerCase().includes(query) || (n.nodeDesc && n.nodeDesc.toLowerCase().includes(query)));
    matches.forEach((m) => {
      visible.add(m.nodeId);
      let pId = m.parentNodeId;
      while (pId) {
        visible.add(pId);
        pId = nodesById[pId]?.parentNodeId;
      }
    });

    return visible;
  }, [localSearchQuery, globalSearchQuery, searchType, allNodesList, nodesById]);

  const handleSelectAll = () => {
    dispatch(setSelectedTerritory(null));
  };

  const isAllSelected = selectedTerritoryId === null;

  return (
    <div className="territory-list-panel">
      <div className="panel-header-title">
        <h3>Territories List</h3>
      </div>
      <div className="panel-search-wrapper">
        <Search id="search-territories" placeholder="Search territories..." value={localSearchQuery} onChange={setLocalSearchQuery} />
      </div>

      <div className="panel-scroll-container">
        {/* ALL TERRITORY row */}
        <div 
          onClick={handleSelectAll}
          className={`all-territory-row ${isAllSelected ? 'selected' : ''}`}
        >
          <div className="all-territory-left">
            <span className="all-territory-dot" />
            <div className="all-territory-label">ALL TERRITORY</div>
          </div>
          <div className="all-territory-right">
            <span className="all-territory-badge">{totalBranchCount}</span>
            <button 
              className="all-territory-options-btn"
              onClick={(e) => { e.stopPropagation(); console.log('Actions for ALL TERRITORY clicked'); }}
            >
              •••
            </button>
          </div>
        </div>
        {rootNodeIds.map((nodeId) => (
          <TerritoryAccordion key={nodeId} nodeId={nodeId} visibleNodeIds={visibleNodeIds} />
        ))}
      </div>

      {hasUnpublishedChanges && (
        <div className="unpublished-alert">
          <span>⚠️ Changes are not yet published</span>
        </div>
      )}
    </div>
  );
};
