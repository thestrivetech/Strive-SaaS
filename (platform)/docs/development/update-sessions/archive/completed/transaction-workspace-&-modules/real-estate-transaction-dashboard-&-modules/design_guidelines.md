# Real Estate Transaction Management Platform - Design Guidelines

## Design Approach

**Selected System:** Design System Approach - shadcn/ui with Tailwind CSS, drawing inspiration from Linear (clean data-dense UIs), Notion (document organization), and DocuSign (signature workflows).

**Rationale:** This is a utility-focused, information-dense professional tool where efficiency, reliability, and clarity are paramount. The existing shadcn/ui integration provides an excellent foundation for building trust-focused enterprise interfaces.

**Core Principles:**
- Information Density: Maximize useful data without clutter
- Scannability: Enable quick status assessment through visual hierarchy
- Trust & Compliance: Professional aesthetic that conveys security and legal validity
- Power User Efficiency: Keyboard shortcuts, bulk operations, quick actions

---

## Color Palette

### Light Mode (Primary)
- **Background:** 0 0% 100% (white)
- **Surface:** 0 0% 98% (off-white cards)
- **Border:** 214 20% 92% (subtle borders)
- **Text Primary:** 222 47% 11% (dark slate)
- **Text Secondary:** 215 16% 47% (gray)

### Brand & Status Colors
- **Primary (Action):** 221 83% 53% (professional blue)
- **Success:** 142 71% 45% (green - signed, completed)
- **Warning:** 38 92% 50% (amber - pending signatures)
- **Danger:** 0 84% 60% (red - overdue, cancelled)
- **Info:** 199 89% 48% (cyan - informational)

### Status-Specific Indicators
- **Draft:** 220 13% 69% (neutral gray)
- **Active:** 221 83% 53% (primary blue)
- **Under Contract:** 262 83% 58% (purple)
- **Closing:** 38 92% 50% (amber)
- **Closed:** 142 71% 45% (green)
- **Cancelled:** 0 84% 60% (red)

### Dark Mode
- **Background:** 222 47% 11%
- **Surface:** 217 33% 17%
- **Text Primary:** 210 40% 98%
- Status colors remain vibrant with slightly adjusted lightness

---

## Typography

**Font Families:**
- Primary: `Inter` (Google Fonts) - excellent legibility for data-heavy interfaces
- Monospace: `JetBrains Mono` - for dates, amounts, reference numbers

**Type Scale:**
- **Display (H1):** text-3xl font-bold (Loop titles, property addresses)
- **Heading (H2):** text-2xl font-semibold (Section headers)
- **Subheading (H3):** text-lg font-semibold (Card titles)
- **Body:** text-sm (Default UI text)
- **Small:** text-xs (Metadata, timestamps)
- **Mono:** text-sm font-mono (Transaction IDs, amounts)

**Weight Usage:**
- font-bold: Critical information, active states
- font-semibold: Headers, labels
- font-medium: Secondary emphasis
- font-normal: Body text

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 1, 2, 4, 6, 8, 12, 16 (e.g., p-4, gap-6, mt-8)

**Container Strategy:**
- **Dashboard Layouts:** Full-width with max-w-screen-2xl mx-auto px-6
- **Document Viewer:** Centered with max-w-4xl (optimal reading width)
- **Sidebar Navigation:** Fixed w-64 with collapsible option to w-16
- **Card Grids:** grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4

**Responsive Breakpoints:**
- Mobile: Base styles (single column, stacked navigation)
- Tablet: md: (2-column grids, side-by-side panels)
- Desktop: lg: and xl: (3+ columns, persistent sidebars)

---

## Component Library

### Navigation
- **Top Header:** Fixed with transaction search, notifications bell, user menu
- **Sidebar:** Collapsible with icons + labels (Loops, Documents, Tasks, Analytics)
- **Breadcrumbs:** Show hierarchy within loops (Loop > Documents > Contract)
- **Tabs:** Underline style for switching views (Details, Documents, Activity, Parties)

