import type { TerritoryHierarchyNode, TerritoryHierarchyBranch, UnassignedBranch } from '../types';

const regionsMap: Record<string, string[]> = {
  'Northeast Region': ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'Rhode Island', 'Vermont', 'New Jersey', 'New York', 'Pennsylvania'],
  'Midwest Region': ['Illinois', 'Indiana', 'Michigan', 'Ohio', 'Wisconsin', 'Iowa', 'Kansas', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
  'Southern Region': ['Delaware', 'Florida', 'Georgia', 'Maryland', 'North Carolina', 'South Carolina', 'Virginia', 'West Virginia', 'Alabama', 'Kentucky', 'Mississippi', 'Tennessee', 'Arkansas', 'Louisiana', 'Oklahoma', 'Texas'],
  'Western Region': ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming', 'Alaska', 'California', 'Hawaii', 'Oregon', 'Washington']
};

const citySuffixes = [
  'Springfield', 'Franklin', 'Clinton', 'Greenville', 'Bristol', 
  'Fairview', 'Salem', 'Madison', 'Georgetown', 'Arlington', 
  'Jackson', 'Richmond', 'Burlington', 'Oakland', 'Milford', 
  'Newport', 'Chester', 'Centerville', 'Cleveland', 'Dayton', 
  'Lincoln', 'Lexington', 'Portland', 'Auburn', 'Columbiana'
];

export function generateUSStateData(): {
  hierarchy: TerritoryHierarchyNode[];
  unassigned: UnassignedBranch[];
} {
  const hierarchy: TerritoryHierarchyNode[] = [];
  const unassigned: UnassignedBranch[] = [];

  let nodeIdCounter = 1;
  let regionIdCounter = 1000;
  let branchIdCounter = 1;

  Object.entries(regionsMap).forEach(([regionName, states]) => {
    const regionNodeId = regionIdCounter++;
    const stateNodes: TerritoryHierarchyNode[] = [];

    states.forEach(stateName => {
      const stateNodeId = nodeIdCounter++;
      const assignedBranches: TerritoryHierarchyBranch[] = [];

      // Generate 25 cities for each state
      citySuffixes.forEach((suffix, idx) => {
        const branchCode = `${stateName.substring(0, 2).toUpperCase()}-${String(branchIdCounter++).padStart(4, '0')}`;
        const branchName = `${stateName} ${suffix}`;

        // 20 cities are assigned, 5 are unassigned
        if (idx < 20) {
          assignedBranches.push({
            brancheId: branchCode,
            branchNm: `${branchName} Branch`,
          });
        } else {
          unassigned.push({
            brancheId: branchCode,
            branchNm: `${branchName} Branch`,
            isAssigned: false,
          });
        }
      });

      stateNodes.push({
        nodeId: stateNodeId,
        parentNodeId: regionNodeId,
        nodeNm: `${stateName} Territory`,
        nodeDesc: `Branch management for the state of ${stateName}`,
        branches: assignedBranches,
        childNodes: [],
      });
    });

    hierarchy.push({
      nodeId: regionNodeId,
      parentNodeId: null,
      nodeNm: regionName,
      nodeDesc: `US Regional Division for the ${regionName}`,
      branches: [],
      childNodes: stateNodes,
    });
  });

  return { hierarchy, unassigned };
}
