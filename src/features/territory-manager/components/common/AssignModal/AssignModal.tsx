import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { assignBranchesBatch, closeModal } from '../../../store/territorySlice';
import type { UnassignedBranch } from '../../../types';
import { Modal } from '../../Modal/Modal';
import { MoveBranchesForm } from '../MoveBranchesForm/MoveBranchesForm';
import { toast } from 'sonner';
import './AssignModalStyles.css';

const MODAL_TYPE = 'MOVE_BRANCHES_UNASSIGNED';

interface AssignModalProps {
  selectedBranchIds: string[];
}

export const AssignModal: React.FC<AssignModalProps> = ({ selectedBranchIds }) => {
  const dispatch = useAppDispatch();
  const modalState = useAppSelector((s) => s.territory.modal);
  const nodesById = useAppSelector((s) => s.territory.nodesById);
  const unassignedBranches = useAppSelector((s) => s.territory.unassignedBranches);

  const handleSubmit = (targetNodeId: number) => {
    const targetNode = nodesById[targetNodeId];
    if (!targetNode) {
      toast.error('Failed to assign branches: Target territory node not found.');
      dispatch(closeModal());
      return;
    }

    try {
      const branchNames: string[] = [];
      const updatedBranches = [...targetNode.branches];

      selectedBranchIds.forEach((branchId) => {
        const branch = unassignedBranches[branchId] as UnassignedBranch | undefined;
        if (branch) {
          branchNames.push(branch.branchNm);
          if (!updatedBranches.some((b) => b.brancheId === branchId)) {
            updatedBranches.push({ brancheId: branch.brancheId, branchNm: branch.branchNm });
          }
        }
      });

      console.log('[API POST] Assign Branches', {
        url: '/api/territory/assign-branches-batch',
        method: 'POST',
        body: {
          removedFromUnassigned: selectedBranchIds,
          addedTo: { ...targetNode, branches: updatedBranches },
        },
      });

      dispatch(assignBranchesBatch({ branchIds: selectedBranchIds, targetNodeId }));

      const branchLabel = branchNames.length === 1
        ? `Branch ${branchNames[0]}`
        : `${branchNames.length} branches`;

      toast.success(`${branchLabel} is successfully assigned to the territory ${targetNode.nodeNm}, but the changes are not yet published.`);
    } catch (error) {
      toast.error(`Failed to assign branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      dispatch(closeModal());
    }
  };

  return (
    <Modal
      isOpen={modalState.isOpen && modalState.type === MODAL_TYPE}
      title={modalState.title}
      onClose={() => dispatch(closeModal())}
      footer={null}
    >
      <div className="assign-modal-wrapper">
        <MoveBranchesForm selectedBranchIds={selectedBranchIds} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
};
