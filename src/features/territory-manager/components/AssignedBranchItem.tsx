import React from 'react';
import type { TerritoryHierarchyBranch } from '../types';
import { ListItem } from './common/ListItem';
import { Popover } from './common/Popover';

interface AssignedBranchItemProps {
  branch: TerritoryHierarchyBranch;
  /** Name of the territory node this branch currently belongs to */
  nodeNm: string;
  isSelected: boolean;
  onSelectChange: (brancheId: string) => void;
  /** Open the Move/Reassign modal for just this one branch */
  onReassign: (brancheId: string) => void;
  /** Unassign — moves branch back to the unassigned pool */
  onUnassign: (brancheId: string) => void;
  /** Delete the branch entirely */
  onDelete: (brancheId: string) => void;
}

/** Single row in the Assigned Branches list. */
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
        sublabel={
          <>
            ID: {branch.brancheId}&nbsp;|&nbsp;
            <span className="text-primary-emphasis fw-medium">{nodeNm}</span>
          </>
        }
        isSelected={isSelected}
        startSlot={
          <input
            type="checkbox"
            className="form-check-input mt-0"
            checked={isSelected}
            onChange={() => onSelectChange(branch.brancheId)}
            id={`branch-assigned-${branch.brancheId}`}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
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
