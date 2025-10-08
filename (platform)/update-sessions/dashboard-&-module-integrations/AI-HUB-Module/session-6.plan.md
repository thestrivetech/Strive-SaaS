# Session 6: Workflow Builder UI - React Flow Canvas

## Session Overview
**Goal:** Implement the futuristic workflow builder UI with React Flow drag-and-drop canvas, node palette, mini-map, and execution controls preserving the exact glassmorphic design from NeuroFlow Hub.

**Duration:** 5-6 hours
**Complexity:** High
**Dependencies:** Session 1, 2, 5 (templates)

## Objectives

1. ✅ Add React Flow and dependencies
2. ✅ Create futuristic glassmorphic theme CSS
3. ✅ Build workflow builder canvas component
4. ✅ Implement node palette with drag-and-drop
5. ✅ Create custom node components
6. ✅ Add mini-map and controls
7. ✅ Implement real-time execution visualization
8. ✅ Add workflow save/load functionality

## Design Theme

**Electric Colors:**
- Electric Blue: `#00D2FF` (primary)
- Cyber Green: `#39FF14` (success)
- Violet: `#8B5CF6` (secondary)

**Glass Morphism:**
- `backdrop-filter: blur(20px)`
- Dark glass backgrounds `rgba(15, 23, 42, 0.8)`
- Neon borders with glow effects

**Key Visual Elements:**
- Floating node palette
- Cyber grid background
- Neon-glowing nodes
- Animated execution progress
- Glass morphism cards

## File Structure

```
app/(platform)/ai-hub/workflows/
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

### Step 2: Add Glassmorphic Theme CSS

**File:** `app/globals.css` (add to existing)

```css
/* NeuroFlow Hub Theme */
:root {
  /* Electric colors */
  --electric-blue: #00D2FF;
  --cyber-green: #39FF14;
  --neon-violet: #8B5CF6;
  
  /* Glass morphism */
  --glass-dark: rgba(15, 23, 42, 0.8);
  --glass-border: rgba(0, 210, 255, 0.3);
  
  /* Neon glow effects */
  --neon-glow-blue: 0 0 20px rgba(0, 210, 255, 0.5);
  --neon-glow-green: 0 0 20px rgba(57, 255, 20, 0.5);
}

/* Electric gradient animation */
@keyframes electric-pulse {
  0%, 100% { 
    box-shadow: var(--neon-glow-blue);
    border-color: var(--electric-blue);
  }
  50% { 
    box-shadow: var(--neon-glow-green);
    border-color: var(--cyber-green);
  }
}

.electric-border {
  border: 1px solid var(--electric-blue);
  animation: electric-pulse 2s ease-in-out infinite;
}

/* Cyber grid background */
.cyber-grid {
  background-image: 
    linear-gradient(rgba(0, 210, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 210, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Floating node palette */
.floating-palette {
  background: var(--glass-dark);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--neon-glow-blue);
}

/* Workflow node styling */
.workflow-node {
  background: linear-gradient(135deg, rgba(0, 210, 255, 0.2), rgba(139, 92, 246, 0.2));
  border: 1px solid var(--electric-blue);
  backdrop-filter: blur(10px);
}

.workflow-node:hover {
  box-shadow: var(--neon-glow-blue);
  transform: scale(1.05);
}

/* Execution progress bar */
.execution-progress {
  background: linear-gradient(90deg, var(--electric-blue), var(--cyber-green));
  height: 4px;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.execution-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: progress-shine 1.5s infinite;
}

@keyframes progress-shine {
  0% { left: -100%; }
  100% { left: 100%; }
}
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

**File:** `app/(platform)/ai-hub/workflows/new/page.tsx`

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

- [x] React Flow canvas operational
- [x] Node palette with drag-and-drop
- [x] Custom nodes with glassmorphic design
- [x] Save/load workflows
- [x] Execution visualization
- [x] Mini-map and controls
- [x] Responsive design
- [x] Keyboard navigation

## Files Created

- ✅ `app/(platform)/ai-hub/workflows/**` - All workflow pages
- ✅ `components/real-estate/ai-hub/workflows/**` - All workflow components
- ✅ Updated `app/globals.css` with NeuroFlow theme

## Next Steps

Proceed to **Session 7: AI Agents Lab UI**

---

**Session 6 Complete:** ✅ Workflow Builder UI with futuristic design implemented
