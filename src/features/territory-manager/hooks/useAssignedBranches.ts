import { useMemo } from 'react';
import { useAppSelector } from '@/store';
import type { TerritoryHierarchyBranch } from '../types';

export type AssignedBranchEntry = {
  branch: TerritoryHierarchyBranch;
  nodeId: number;
  nodeNm: string;
};

/**
 * Derives the filtered list of assigned branches to display in AssignedBranchList.
 *
 * Rules:
 *  - null selectedTerritoryId  → all assigned branches across the whole tree
 *  - specific territory selected → recursively collect from that node + all descendants
 *  - local/global search query  → filter the result by branch name or ID
 */
export const useAssignedBranches = (localSearchQuery: string): AssignedBranchEntry[] => {
  const nodesById = useAppSelector((s) => s.territory.nodesById);
  const selectedTerritoryId = useAppSelector((s) => s.territory.selectedTerritoryId);
  const globalSearchQuery = useAppSelector((s) => s.territory.globalSearchQuery);
  const searchType = useAppSelector((s) => s.territory.searchType);

  // Branches visible for the active territory selection (recursive for parent nodes)
  const activeBranches = useMemo<AssignedBranchEntry[]>(() => {
    if (selectedTerritoryId === null) {
      const result: AssignedBranchEntry[] = [];
      Object.values(nodesById).forEach((node) => {
        node.branches.forEach((branch) => {
          result.push({ branch, nodeId: node.nodeId, nodeNm: node.nodeNm });
        });
      });
      return result;
    }

    const collect = (nodeId: number): AssignedBranchEntry[] => {
      const node = nodesById[nodeId];
      if (!node) return [];
      const own = node.branches.map((branch) => ({ branch, nodeId: node.nodeId, nodeNm: node.nodeNm }));
      const fromChildren = node.childNodes.flatMap((child) => collect(child.nodeId));
      return [...own, ...fromChildren];
    };

    return collect(selectedTerritoryId);
  }, [selectedTerritoryId, nodesById]);

  // Active search query: global branch search takes priority over local search
  const activeSearchQuery = useMemo(() => {
    if (searchType === 'branch' && globalSearchQuery.trim()) return globalSearchQuery;
    return localSearchQuery;
  }, [globalSearchQuery, searchType, localSearchQuery]);

  // Apply text filter
  return useMemo(() => {
    const query = activeSearchQuery.toLowerCase().trim();
    if (!query) return activeBranches;
    return activeBranches.filter(
      ({ branch }) =>
        branch.branchNm.toLowerCase().includes(query) ||
        branch.brancheId.toLowerCase().includes(query)
    );
  }, [activeBranches, activeSearchQuery]);
};