### Data Display
- **Loop Cards:** Elevated cards with property image thumbnail, address (bold), status badge (top-right), key dates, parties count, progress bar
- **Document List:** Compact rows with icon, name, version, last modified, actions menu
- **Timeline:** Vertical with connected dots, timestamp (left), action (right), actor avatar
- **Status Badges:** Rounded-full px-3 py-1 text-xs font-medium with status-specific colors
- **Progress Indicators:** Linear progress bars showing completion percentage with gradient fill

### Forms & Inputs
- **Text Fields:** Standard shadcn Input with clear labels, helper text, error states
- **Dropdowns:** shadcn Select with search for long lists (parties, templates)
- **Date Pickers:** Calendar popup with range selection for deadlines
- **File Upload:** Drag-and-drop zone with file preview thumbnails
- **Signature Pad:** Canvas element with clear/redo buttons, responsive to touch

### Actions
- **Primary Button:** bg-primary text-white (major actions like "Send for Signature")
- **Secondary Button:** variant="outline" (cancel, secondary options)
- **Destructive Button:** variant="destructive" (delete, cancel transaction)
- **Icon Buttons:** Ghost variant for compact toolbars and action menus
- **Bulk Action Bar:** Sticky bottom bar appearing when items selected

### Overlays
- **Modals:** Centered with max-w-2xl, shadcn Dialog component, dark overlay
- **Slide-overs:** Right-side panel (w-96) for quick edits without navigation
- **Toasts:** Top-right notifications for success/error feedback
- **Tooltips:** Subtle with delay for additional context on hover
- **Dropdown Menus:** shadcn DropdownMenu for contextual actions

### Document-Specific Components
- **PDF Viewer:** Embedded with zoom controls, page navigation, annotation toolbar
- **Signature Fields:** Yellow highlight overlay on document showing required signatures
- **Comment Threads:** Sticky notes with author avatar, timestamp, resolve button
- **Version Comparison:** Side-by-side diff view with highlighted changes

---

## Animations

**Minimal & Purposeful:**
- Page transitions: None (instant navigation for efficiency)
- Card hover: Subtle lift (shadow increase) on interactive cards
- Status changes: Quick fade transition for badge color updates
- Loading states: Skeleton screens (no spinners) for content areas
- Success feedback: Brief checkmark animation on signature completion
- **Avoid:** Elaborate scroll animations, decorative motion

---

## Images

**Strategic Image Usage:**

1. **Property Thumbnails:** 
   - Loop cards: aspect-ratio-video (16:9), rounded corners
   - Loop header: Large banner image, max-h-64, subtle overlay for text readability

2. **Party Avatars:**
   - Round avatars (h-10 w-10) for agents, clients in party lists
   - Fallback: Initials on colored background

3. **Document Icons:**
   - File type icons (PDF, DOCX, JPG) for document library
   - Use lucide-react icon library

4. **Empty States:**
   - Illustration for "No active loops" with call-to-action
   - "No documents uploaded" state with upload prompt

**No Hero Images:** This is an application interface, not a marketing site.

---

## Mobile Considerations

- **Touch Targets:** Minimum 44px height for all interactive elements
- **Bottom Navigation:** Mobile-only tab bar for core sections
- **Swipe Gestures:** Swipe document cards for quick actions (archive, share)
- **Floating Action Button:** Bottom-right for "Create Loop" on mobile
- **Collapsible Sections:** Accordion pattern for document folders on small screens
- **Scanner Integration:** Camera access for document capture with crop/enhance UI

---

## Accessibility & Compliance

- **Contrast:** All text meets WCAG AA standards (4.5:1 minimum)
- **Keyboard Navigation:** Full keyboard support with visible focus rings
- **Screen Readers:** Proper ARIA labels for status indicators and interactive elements
- **Audit Trail Visibility:** Clearly display who, when, what for all actions
- **Legal Disclaimer Text:** text-xs text-muted-foreground for compliance notices