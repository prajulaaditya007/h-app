import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { moveBranchesBatch, closeModal } from '../../../store/territorySlice';
import type { TerritoryHierarchyNode } from '../../../types';
import { Modal } from '@/components/ui';
import { MoveBranchesForm } from '../MoveBranchesForm/MoveBranchesForm';
import { toast } from 'sonner';
import './UnassignModalStyles.css';

const MODAL_TYPE = 'MOVE_BRANCHES_ASSIGNED';

interface UnassignModalProps {
  selectedBranchIds: string[];
}

export const UnassignModal: React.FC<UnassignModalProps> = ({ selectedBranchIds }) => {
  const dispatch = useAppDispatch();
  const modalState = useAppSelector((s) => s.territory.modal);
  const nodesById = useAppSelector((s) => s.territory.nodesById);

  const handleSubmit = (targetNodeId: number) => {
    const targetNode = nodesById[targetNodeId];
    if (!targetNode) {
      toast.error('Failed to move branches: Target territory node not found.');
      dispatch(closeModal());
      return;
    }

    try {
      const updatedNodesMap: Record<number, TerritoryHierarchyNode> = {};
      const updatedTarget = { ...targetNode, branches: [...targetNode.branches] };
      const branchNames: string[] = [];

      selectedBranchIds.forEach((branchId) => {
        const sourceNode = Object.values(nodesById).find((n) =>
          n.branches.some((b) => b.brancheId === branchId)
        );
        if (!sourceNode) return;

        const branch = sourceNode.branches.find((b) => b.brancheId === branchId);
        if (branch) {
          branchNames.push(branch.branchNm);
        }

        if (!updatedNodesMap[sourceNode.nodeId]) {
          updatedNodesMap[sourceNode.nodeId] = { ...sourceNode, branches: [...sourceNode.branches] };
        }
        updatedNodesMap[sourceNode.nodeId].branches = updatedNodesMap[sourceNode.nodeId].branches.filter(
          (b) => b.brancheId !== branchId
        );

        if (branch && !updatedTarget.branches.some((b) => b.brancheId === branchId)) {
          updatedTarget.branches.push(branch);
        }
      });

      updatedNodesMap[targetNodeId] = updatedTarget;
      console.log('[API POST] Move Branches', {
        url: '/api/territory/move-branches-batch',
        method: 'POST',
        body: { updatedNodes: Object.values(updatedNodesMap) },
      });

      dispatch(moveBranchesBatch({ branchIds: selectedBranchIds, targetNodeId }));

      const branchLabel = branchNames.length === 1
        ? `Branch ${branchNames[0]}`
        : `${branchNames.length} branches`;

      toast.success(`${branchLabel} is successfully moved to the territory ${targetNode.nodeNm}, but the changes are not yet published.`);
    } catch (error) {
      toast.error(`Failed to move branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      <div className="unassign-modal-wrapper">
        <MoveBranchesForm selectedBranchIds={selectedBranchIds} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
};
