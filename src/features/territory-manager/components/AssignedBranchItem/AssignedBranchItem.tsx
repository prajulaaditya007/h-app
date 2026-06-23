import React from 'react';
import type { TerritoryHierarchyBranch } from '../../types';
import { ListItem, Popover } from '../../../../components/ui';
import './AssignedBranchItemStyles.css';

interface AssignedBranchItemProps {
  branch: TerritoryHierarchyBranch;
  nodeNm: string;
  isSelected: boolean;
  onSelectChange: (brancheId: string) => void;
  onReassign: (brancheId: string) => void;
  onUnassign: (brancheId: string) => void;
  onDelete: (brancheId: string) => void;
}

export const AssignedBranchItem: React.FC<AssignedBranchItemProps> = React.memo(
  ({ branch, nodeNm, isSelected, onSelectChange, onReassign, onUnassign, onDelete }) => {
    const actions = [
      {
        label: 'Reassign',
        icon: '↗',
        onClick: () => onReassign(branch.brancheId),
      },
      {
        label: 'Unassign',
        icon: '↩',
        onClick: () => onUnassign(branch.brancheId),
      },
      {
        label: 'Delete',
        icon: '🗑',
        variant: 'danger' as const,
        onClick: () => onDelete(branch.brancheId),
      },
    ];

    const menuButton = (
      <button
        type="button"
        className="assigned-branch-item-options-btn"
        title="Options"
        aria-label={`Options for ${branch.branchNm}`}
      >
        •••
      </button>
    );

    return (
      <ListItem
        variant="branch"
        label={branch.branchNm}
        sublabel={
          <>
            ID: {branch.brancheId}&nbsp;|&nbsp;
            <span className="assigned-branch-node-nm">{nodeNm}</span>
          </>
        }
        isSelected={isSelected}
        startSlot={
          <input
            type="checkbox"
            className="branch-checkbox"
            checked={isSelected}
            onChange={() => onSelectChange(branch.brancheId)}
            id={`branch-assigned-${branch.brancheId}`}
            onClick={(e) => e.stopPropagation()}
          />
        }
        endSlot={<Popover trigger={menuButton} actions={actions} />}
        onClick={() => onSelectChange(branch.brancheId)}
        id={`list-assigned-${branch.brancheId}`}
      />
    );
  }
);

AssignedBranchItem.displayName = 'AssignedBranchItem';
