import type { TerritoryHierarchyNode, TerritoryHierarchyBranch, UnassignedBranch } from '../src/features/territory-manager/types';

// ─── USA Data ─────────────────────────────────────────────────────────────────

const usRegions: Record<string, string[]> = {
  'Northeast Region': ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'Rhode Island', 'Vermont', 'New Jersey', 'New York', 'Pennsylvania'],
  'Midwest Region': ['Illinois', 'Indiana', 'Michigan', 'Ohio', 'Wisconsin', 'Iowa', 'Kansas', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
  'Southern Region': ['Delaware', 'Florida', 'Georgia', 'Maryland', 'North Carolina', 'South Carolina', 'Virginia', 'West Virginia', 'Alabama', 'Kentucky', 'Mississippi', 'Tennessee', 'Arkansas', 'Louisiana', 'Oklahoma', 'Texas'],
  'Western Region': ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming', 'Alaska', 'California', 'Hawaii', 'Oregon', 'Washington'],
};

// ─── India Data ───────────────────────────────────────────────────────────────

const indiaRegions: Record<string, string[]> = {
  'North Zone': ['Delhi', 'Uttar Pradesh', 'Haryana', 'Punjab', 'Rajasthan', 'Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir'],
  'South Zone': ['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Puducherry'],
  'East Zone': ['West Bengal', 'Bihar', 'Odisha', 'Jharkhand', 'Assam', 'Sikkim', 'Meghalaya', 'Tripura'],
  'West Zone': ['Maharashtra', 'Gujarat', 'Goa', 'Madhya Pradesh', 'Chhattisgarh'],
  'Central Zone': ['Uttar Pradesh Central', 'Madhya Pradesh Central', 'Chhattisgarh Central'],
};

// ─── German Data ──────────────────────────────────────────────────────────────

const germanRegions: Record<string, string[]> = {
  'Nord Region': ['Schleswig-Holstein', 'Hamburg', 'Niedersachsen', 'Bremen', 'Mecklenburg-Vorpommern'],
  'West Region': ['Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Hessen'],
  'Süd Region': ['Bayern', 'Baden-Württemberg'],
  'Ost Region': ['Berlin', 'Brandenburg', 'Sachsen', 'Sachsen-Anhalt', 'Thüringen'],
};

// ─── City suffixes for branch names ───────────────────────────────────────────

const citySuffixes = [
  'Central', 'North', 'South', 'East', 'West',
  'Main Street', 'Market', 'Plaza', 'Square', 'Park',
  'Station', 'Harbor', 'Gateway', 'Heights', 'Valley',
  'Downtown', 'Uptown', 'Riverside', 'Lakeside', 'Hillside',
  'Commerce', 'Industrial', 'Tech Park', 'Financial', 'Heritage',
];

// ─── Generic generator ───────────────────────────────────────────────────────

function generateBankData(
  regions: Record<string, string[]>,
  countryPrefix: string,
): { hierarchy: TerritoryHierarchyNode[]; unassigned: UnassignedBranch[] } {
  const hierarchy: TerritoryHierarchyNode[] = [];
  const unassigned: UnassignedBranch[] = [];

  let nodeIdCounter = 1;
  let regionIdCounter = 1000;
  let branchIdCounter = 1;

  Object.entries(regions).forEach(([regionName, states]) => {
    const regionNodeId = regionIdCounter++;
    const stateNodes: TerritoryHierarchyNode[] = [];

    states.forEach((stateName) => {
      const stateNodeId = nodeIdCounter++;
      const assignedBranches: TerritoryHierarchyBranch[] = [];

      citySuffixes.forEach((suffix, idx) => {
        const branchCode = `${countryPrefix}-${stateName.substring(0, 2).toUpperCase()}-${String(branchIdCounter++).padStart(4, '0')}`;
        const branchName = `${stateName} ${suffix}`;

        if (idx < 20) {
          assignedBranches.push({ brancheId: branchCode, branchNm: `${branchName} Branch` });
        } else {
          unassigned.push({ brancheId: branchCode, branchNm: `${branchName} Branch`, isAssigned: false });
        }
      });

      stateNodes.push({
        nodeId: stateNodeId,
        parentNodeId: regionNodeId,
        nodeNm: `${stateName} Territory`,
        nodeDesc: `Branch management for ${stateName}`,
        branches: assignedBranches,
        childNodes: [],
      });
    });

    hierarchy.push({
      nodeId: regionNodeId,
      parentNodeId: null,
      nodeNm: regionName,
      nodeDesc: `Regional division: ${regionName}`,
      branches: [],
      childNodes: stateNodes,
    });
  });

  return { hierarchy, unassigned };
}

// ─── Exported generators ──────────────────────────────────────────────────────

export function generateUSAData() {
  return generateBankData(usRegions, 'US');
}

export function generateIndiaData() {
  return generateBankData(indiaRegions, 'IN');
}

export function generateGermanData() {
  return generateBankData(germanRegions, 'DE');
}
