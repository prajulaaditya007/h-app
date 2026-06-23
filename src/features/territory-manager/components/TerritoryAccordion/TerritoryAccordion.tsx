import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../../store';
import { setSelectedTerritory } from '../../store/territorySlice';
import { ListItem } from '../../../../components/ui';
import './TerritoryAccordionStyles.css';

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

  const variant = node.parentNodeId ? 'sub-territory' : 'territory';

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedTerritory(isSelected ? null : nodeId));
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(prev => !prev);
  };

  // Slots
  const startSlot = isExpandable ? (
    <button
      onClick={handleToggle}
      className={`accordion-toggle-btn ${isCollapsed ? '' : 'expanded'}`}
      aria-label={isCollapsed ? 'Expand' : 'Collapse'}
    >
      ▶
    </button>
  ) : (
    <span
      className={`accordion-leaf-dot ${isSelected ? 'selected' : ''}`}
    />
  );

  const endSlot = (
    <>
      <span className="accordion-badge-count">{branchCount}</span>
      <button
        className="accordion-options-btn"
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
    <div className={`accordion-node-container ${isSelected ? 'selected' : ''}`}>
      <ListItem
        variant={variant}
        label={node.nodeNm}
        sublabel={node.nodeDesc}
        isSelected={isSelected}
        startSlot={startSlot}
        endSlot={endSlot}
        onClick={handleSelect}
        className="border-0 rounded-0 mb-0"
        style={{ borderLeft: 'none' }}
      />

      {!isCollapsed && (hasChildren || hasBranches) && (
        <div className="accordion-expanded-content">
          {node.childNodes.map(child => (
            <TerritoryAccordion
              key={child.nodeId}
              nodeId={child.nodeId}
              visibleNodeIds={visibleNodeIds}
            />
          ))}

          {node.branches.map(branch => (
            <ListItem
              key={branch.brancheId}
              variant="branch"
              label={branch.branchNm}
              sublabel={`ID: ${branch.brancheId}`}
              startSlot={
                <span className="accordion-leaf-dot" />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
