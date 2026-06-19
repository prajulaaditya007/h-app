import React from 'react';
import type { UnassignedBranch } from '../types';
import { ListItem } from './common/ListItem';
import { Popover } from './common/Popover';

interface UnassignedBranchItemProps {
  branch: UnassignedBranch;
  isSelected: boolean;
  onSelectChange: (brancheId: string) => void;
  /** Open the Assign modal for just this one branch */
  onAssign: (brancheId: string) => void;
  /** Delete the branch from the unassigned pool entirely */
  onDelete: (brancheId: string) => void;
}

/** Single row in the Unassigned Branches list. */
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
        className="btn btn-sm btn-link p-0 text-muted text-decoration-none"
        style={{ lineHeight: 1, fontSize: '1rem', letterSpacing: '0.05em' }}
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
            className="form-check-input mt-0"
            checked={isSelected}
            onChange={() => onSelectChange(branch.brancheId)}
            id={`branch-unassigned-${branch.brancheId}`}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
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
