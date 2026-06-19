/**
 * territorySlice.ts
 *
 * Owns all territory-hierarchy state.
 * Reducers here are pure: they only update state — no API calls,
 * no payload construction, no logging. That belongs in the components.
 *
 * State sections:
 *  - Hierarchy data  : normalized node tree + root IDs
 *  - Unassigned       : branches not yet placed in any territory
 *  - Selection        : which territory / branches the user has selected
 *  - Modal            : shared reusable modal (open/close + metadata)
 *  - Search / UI      : global search query, type and panel visibility
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TerritoryHierarchyNode, TerritoryHierarchyBranch, UnassignedBranch } from '../types';
import { normalizeNodes } from '../utils/normalize';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModalState {
  isOpen: boolean;
  title: string;
  /** Identifier used by each component to know if the modal belongs to it */
  type: string | null;
  meta?: unknown;
}

export interface SearchResult {
  id: string;
  name: string;
}

export interface TerritoryState {
  // Hierarchy data
  nodesById: Record<number, TerritoryHierarchyNode>;
  rootNodeIds: number[];

  // Unassigned branches (not placed in any territory yet)
  unassignedBranches: Record<string, UnassignedBranch>;

  // Selection state
  selectedTerritoryId: number | null;
  selectedBranchIds: string[];

  // Modal
  modal: ModalState;

  // Search / UI state (owned by TerritorySearch, read by all branch lists)
  globalSearchQuery: string;
  searchType: 'individual' | 'branch';
  showPanel: boolean;

