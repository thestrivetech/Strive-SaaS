# Dashboard Visual Effects System

This directory contains components for the enhanced dashboard visual design system.

## Components

### ParticleBackground

Canvas-based animated particle background with interactive mouse effects.

**Usage:**
```tsx
import { ParticleBackground } from '@/components/shared/dashboard/ParticleBackground';

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <div className="relative z-10">
        {/* Your dashboard content */}
      </div>
    </div>
  );
}
```

**Features:**
- 60fps canvas animation using requestAnimationFrame
- Mouse interaction (particles respond to cursor)
- Automatically adjusts particle count based on screen size
- Color-coded particles (cyan, green, purple) matching design system
- Particle connections with distance-based opacity
- Performance optimized with velocity damping

**Props:**
None - component is fully self-contained

---

## CSS Utility Classes

All utility classes are defined in `app/globals.css` under the "DASHBOARD VISUAL EFFECTS SYSTEM" section.

### Glassmorphism

```tsx
// Subtle glass effect
<div className="glass rounded-xl p-6">Content</div>

// Strong glass effect (more blur)
<div className="glass-strong rounded-xl p-6">Content</div>

// Very subtle glass effect
<div className="glass-subtle rounded-xl p-6">Content</div>
```

### Neon Glows

```tsx
// Cyan glow
<div className="neon-cyan">Content</div>

// Green glow
<div className="neon-green">Content</div>

// Purple glow
<div className="neon-purple">Content</div>

// Orange glow (brand color)
<div className="neon-orange">Content</div>
```

### Neon Borders

```tsx
// Cyan border with glow
<div className="neon-border-cyan rounded-xl p-4">Content</div>

// Green border with glow
<div className="neon-border-green rounded-xl p-4">Content</div>

// Purple border with glow
<div className="neon-border-purple rounded-xl p-4">Content</div>

// Orange border with glow (brand color)
<div className="neon-border-orange rounded-xl p-4">Content</div>

// Primary border (subtle cyan)
<div className="neon-border-primary rounded-xl p-4">Content</div>
```

### Widget Effects

```tsx
// Hover lift effect with glow
<div className="widget-hover glass rounded-xl p-6">
  Widget Content
</div>
```

### Animations

```tsx
// Floating animation (6s loop)
<div className="animate-float">Content</div>

// Glowing animation (2s alternate)
<div className="animate-glow">Content</div>

// Slow pulse (3s loop)
<div className="animate-pulse-slow">Content</div>

// Data update pulse (single)
<div className="animate-data-pulse">Updated Content</div>

// Shimmer loading effect
<div className="animate-shimmer">Loading...</div>

// Fade in up animation
<div className="animate-fade-in-up">Content</div>
```

### Gradients

```tsx
// Cyan to purple gradient
<div className="gradient-cyan-purple rounded-xl p-6">Content</div>

// Green to cyan gradient
<div className="gradient-green-cyan rounded-xl p-6">Content</div>

// Orange to purple gradient (brand)
<div className="gradient-orange-purple rounded-xl p-6">Content</div>
```

### Backdrop Blur

```tsx
// Strong blur (30px)
<div className="backdrop-blur-strong">Content</div>

// Medium blur (20px)
<div className="backdrop-blur-medium">Content</div>

// Subtle blur (10px)
<div className="backdrop-blur-subtle">Content</div>
```

### Dashboard-Specific

```tsx
// Custom scrollbar styling
<div className="dashboard-scrollbar overflow-auto">
  Scrollable content
</div>

// Dashboard card with hover
<div className="dashboard-card">Card Content</div>

// Stat update animation
<div className="stat-update">Updated Stat</div>

// Loading shimmer skeleton
<div className="loading-shimmer h-20 w-full rounded-lg" />

// Activity feed smooth scroll
<div className="activity-feed overflow-y-auto">
  Activity items
</div>
```

---

## Example: Complete Dashboard Widget

```tsx
import { ParticleBackground } from '@/components/shared/dashboard/ParticleBackground';

export function EnhancedDashboard() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Animated background */}
      <ParticleBackground />

      {/* Dashboard content */}
      <div className="relative z-10 container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Card */}
          <div className="glass neon-border-cyan rounded-xl p-6 widget-hover">
            <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold stat-update">$125,430</p>
            <p className="text-sm text-muted-foreground mt-2">+12% from last month</p>
          </div>

          {/* Activity Widget */}
          <div className="glass-strong rounded-xl p-6 col-span-2">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="activity-feed dashboard-scrollbar h-64 overflow-y-auto space-y-3">
              {/* Activity items */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Performance Notes

- **ParticleBackground**: Uses requestAnimationFrame for 60fps, automatically adjusts particle count based on screen size
- **Glass effects**: Uses GPU-accelerated backdrop-filter, gracefully degrades on unsupported browsers
- **Animations**: Hardware-accelerated transforms, minimal repaints
- **File sizes**: ParticleBackground (150 lines), globals.css additions (~280 lines)

---

## Browser Support

- **Modern browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Backdrop blur**: iOS 9+, Safari 9+, Chrome 76+, Firefox 103+
- **Canvas animations**: Universal support
- **Fallbacks**: Glass effects degrade to solid backgrounds on unsupported browsers

---

## Future Enhancements

- [ ] Add theme variants (light mode colors)
- [ ] Add particle color customization props
- [ ] Add performance mode toggle (reduce particles on low-end devices)
- [ ] Add more animation keyframe options
- [ ] Add gradient mesh background option
