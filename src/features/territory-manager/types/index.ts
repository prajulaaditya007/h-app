export interface TerritoryHierarchyItem {
  id: number;
  versionId: number;
  instId: number;
  status: string;
}

export interface TerritoryHierarchyBranch {
  brancheId: string;
  branchNm: string;
}

export interface TerritoryHierarchyNode {
  nodeId: number;
  parentNodeId: number | null;
  nodeNm: string;
  nodeDesc: string;
  branches: TerritoryHierarchyBranch[];
  childNodes: TerritoryHierarchyNode[];
}

export interface GetTerritoryHierarchyDetailsById {
  mainId: string;
  verId: number;
  status: string;
  nodes: TerritoryHierarchyNode[];
}

export interface UnassignedBranch extends TerritoryHierarchyBranch {
  isAssigned: boolean;
}
