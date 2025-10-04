# Session 3: UI/UX & Layouts - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-3 hours
**Dependencies:** Session 1 ✅, Session 2 ✅
**Parallel Safe:** No (updates core layouts)

---

## 🎯 Session Objectives

Create enhanced root layout with providers, and build role-based dashboard layouts for Admin, Employee, and Client users.

**What Exists:**
- ✅ Basic `app/layout.tsx` (from Session 1)
- ✅ Auth system (from Session 2)
- ✅ shadcn/ui components in `components/ui/`
- ✅ User role system

**What's Missing:**
- ❌ Enhanced root layout with providers
- ❌ Theme provider (dark/light mode)
- ❌ React Query provider
- ❌ Role-based dashboard layouts
- ❌ Navigation components (sidebar, header, breadcrumbs)
- ❌ User menu component

---

## 📋 Task Breakdown

### Phase 1: Enhanced Root Layout & Providers (45 minutes)

**Directory:** `app/` and `components/(platform)/shared/`

#### File 1: Update `app/layout.tsx`
- [ ] Read current root layout
- [ ] Add font configuration (Inter)
- [ ] Import Providers component
- [ ] Import Toaster for notifications
- [ ] Add suppressHydrationWarning for theme
- [ ] Update metadata with title template
- [ ] Add font CSS variable

**Implementation:**
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/(platform)/shared/providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Strive Tech Platform',
    default: 'Strive Tech - Enterprise SaaS Platform',
  },
  description: 'AI-Powered Business Management Platform',
  metadataBase: new URL('https://app.strivetech.ai'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
```

**Success Criteria:**
- [ ] Font loaded and applied
- [ ] Metadata configured
- [ ] Providers wrapper added
- [ ] Toaster for notifications
- [ ] Theme hydration handled

---

#### File 2: Create `components/(platform)/shared/providers.tsx`
- [ ] Create Providers component
- [ ] Add React Query provider with client state
- [ ] Add Theme provider (next-themes)
- [ ] Configure default theme to "system"
- [ ] Enable theme transitions
- [ ] Client Component with "use client"

**Implementation:**
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

**Success Criteria:**
- [ ] React Query configured
- [ ] Theme provider working
- [ ] System theme detection
- [ ] Client Component
- [ ] Optimized query defaults

---

### Phase 2: Navigation Components (1 hour)

**Directory:** `components/(platform)/shared/navigation/`

#### File 1: `sidebar-nav.tsx`
- [ ] Create sidebar navigation component
- [ ] Get current user with role
- [ ] Build navigation items based on role
- [ ] Show/hide items based on permissions
- [ ] Active route highlighting
- [ ] Collapsible sections
- [ ] Icons for each nav item
- [ ] Server Component

**Navigation Structure:**
```typescript
const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: null, // All users
  },
  {
    title: 'CRM',
    href: '/crm',
    icon: Users,
    permission: 'crm:read',
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderKanban,
    permission: 'projects:read',
  },
  {
    title: 'AI Assistant',
    href: '/ai',
    icon: Bot,
    permission: null,
  },
  {
    title: 'Tools',
    href: '/tools',
    icon: Wrench,
    permission: 'tools:manage',
  },
  {
    title: 'Admin',
    href: '/dashboard/admin',
    icon: Shield,
    permission: 'admin:access',
  },
];
```

**Success Criteria:**
- [ ] Role-based nav items
- [ ] Permission checks work
- [ ] Active state correct
- [ ] Icons display
- [ ] Accessible (keyboard nav)

---

#### File 2: `header.tsx`
- [ ] Create header component
- [ ] Show page title/breadcrumbs
- [ ] User menu dropdown
- [ ] Theme toggle button
- [ ] Notifications icon (future)
- [ ] Search bar (future)
- [ ] Server Component structure, client interactivity

**Implementation:**
```typescript
import { getCurrentUser } from '@/lib/auth/server';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';
import { Breadcrumbs } from './breadcrumbs';

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <Breadcrumbs />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
```

**Success Criteria:**
- [ ] Header sticky at top
- [ ] Breadcrumbs display
- [ ] User menu functional
- [ ] Theme toggle works
- [ ] Backdrop blur effect

---

#### File 3: `user-menu.tsx`
- [ ] Create user menu dropdown (client component)
- [ ] Show user avatar/name
- [ ] Show organization
- [ ] Show role badge
- [ ] Links: Profile, Settings, Logout
- [ ] Logout functionality with Supabase
- [ ] Client Component with "use client"

**Implementation:**
```typescript
'use client';

import { User } from '@prisma/client';
import { signOut } from '@/lib/auth/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function UserMenu({ user }: { user: User }) {
  const initials = user.name?.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user.image || ''} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user.name}</span>
            <span className="text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem href="/settings/profile">
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem href="/settings">
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Success Criteria:**
- [ ] Avatar displays
- [ ] User info shown
- [ ] Dropdown opens/closes
- [ ] Logout works
- [ ] Client Component