  // API-driven search state
  searchResults: SearchResult[];
  selectedBankName: string | null;
  selectedBankId: string | null;
  isLoading: boolean;
  hasUnpublishedChanges: boolean;
  isPublishing: boolean;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: TerritoryState = {
  nodesById: {},
  rootNodeIds: [],
  unassignedBranches: {},
  selectedTerritoryId: null,
  selectedBranchIds: [],
  modal: {
    isOpen: false,
    title: '',
    type: null,
    meta: null,
  },
  globalSearchQuery: '',
  searchType: 'individual',
  showPanel: false,
  searchResults: [],
  selectedBankName: null,
  selectedBankId: null,
  isLoading: false,
  hasUnpublishedChanges: false,
  isPublishing: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const territorySlice = createSlice({
  name: 'territory',
  initialState,
  reducers: {

    // ── Hierarchy Data ──────────────────────────────────────────────────────

    /** Load the full territory tree. Normalizes nested nodes into a flat map. */
    setHierarchyData: (state, action: PayloadAction<TerritoryHierarchyNode[]>) => {
      state.nodesById = normalizeNodes(action.payload);
      state.rootNodeIds = action.payload.map(node => node.nodeId);
    },

    /** Load all branches that are not yet assigned to any territory. */
    setUnassignedBranches: (state, action: PayloadAction<UnassignedBranch[]>) => {
      state.unassignedBranches = Object.fromEntries(
        action.payload.map(branch => [branch.brancheId, branch])
      );
    },

    // ── Selection ───────────────────────────────────────────────────────────

    /** Set the currently active territory (null = All Territories). */
    setSelectedTerritory: (state, action: PayloadAction<number | null>) => {
      state.selectedTerritoryId = action.payload;
    },

    /** Replace the entire branch selection with a new list of branch IDs. */
    setSelectedBranches: (state, action: PayloadAction<string[]>) => {
      state.selectedBranchIds = action.payload;
    },

    // ── Branch Moves ─────────────────────────────────────────────────────────

    /**
     * Move a single branch from one territory node to another.
     * The API call and payload logging are handled in the component before dispatch.
     */
    moveBranch: (
      state,
      action: PayloadAction<{
        branch: TerritoryHierarchyBranch;
        sourceNodeId: number;
        targetNodeId: number;
      }>
    ) => {
      const { branch, sourceNodeId, targetNodeId } = action.payload;
      const sourceNode = state.nodesById[sourceNodeId];
      const targetNode = state.nodesById[targetNodeId];
      if (!sourceNode || !targetNode) return;

      // Remove from source
      sourceNode.branches = sourceNode.branches.filter(b => b.brancheId !== branch.brancheId);

      // Add to target (guard against duplicates)
      const alreadyInTarget = targetNode.branches.some(b => b.brancheId === branch.brancheId);
      if (!alreadyInTarget) {
        targetNode.branches.push(branch);
      }
      state.hasUnpublishedChanges = true;
    },

    /**
     * Move multiple assigned branches to a different territory node.
     * The API call and payload logging are handled in the component before dispatch.
     */
    moveBranchesBatch: (
      state,
      action: PayloadAction<{ branchIds: string[]; targetNodeId: number }>
    ) => {
      const { branchIds, targetNodeId } = action.payload;
      const targetNode = state.nodesById[targetNodeId];
      if (!targetNode) return;

      // Pre-build lookup map: branchId -> node for O(1) retrievals during the batch loop
      const branchToNodeIndex = new Map<string, typeof targetNode>();
      Object.values(state.nodesById).forEach(node => {
        node.branches.forEach(b => {
          branchToNodeIndex.set(b.brancheId, node);
        });
      });

      branchIds.forEach(branchId => {
        const sourceNode = branchToNodeIndex.get(branchId);
        if (!sourceNode) return;

        const branch = sourceNode.branches.find(b => b.brancheId === branchId);
        if (!branch) return;

        // Remove from source
        sourceNode.branches = sourceNode.branches.filter(b => b.brancheId !== branchId);

        // Add to target (guard against duplicates)
        const alreadyInTarget = targetNode.branches.some(b => b.brancheId === branchId);
        if (!alreadyInTarget) {
          targetNode.branches.push(branch);
        }
      });

      // Clear selection after a successful move
      state.selectedBranchIds = [];
      state.hasUnpublishedChanges = true;
    },

    // ── Branch Assignments (Unassigned → Territory) ──────────────────────────

    /**
     * Assign a single unassigned branch to a territory node.
     * The API call and payload logging are handled in the component before dispatch.
     */
    assignBranch: (
      state,
      action: PayloadAction<{ branch: UnassignedBranch; targetNodeId: number }>
    ) => {
      const { branch, targetNodeId } = action.payload;
      const targetNode = state.nodesById[targetNodeId];
      if (!targetNode) return;

      // Remove from the unassigned pool
      delete state.unassignedBranches[branch.brancheId];

      // Add to the target territory (guard against duplicates)
      const alreadyInTarget = targetNode.branches.some(b => b.brancheId === branch.brancheId);
      if (!alreadyInTarget) {
        targetNode.branches.push({ brancheId: branch.brancheId, branchNm: branch.branchNm });
      }
      state.hasUnpublishedChanges = true;
    },

    /**
     * Assign multiple unassigned branches to a territory node.
     * The API call and payload logging are handled in the component before dispatch.
     */
    assignBranchesBatch: (
      state,
      action: PayloadAction<{ branchIds: string[]; targetNodeId: number }>
    ) => {
      const { branchIds, targetNodeId } = action.payload;
      const targetNode = state.nodesById[targetNodeId];
      if (!targetNode) return;

      branchIds.forEach(branchId => {
        const branch = state.unassignedBranches[branchId];
        if (!branch) return;

        // Remove from the unassigned pool
        delete state.unassignedBranches[branchId];

        // Add to the target territory (guard against duplicates)
        const alreadyInTarget = targetNode.branches.some(b => b.brancheId === branchId);
        if (!alreadyInTarget) {
          targetNode.branches.push({ brancheId: branch.brancheId, branchNm: branch.branchNm });
        }
      });

      // Clear selection after a successful assign
      state.selectedBranchIds = [];
      state.hasUnpublishedChanges = true;
    },

    /**
     * Delete a single branch from whichever territory node owns it.
     * The branch is simply removed — not moved to unassigned.
     */
    removeBranchFromNode: (
      state,
      action: PayloadAction<string> // brancheId
    ) => {
      const brancheId = action.payload;
      Object.values(state.nodesById).forEach((node) => {
        node.branches = node.branches.filter((b) => b.brancheId !== brancheId);
      });
      state.selectedBranchIds = state.selectedBranchIds.filter((id) => id !== brancheId);
      state.hasUnpublishedChanges = true;
    },

    /**
     * Delete multiple branches from whichever territory nodes own them.
     */
    removeBranchesBatch: (
      state,
      action: PayloadAction<string[]> // branchIds
    ) => {
      const branchIds = action.payload;
      const idsSet = new Set(branchIds);
      Object.values(state.nodesById).forEach((node) => {
        node.branches = node.branches.filter((b) => !idsSet.has(b.brancheId));
      });
      state.selectedBranchIds = state.selectedBranchIds.filter((id) => !idsSet.has(id));
      state.hasUnpublishedChanges = true;
    },

    /**
     * Move a single assigned branch back to the unassigned pool.
     */
    unassignBranch: (
      state,
      action: PayloadAction<string> // brancheId
    ) => {
      const brancheId = action.payload;
      let found: { brancheId: string; branchNm: string } | undefined;

      Object.values(state.nodesById).forEach((node) => {
        const idx = node.branches.findIndex((b) => b.brancheId === brancheId);
        if (idx !== -1) {
          found = node.branches[idx];
          node.branches.splice(idx, 1);
        }
      });

      if (found) {
        state.unassignedBranches[brancheId] = {
          brancheId: found.brancheId,
          branchNm: found.branchNm,
          isAssigned: false,
        };
      }
      state.selectedBranchIds = state.selectedBranchIds.filter((id) => id !== brancheId);
      state.hasUnpublishedChanges = true;
    },

    /**
     * Delete a single branch from the unassigned pool entirely.
     */
    removeUnassignedBranch: (
      state,
      action: PayloadAction<string> // brancheId
    ) => {
      const brancheId = action.payload;
      delete state.unassignedBranches[brancheId];
      state.selectedBranchIds = state.selectedBranchIds.filter((id) => id !== brancheId);
      state.hasUnpublishedChanges = true;
    },

    /**
     * Delete multiple branches from the unassigned pool entirely.
     */
    removeUnassignedBranchesBatch: (
      state,
      action: PayloadAction<string[]> // branchIds
    ) => {
      const branchIds = action.payload;
      const idsSet = new Set(branchIds);
      branchIds.forEach((id) => {
        delete state.unassignedBranches[id];
      });
      state.selectedBranchIds = state.selectedBranchIds.filter((id) => !idsSet.has(id));
      state.hasUnpublishedChanges = true;
    },

    // ── Modal ────────────────────────────────────────────────────────────────

    /** Open the shared modal with a title and a type identifier. */
    openModal: (
      state,
      action: PayloadAction<{ title: string; type: string; meta?: unknown }>
    ) => {
      state.modal = {
        isOpen: true,
        title: action.payload.title,
        type: action.payload.type,
        meta: action.payload.meta ?? null,
      };
    },

    /** Close and reset the modal. */
    closeModal: (state) => {
      state.modal = { isOpen: false, title: '', type: null, meta: null };
    },

    // ── Search / UI ──────────────────────────────────────────────────────────

    /** Update the global search query. No longer auto-opens the panel. */
    setGlobalSearchQuery: (state, action: PayloadAction<string>) => {
      state.globalSearchQuery = action.payload;
    },

    /** Switch between searching by territory ID/name vs. branch ID/name. */
    setSearchType: (state, action: PayloadAction<'individual' | 'branch'>) => {
      state.searchType = action.payload;
    },

    /** Show or hide the main territory panel. Hiding also clears bank data. */
    setShowPanel: (state, action: PayloadAction<boolean>) => {
      state.showPanel = action.payload;
      if (!action.payload) {
        state.globalSearchQuery = '';
        state.nodesById = {};
        state.rootNodeIds = [];
        state.unassignedBranches = {};
        state.selectedTerritoryId = null;
        state.selectedBranchIds = [];
        state.selectedBankName = null;
        state.selectedBankId = null;
        state.searchResults = [];
        state.hasUnpublishedChanges = false;
        state.isPublishing = false;
      }
    },

    // ── API-driven search ────────────────────────────────────────────────────

    /** Store the search results returned by /searchResults. */
    setSearchResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.searchResults = action.payload;
    },

    /** Store the name of the currently loaded bank. */
    setSelectedBankName: (state, action: PayloadAction<string | null>) => {
      state.selectedBankName = action.payload;
    },

    /** Store the ID of the currently loaded bank. */
    setSelectedBankId: (state, action: PayloadAction<string | null>) => {
      state.selectedBankId = action.payload;
    },

    /** Toggle the loading spinner state. */
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /** Set unpublished changes flag */
    setHasUnpublishedChanges: (state, action: PayloadAction<boolean>) => {
      state.hasUnpublishedChanges = action.payload;
    },

    /** Set publishing loading state */
    setIsPublishing: (state, action: PayloadAction<boolean>) => {
      state.isPublishing = action.payload;
    },

  },
});

// ─── Exported Actions ─────────────────────────────────────────────────────────

export const {
  // Hierarchy data
  setHierarchyData,
  setUnassignedBranches,
  // Selection
  setSelectedTerritory,
  setSelectedBranches,
  // Branch moves
  moveBranch,
  moveBranchesBatch,
  // Branch assignments
  assignBranch,
  assignBranchesBatch,
  // Single-branch actions
  removeBranchFromNode,
  removeBranchesBatch,
  unassignBranch,
  removeUnassignedBranch,
  removeUnassignedBranchesBatch,
  // Modal
  openModal,
  closeModal,
  // Search / UI
  setGlobalSearchQuery,
  setSearchType,
  setShowPanel,
  // API-driven search
  setSearchResults,
  setSelectedBankName,
  setSelectedBankId,
  setIsLoading,
  setHasUnpublishedChanges,
  setIsPublishing,
} = territorySlice.actions;

export default territorySlice.reducer;
