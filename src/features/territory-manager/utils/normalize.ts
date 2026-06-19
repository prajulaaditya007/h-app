import type { TerritoryHierarchyNode } from '../types';

/**
 * Normalizes a list of hierarchical territory nodes by flattening them into a key-value dictionary.
 * Recursively traverses all child nodes.
 * 
 * @param nodes List of root-level TerritoryHierarchyNode objects
 * @returns Record mapping nodeId to TerritoryHierarchyNode
 */
export function normalizeNodes(nodes: TerritoryHierarchyNode[]): Record<number, TerritoryHierarchyNode> {
  const normalized: Record<number, TerritoryHierarchyNode> = {};

  function traverse(node: TerritoryHierarchyNode) {
    normalized[node.nodeId] = {
      ...node,
      // Create copies of child nodes references at this point
      branches: [...node.branches],
      childNodes: [...node.childNodes],
    };
    
    if (node.childNodes && node.childNodes.length > 0) {
      node.childNodes.forEach(traverse);
    }
  }

  nodes.forEach(traverse);
  return normalized;
}