---

#### File 4: `breadcrumbs.tsx`
- [ ] Create breadcrumbs component
- [ ] Use usePathname() to get current route
- [ ] Generate breadcrumb trail
- [ ] Link to parent routes
- [ ] Format route names (capitalize, remove dashes)
- [ ] Client Component

**Success Criteria:**
- [ ] Breadcrumbs auto-generate
- [ ] Links work
- [ ] Current page highlighted
- [ ] Clean formatting

---

#### File 5: `theme-toggle.tsx`
- [ ] Create theme toggle button
- [ ] Show sun/moon icons
- [ ] Toggle between light/dark/system
- [ ] Use next-themes useTheme hook
- [ ] Client Component

**Success Criteria:**
- [ ] Theme switches
- [ ] Icon changes
- [ ] Smooth transitions
- [ ] System theme works

---

### Phase 3: Role-Based Dashboard Layouts (1 hour)

**Directory:** `components/(platform)/layouts/`

#### File 1: `admin-layout.tsx`
- [ ] Create admin layout component
- [ ] Include sidebar nav
- [ ] Include header
- [ ] Admin-specific navigation items
- [ ] Metrics cards
- [ ] Quick actions panel
- [ ] Server Component

**Layout Structure:**
```typescript
import { RequireRole } from '@/lib/auth/guards';
import { SidebarNav } from '../shared/navigation/sidebar-nav';
import { Header } from '../shared/navigation/header';

export async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <RequireRole role="ADMIN">
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="flex-1">
          <Header />
          <main className="container py-6">
            {children}
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
```

**Success Criteria:**
- [ ] Sidebar + header layout
- [ ] Role protection enforced
- [ ] Admin nav items show
- [ ] Responsive design
- [ ] Server Component

---

#### File 2: `employee-layout.tsx`
- [ ] Create employee layout component
- [ ] Similar structure to admin
- [ ] Employee-specific nav items
- [ ] Hide admin sections
- [ ] Show CRM/Projects/Tasks
- [ ] Server Component

**Success Criteria:**
- [ ] Employee nav correct
- [ ] No admin options
- [ ] Role protection works
- [ ] Layout consistent

---

#### File 3: `client-layout.tsx`
- [ ] Create client portal layout
- [ ] Simplified navigation
- [ ] Client-specific sections
- [ ] Projects read-only
- [ ] Invoices, support tickets
- [ ] Server Component

**Success Criteria:**
- [ ] Minimal nav for clients
- [ ] Read-only emphasis
- [ ] Clean client UX
- [ ] Role protection

---

#### File 4: `base-platform-layout.tsx`
- [ ] Create base layout used by all dashboards
- [ ] Reusable sidebar + header structure
- [ ] Accept nav items as props
- [ ] Accept role for protection
- [ ] DRY approach

**Usage:**
```typescript
<BasePlatformLayout
  role="EMPLOYEE"
  navItems={employeeNavItems}
>
  {children}
</BasePlatformLayout>
```

**Success Criteria:**
- [ ] Reusable across roles
- [ ] Props for customization
- [ ] No code duplication
- [ ] Type-safe

---

### Phase 4: Testing (30 minutes)

#### File 1: `__tests__/components/providers.test.tsx`
- [ ] Test Providers component renders
- [ ] Test React Query provider works
- [ ] Test theme provider works
- [ ] Mock next-themes

**Coverage Target:** 80%+

---

#### File 2: `__tests__/components/navigation/sidebar-nav.test.tsx`
- [ ] Test sidebar renders nav items
- [ ] Test permission filtering works
- [ ] Test active route highlighting
- [ ] Mock getCurrentUser
- [ ] Mock hasPermission

**Coverage Target:** 80%+

---

#### File 3: `__tests__/components/layouts/admin-layout.test.tsx`
- [ ] Test admin layout renders
- [ ] Test role guard redirects non-admins
- [ ] Test sidebar + header included
- [ ] Mock RequireRole

**Coverage Target:** 80%+

---

## 📊 Files to Create/Update

### Root Layout (1 file updated)
```
app/
└── layout.tsx              # 🔄 Update (add providers, fonts, metadata)
```

### Providers (1 file)
```
components/(platform)/shared/
└── providers.tsx           # ✅ Create (React Query + Theme)
```

### Navigation Components (6 files)
```
components/(platform)/shared/navigation/
├── sidebar-nav.tsx         # ✅ Create (main sidebar)
├── header.tsx              # ✅ Create (top header)
├── user-menu.tsx           # ✅ Create (user dropdown)
├── breadcrumbs.tsx         # ✅ Create (breadcrumb trail)
├── theme-toggle.tsx        # ✅ Create (dark/light toggle)
└── index.ts                # ✅ Create (exports)
```

