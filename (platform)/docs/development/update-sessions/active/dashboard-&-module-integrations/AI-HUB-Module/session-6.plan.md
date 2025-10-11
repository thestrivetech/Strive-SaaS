# Session 6: Workflow Builder UI - React Flow Canvas

## Session Overview
**Goal:** Implement the workflow builder UI with React Flow drag-and-drop canvas, node palette, mini-map, and execution controls using platform design standards.

**Duration:** 5-6 hours
**Complexity:** High
**Dependencies:** Session 1, 2, 5 (templates)

## Objectives

1. ✅ Add React Flow and dependencies
2. ✅ Use platform design system components and utilities
3. ✅ Build workflow builder canvas component
4. ✅ Implement node palette with drag-and-drop
5. ✅ Create custom node components
6. ✅ Add mini-map and controls
7. ✅ Implement real-time execution visualization
8. ✅ Add workflow save/load functionality

## Design System (Platform Standards)

**Color Palette:**
- Primary: Strive Orange `#FF7033`
- Neon Accents (via utility classes):
  - Cyan `#00D2FF` - primary features
  - Purple `#8B5CF6` - metrics/stats
  - Green `#39FF14` - success/activity
  - Orange `#FF7033` - actions/CTAs

**Components:**
- Use `EnhancedCard` with `glassEffect` and `neonBorder` props
- Use `ModuleHeroSection` for dashboard header
- Use standard shadcn/ui components (Button, Badge, Tabs, etc.)

**Visual Effects (from globals.css):**
- Glass morphism: `.glass`, `.glass-strong`, `.glass-subtle`
- Neon borders: `.neon-border-cyan`, `.neon-border-purple`, etc.
- Animations: `.animate-pulse-slow`, `.animate-glow`, etc.

## File Structure

```
app/real-estate/ai-hub/workflows/
├── page.tsx                    # Workflows list
├── new/page.tsx               # Create workflow
├── [id]/
│   ├── page.tsx               # View workflow
│   └── edit/page.tsx          # Edit workflow

components/real-estate/ai-hub/workflows/
├── WorkflowBuilder.tsx        # Main builder component
├── NodePalette.tsx            # Draggable node palette
├── CustomNode.tsx             # Custom node component
├── ExecutionControls.tsx      # Save/Execute controls
├── ExecutionVisualizer.tsx    # Real-time execution display
├── WorkflowList.tsx           # Workflow list component
└── WorkflowCard.tsx           # Workflow card component
```

## Implementation Steps

### Step 1: Add Dependencies

```bash
cd "(platform)"
npm install reactflow @xyflow/react
```

### Step 2: Use Platform Design System

**NOTE:** All necessary CSS utilities are already available in `app/globals.css` (lines 221-619). No new CSS needs to be added.

**Available Utilities:**
- Glass effects: `.glass`, `.glass-strong`, `.glass-subtle`
- Neon borders: `.neon-border-cyan`, `.neon-border-purple`, `.neon-border-green`, `.neon-border-orange`
- Animations: `.animate-pulse-slow`, `.animate-glow`, `.animate-float`

**Use EnhancedCard Component Instead of Custom CSS:**
```tsx
import { EnhancedCard } from '@/components/shared/dashboard/EnhancedCard';

<EnhancedCard glassEffect="strong" neonBorder="cyan">
  {/* Content */}
</EnhancedCard>
```

### Step 3: Create Workflow Builder Component

**File:** `components/real-estate/ai-hub/workflows/WorkflowBuilder.tsx`

Key features:
- React Flow canvas setup
- Node types registration
- Drag-and-drop from palette
- Connection validation
- Auto-layout
- Save/load workflow
- Execution controls

### Step 4: Create Node Palette

**File:** `components/real-estate/ai-hub/workflows/NodePalette.tsx`

Node types:
- Trigger nodes
- AI Agent nodes
- Integration nodes
- Condition nodes
- Transform nodes
- Output nodes

### Step 5: Create Custom Node Component

**File:** `components/real-estate/ai-hub/workflows/CustomNode.tsx`

Features:
- Glassmorphic design
- Status indicators
- Execution animation
- Edit/delete actions
- Connection handles

### Step 6: Create Execution Visualizer

**File:** `components/real-estate/ai-hub/workflows/ExecutionVisualizer.tsx`

Features:
- Real-time execution progress
- Node-by-node animation
- Execution logs display
- Error highlighting
- Success/failure indicators

### Step 7: Create Workflow Pages

**File:** `app/real-estate/ai-hub/workflows/new/page.tsx`

```typescript
import { WorkflowBuilder } from '@/components/real-estate/ai-hub/workflows/WorkflowBuilder';

export default function NewWorkflowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 cyber-grid">
      <WorkflowBuilder />
    </div>
  );
}
```

## Key Components

### WorkflowBuilder
- Main canvas component
- React Flow integration
- State management with Zustand
- Auto-save functionality
- Keyboard shortcuts

### NodePalette
- Categorized nodes
- Search/filter
- Drag-and-drop
- Node previews
- Recently used

### CustomNode
- Dynamic node rendering
- Status visualization
- Real-time updates
- Context menu
- Validation feedback

## Success Criteria

- ✅ React Flow canvas operational
- ✅ Node palette with drag-and-drop
- ✅ Custom nodes with glassmorphic design
- ✅ Save/load workflows
- ✅ Execution visualization
- ✅ Mini-map and controls
- ✅ Responsive design
- ✅ Keyboard navigation

## Files Created

- ✅ `app/real-estate/ai-hub/workflows/**` - All workflow pages
- ✅ `components/real-estate/ai-hub/workflows/**` - All workflow components
- ✅ Updated `app/globals.css` with NeuroFlow theme

## Next Steps

Proceed to **Session 7: AI Agents Lab UI**

---

**Session 6 Complete:** ✅ Workflow Builder UI with futuristic design implemented
