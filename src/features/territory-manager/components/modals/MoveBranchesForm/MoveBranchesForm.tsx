import React, { useState } from 'react';
import { useAppSelector } from '@/store';
import { Dropdown } from '@/components/ui';
import './MoveBranchesFormStyles.css';

interface MoveBranchesFormProps {
  selectedBranchIds: string[];
  onSubmit: (targetNodeId: number) => void;
}

export const MoveBranchesForm: React.FC<MoveBranchesFormProps> = ({
  selectedBranchIds,
  onSubmit,
}) => {
  const rootNodeIds = useAppSelector((s) => s.territory.rootNodeIds);
  const nodesById = useAppSelector((s) => s.territory.nodesById);
  const [selectedPath, setSelectedPath] = useState<number[]>([]);

  const activeTargetId = selectedPath[selectedPath.length - 1] ?? null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTargetId !== null) onSubmit(activeTargetId);
  };

  const getOptionsForLevel = (levelIndex: number) => {
    if (levelIndex === 0) {
      return rootNodeIds
        .map((id) => nodesById[id])
        .filter(Boolean)
        .map((n) => ({ value: n.nodeId, label: `${n.nodeNm} (ID: ${n.nodeId})` }));
    }
    const parentId = selectedPath[levelIndex - 1];
    if (parentId && nodesById[parentId]) {
      return nodesById[parentId].childNodes.map((n) => ({
        value: n.nodeId,
        label: `${n.nodeNm} (ID: ${n.nodeId})`,
      }));
    }
    return [];
  };

  const handleChange = (levelIndex: number, value: string) => {
    const id = value ? Number(value) : null;
    const newPath = selectedPath.slice(0, levelIndex);
    if (id !== null) newPath.push(id);
    setSelectedPath(newPath);
  };

  const levels = [0, 1];
  for (let i = 1; i < selectedPath.length; i++) {
    const node = nodesById[selectedPath[i]];
    if (node?.childNodes?.length > 0) levels.push(i + 1);
  }

  const getLevelLabel = (i: number) =>
    i === 0 ? 'Territory' : i === 1 ? 'Sub-Territory' : `Sub-Territory (Level ${i})`;

  return (
    <form className="move-branches-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label-bold">
          Moving {selectedBranchIds.length} branch(es):
        </label>
        <div className="selected-branches-display">
          {selectedBranchIds.join(', ')}
        </div>
      </div>

      <div className="select-fields-card">
        {levels.map((levelIndex) => (
          <Dropdown
            key={levelIndex}
            id={`cascaded-select-level-${levelIndex}`}
            label={getLevelLabel(levelIndex)}
            value={selectedPath[levelIndex] ?? ''}
            options={getOptionsForLevel(levelIndex)}
            placeholder={levelIndex === 0 ? '-- Select a Territory --' : '-- Select a Sub-Territory --'}
            disabled={levelIndex > 0 && selectedPath[levelIndex - 1] === undefined}
            hint={levelIndex > 0 && selectedPath[levelIndex - 1] === undefined ? '(select a territory first)' : undefined}
            onChange={(val) => handleChange(levelIndex, val)}
          />
        ))}
      </div>

      <div className="form-actions-footer">
        <button
          type="submit"
          className="btn-primary"
          disabled={activeTargetId === null}
        >
          Confirm Move
        </button>
      </div>
    </form>
  );
};
