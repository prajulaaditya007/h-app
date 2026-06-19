import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { setSelectedTerritory } from '../store/territorySlice';
import { ListItem } from './common/ListItem';

export interface TerritoryAccordionProps {
  nodeId: number;
  visibleNodeIds: Set<number>;
}

export const TerritoryAccordion: React.FC<TerritoryAccordionProps> = ({
  nodeId,
  visibleNodeIds,
}) => {
  const dispatch = useAppDispatch();

  const node = useAppSelector(state => state.territory.nodesById[nodeId]);
  const isSelected = useAppSelector(state => state.territory.selectedTerritoryId === nodeId);

  // Recursive branch count computed inside the selector so component only re-renders if count changes
  const branchCount = useAppSelector(state => {
    const nodes = state.territory.nodesById;
    const getCount = (id: number): number => {
      const n = nodes[id];
      if (!n) return 0;
      let count = n.branches.length;
      n.childNodes?.forEach(child => {
        count += getCount(child.nodeId);
      });
      return count;
    };
    return getCount(nodeId);
  });

  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!node || !visibleNodeIds.has(nodeId)) return null;

  const hasChildren = node.childNodes && node.childNodes.length > 0;
  const hasBranches = node.branches.length > 0;
  const isExpandable = hasChildren || hasBranches;

  // Determine variant by depth — root nodes have no parentNodeId
  const variant = node.parentNodeId ? 'sub-territory' : 'territory';

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedTerritory(isSelected ? null : nodeId));
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(prev => !prev);
  };

  // ── Slots ──────────────────────────────────────────────────────────────────

  const startSlot = isExpandable ? (
    <button
      onClick={handleToggle}
      className={`btn btn-link p-0 text-decoration-none d-flex align-items-center justify-content-center ${
        isSelected ? 'text-success-emphasis' : 'text-body-secondary'
      }`}
      style={{
        width: '20px',
        height: '20px',
        transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
        transition: 'transform 0.15s ease-in-out',
      }}
      aria-label={isCollapsed ? 'Expand' : 'Collapse'}
    >
      ▶
    </button>
  ) : (
    <span
      className={`d-inline-block rounded-circle ${isSelected ? 'bg-success' : 'bg-secondary'}`}
      style={{ width: '6px', height: '6px', margin: '0 7px' }}
    />
  );

  const endSlot = (
    <>
      <span className="badge bg-light text-dark border">{branchCount}</span>
      <button
        className="btn btn-sm btn-link p-0 text-dark font-monospace fw-bold text-decoration-none"
        title="Options"
        onClick={(e) => {
          e.stopPropagation();
          console.log(`Actions for ${node.nodeNm} clicked`);
        }}
      >
        •••
      </button>
    </>
  );

  return (
    <div
      className={`border rounded mb-2 overflow-hidden ${isSelected ? 'border-success' : 'border-light-subtle'}`}
      style={{
        transition: 'all 0.2s ease-in-out',
        borderLeft: isSelected ? '5px solid #d9534f' : undefined,
      }}
    >
      {/* Node header row — uses ListItem for uniform visual language */}
      <ListItem
        variant={variant}
        label={node.nodeNm}
        sublabel={node.nodeDesc}
        isSelected={isSelected}
        startSlot={startSlot}
        endSlot={endSlot}
        onClick={handleSelect}
        className="border-0 rounded-0 mb-0"
        style={{ borderLeft: 'none' }}  /* outer div owns the left border */
      />

      {/* Expanded content — sub-territories then direct branches, all at the same indent */}
      {!isCollapsed && (hasChildren || hasBranches) && (
        <div className="border-top border-light-subtle" style={{ paddingLeft: '16px', paddingTop: '4px', paddingBottom: '4px', paddingRight: '8px', backgroundColor: 'var(--bs-body-bg)' }}>
          {/* Child territory nodes recurse into their own accordion */}
          {node.childNodes.map(child => (
            <TerritoryAccordion
              key={child.nodeId}
              nodeId={child.nodeId}
              visibleNodeIds={visibleNodeIds}
            />
          ))}

          {/* Direct branches on this node — no header, just rows */}
          {node.branches.map(branch => (
            <ListItem
              key={branch.brancheId}
              variant="branch"
              label={branch.branchNm}
              sublabel={`ID: ${branch.brancheId}`}
              startSlot={
                <span
                  className="d-inline-block rounded-circle bg-secondary flex-shrink-0"
                  style={{ width: '6px', height: '6px', margin: '0 7px' }}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
