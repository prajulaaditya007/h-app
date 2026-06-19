import React from 'react';
import type { UnassignedBranch } from '../../types';
import { ListItem } from '../common/ListItem/ListItem';
import { Popover } from '../common/Popover/Popover';
import './UnassignedBranchItemStyles.css';

interface UnassignedBranchItemProps {
  branch: UnassignedBranch;
  isSelected: boolean;
  onSelectChange: (brancheId: string) => void;
  onAssign: (brancheId: string) => void;
  onDelete: (brancheId: string) => void;
}

export const UnassignedBranchItem: React.FC<UnassignedBranchItemProps> = React.memo(
  ({ branch, isSelected, onSelectChange, onAssign, onDelete }) => {
    const actions = [
      {
        label: 'Assign',
        icon: '↗',
        onClick: () => onAssign(branch.brancheId),
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
        className="unassigned-branch-item-options-btn"
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
        sublabel={`ID: ${branch.brancheId}`}
        isSelected={isSelected}
        startSlot={
          <input
            type="checkbox"
            className="branch-checkbox"
            checked={isSelected}
            onChange={() => onSelectChange(branch.brancheId)}
            id={`branch-unassigned-${branch.brancheId}`}
            onClick={(e) => e.stopPropagation()}
          />
        }
        endSlot={<Popover trigger={menuButton} actions={actions} />}
        onClick={() => onSelectChange(branch.brancheId)}
        id={`list-unassigned-${branch.brancheId}`}
      />
    );
  }
);

UnassignedBranchItem.displayName = 'UnassignedBranchItem';
