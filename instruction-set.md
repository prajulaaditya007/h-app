# Copilot Migration Instruction Set

Use the instructions in this file to direct GitHub Copilot (or another AI assistant) on your office laptop. It will help guide the assistant in adapting this vibe-coded architecture to fit your enterprise application, enterprise API contracts, and custom internal component library.

---

## Copilot System/Chat Prompt

Copy and paste the prompt below into your GitHub Copilot Chat window alongside this vibe-coded codebase to start the translation process.

```markdown
You are a senior React and TypeScript developer. Your task is to migrate a vibe-coded prototype of a "Territory Hierarchy Manager" into our enterprise production app.

Our production app has three key differences from this prototype:
1. **API & Data Types**: We do not use mock data or local synchronous state modification in reducers. We use real async thunks (or RTK Query/SWR) to fetch and mutate data, and the data schema is different.
2. **Proprietary Component Library**: We do not use standard HTML elements or Bootstrap styling classes. We have our own custom component library (e.g., UI inputs, buttons, dropdowns, panels, modal dialogs, portals, popovers).
3. **Enterprise Standards**: We require rigorous error handling, loading states, and robust defensive code checks.

Please guide me step-by-step through the migration, starting with state and store configuration, followed by the hooks, and ending with UI components.
```

---

## Step-by-Step Translation Guides for Copilot

### Step 1: Mapping Store & Data Types
**Context File**: `src/features/territory-manager/store/territorySlice.ts`  
**Prompt for Copilot**:
```markdown
Look at territorySlice.ts. I want to adapt this Redux slice to connect to our real APIs instead of modifying the normalized nodes store (`nodesById`) synchronously.

1. Here is our real territory API payload response type:
   [PASTE YOUR ENTERPRISE API INTERFACE/CONTRACT HERE]

2. Here are our actual async endpoints (e.g., fetchTree, assignBranches, moveBranches, deleteBranches):
   [PASTE YOUR ASYNC ACTION THUNKS OR RTK QUERY APIS HERE]

Please rewrite the territory slice to:
- Normalize the incoming enterprise tree hierarchy into a flat lookup map like the `nodesById` map.
- Handle loading and error states for each async thunk (pending, fulfilled, rejected).
- Update the local state dictionary only after the async thunk returns success, ensuring the UI remains in sync with the backend.
- Ensure the slice manages the new bulk delete actions (`removeBranchesBatch`, `removeUnassignedBranchesBatch`) asynchronously through our API.
```

---

### Step 2: Adapting the Custom Hooks
**Context File**: `src/features/territory-manager/utils/useAssignedBranches.ts`  
**Prompt for Copilot**:
```markdown
Look at useAssignedBranches.ts. This hook aggregates and filters assigned branches recursively from the selected territory node and all its child sub-territories.

Please translate this logic to match our real enterprise data structures:
1. The property name for "branches list" in our node is: [SPECIFY PROPERTY NAME, e.g., 'assignedBranches']
2. The property name for "child nodes list" in our node is: [SPECIFY PROPERTY NAME, e.g., 'subTerritories']
3. The identifier name for branch IDs is: [SPECIFY PROPERTY NAME, e.g., 'id' or 'branchCode']

Ensure that the recursive branch aggregator (`collectBranches`) walks our real tree structure correctly and matches our schema fields for node ID, node name, branch ID, and branch name.
```

**Context File**: `src/features/territory-manager/utils/useLazyList.ts`  
**Prompt for Copilot**:
```markdown
Look at useLazyList.ts. It implements IntersectionObserver-based chunk pagination for displaying thousands of branches smoothly without DOM lag.

1. If our custom component library has a built-in virtualized list or infinite scroller component:
   - Explain how to replace the target observer div with our custom component.
2. If we do not have a virtualized list component:
   - Ensure the hook is typed correctly for our branch schema and safely disconnects the observer in all component lifecycles.
```

---

### Step 3: Swapping UI Components to Custom Library
**Context Files**: Components under `src/features/territory-manager/components/`  
**Prompt for Copilot**:
```markdown
I need to convert our layout components to use our internal organization component library.

Here is a mapping of standard controls to our custom library imports:
- `<Search />` -> `<YourBrandSearchInput />`
- `<Dropdown />` -> `<YourBrandSelect />`
- `<Modal />` -> `<YourBrandModal />` or `<YourBrandDialog />`
- Bootstrap grid/margins (`d-flex`, `col-lg-4`, `card shadow-sm`) -> [PASTE YOUR LIBRARY GRID/CARD EQUIVALENTS HERE]

Please rewrite [SPECIFIED_COMPONENT.tsx] to:
- Use our library components and match their property signatures (e.g., custom onChange handlers, value formats, and theme variants).
- Maintain all structural layout logic (the three-column design, recursive accordion tree nodes, checkboxes, and multi-selection list state).
```

---

### Step 4: Modifying the Cascading Territory Picker Form
**Context File**: `src/features/territory-manager/components/common/MoveBranchesForm.tsx`  
**Prompt for Copilot**:
```markdown
Look at MoveBranchesForm.tsx. It renders a cascading dropdown form:
- Select 1: Lists top-level root territories.
- Select 2: Lists sub-territories of the selected root.

Please adapt this component to:
- Use our brand's dropdown component instead of `Dropdown.tsx`.
- Retrieve active option lists from our normalized `nodesById` slice based on our actual parent-child relationship keys.
- Ensure validation occurs so that the "Move" / "Assign" buttons are only enabled when a valid leaf/sub-territory is selected (or level 1 if applicable).
```

---

### Step 5: Options Popover & Sidebar Integration
**Context Files**: 
- `src/features/territory-manager/components/common/Popover.tsx`
- `src/features/territory-manager/components/BankDetailsSidebar.tsx`
- `src/features/territory-manager/components/AssignedBranchItem.tsx`
- `src/features/territory-manager/components/UnassignedBranchItem.tsx`

**Prompt for Copilot**:
```markdown
Look at Popover.tsx and BankDetailsSidebar.tsx. These handle single-item options dropdown overlays and sliding detail panels respectively.

Please adapt these to our production environment:
1. If our enterprise component library has its own Popover, ContextMenu, or SlideOver/Drawer components, replace our custom implementations with them.
2. In AssignedBranchItem.tsx and UnassignedBranchItem.tsx, replace the `Popover` implementation and ensure the single-row action callbacks (Reassign/Assign, Delete, Unassign) trigger our real backend endpoints.
3. In TerritoryMain.tsx, ensure the "View Details" click maps to our real bank stats data schema (established date, territory count, active status) in the sidebar.
```

---

### Step 6: Sticky Footer & Bulk Action Layouts
**Context Files**: 
- `src/features/territory-manager/components/AssignedBranchList.tsx`
- `src/features/territory-manager/components/UnassignedBranchList.tsx`

**Prompt for Copilot**:
```markdown
Look at AssignedBranchList.tsx and UnassignedBranchList.tsx. Both display sticky footers containing bulk action buttons ("Delete All" and "Reassign/Assign").

Please adapt these sticky layout sections:
1. Ensure the bulk deletion triggers a confirmation overlay matching our enterprise design system standards.
2. Hook the bulk actions directly to our async API endpoints:
   - "Delete All" should trigger a bulk delete request passing the list of currently visible branch IDs.
   - "Reassign/Assign" should execute the move/assign logic using our bulk update endpoint payload structure.
3. Maintain the selection state badge (`X selected`) at the top next to the "Select ALL" checkbox, converting styling classes to our organization's spacing tokens.
```