### Role-Based Layouts (4 files)
```
components/(platform)/layouts/
├── admin-layout.tsx        # ✅ Create (admin dashboard)
├── employee-layout.tsx     # ✅ Create (employee dashboard)
├── client-layout.tsx       # ✅ Create (client portal)
├── base-platform-layout.tsx # ✅ Create (shared base)
└── index.ts                # ✅ Create (exports)
```

### Tests (3 files)
```
__tests__/components/
├── providers.test.tsx
└── navigation/
    └── sidebar-nav.test.tsx
└── layouts/
    └── admin-layout.test.tsx
```

**Total:** 16 files (15 new, 1 update)

---

## 🎯 Success Criteria

**MANDATORY:**
- [ ] Root layout enhanced with providers
- [ ] Theme provider working (light/dark/system)
- [ ] React Query configured
- [ ] Sidebar navigation role-based
- [ ] Header with user menu
- [ ] Breadcrumbs auto-generate
- [ ] Theme toggle functional
- [ ] Admin layout complete
- [ ] Employee layout complete
- [ ] Client layout complete
- [ ] TypeScript compiles: 0 errors
- [ ] Linter passes: 0 warnings
- [ ] Test coverage ≥ 80%
- [ ] All files under 500 lines
- [ ] Responsive design (mobile/tablet/desktop)

**UX Checks:**
- [ ] Smooth theme transitions
- [ ] Active nav highlighting works
- [ ] User menu accessible
- [ ] Keyboard navigation works
- [ ] Loading states handled

---

## 🔗 Integration Points

### With Auth System
```typescript
// Layouts use auth guards
import { RequireRole } from '@/lib/auth/guards';
import { getCurrentUser } from '@/lib/auth/server';

// Navigation uses permissions
import { hasPermission } from '@/lib/auth/rbac';
```

### With Next.js
```typescript
// Use Next.js font optimization
import { Inter } from 'next/font/google';

// Use Next.js metadata API
export const metadata: Metadata = { ... };

// Use Next.js navigation
import { usePathname } from 'next/navigation';
```

### With shadcn/ui
```typescript
// Use existing UI components
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
```

---

## 📝 Implementation Notes

### Layout Hierarchy
```
Root Layout (app/layout.tsx)
└── Providers (Query + Theme)
    └── Role-Based Layout
        ├── Sidebar Navigation
        ├── Header
        └── Main Content
            └── Page
```

### Theme Configuration
```typescript
// Tailwind config supports dark mode
module.exports = {
  darkMode: ['class'],
  // ...
};

// CSS variables for both themes
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Navigation Item Types
```typescript
type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  badge?: string | number;
  children?: NavItem[];
};
```

### Responsive Breakpoints
```
Mobile: < 768px    - Collapsed sidebar (hamburger)
Tablet: 768-1024px - Side drawer sidebar
Desktop: > 1024px  - Full sidebar visible
```

---

## 🚀 Quick Start Commands

```bash
# Install dependencies (if needed)
npm install @tanstack/react-query next-themes

# Create directories
mkdir -p components/\(platform\)/shared/navigation
mkdir -p components/\(platform\)/layouts

# Run checks
npx tsc --noEmit
npm run lint
npm test -- components --coverage
```

---

## 🔄 Dependencies

**Requires (from previous sessions):**
- ✅ **Session 1:** Working app structure, root layout
- ✅ **Session 2:** Auth system, RBAC, guards
- ✅ shadcn/ui components installed
- ✅ Tailwind CSS configured

**Blocks (must complete before):**
- **SESSION4** (Security) - Uses layouts for route structure
- **SESSION5** (Testing) - UI components need layouts
- **SESSION6** (Deployment) - Complete UI needed

**Enables:**
- Beautiful, consistent UI across platform
- Role-based user experiences
- Theme switching (dark/light modes)
- Professional navigation structure
- Ready for feature development

---

## 📖 Reference Files

**Must read before starting:**
- `components/ui/` - shadcn components
- `lib/auth/guards.tsx` - Auth protection
- `lib/auth/rbac.ts` - Permissions
- Tailwind config - Theme variables

**Design References:**
- Old site color scheme (maintain consistency)
- Modern SaaS dashboard patterns
- shadcn/ui examples

---

## ⚠️ Best Practices

**Layout Rules:**
- ✅ Server Components by default (layouts, nav)
- ✅ Client Components only for interactivity (user menu, theme toggle)
- ✅ Use auth guards at layout level
- ✅ Permission checks for nav items
- ✅ Responsive design from start

**Performance:**
- ✅ Font optimization with next/font
- ✅ Dynamic imports for heavy components
- ✅ Memoize nav items
- ✅ Lazy load dropdown menus

**Accessibility:**
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus management
- ✅ Screen reader support

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🟢 Important - Core UI infrastructure
