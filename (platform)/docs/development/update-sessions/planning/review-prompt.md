Please do a thorough review to make sure that the design for this cms&marketing module -> C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\app\real-estate\cms-marketing and all of its dashboards/subpages match the main user dashboard design -> C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\app\real-estate\user-dashboard -> In doing this, we also need to make sure that all functions and features are working properly for every part of this entire module (all buttons, dropdowns, filters, etc.). Split everything up into phases and use the single agent guide in order to deploy the agent in every phase to ensure high quality work is being done and no mistakes are being made -> C:\Users\zochr\Desktop\GitHub\Strive-SaaS\.claude\agents\single-agent-usage-guide.md -> Remember that we are using mock data at the moment to ensure everything works properly when I go and test the local preview.

Here's the location of the original CRM project that was integrated into the platform -> C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\completed\cms&marketing-module\real-estate-cms-and-marketing Just double check to make sure it has all of the functions, features, and overall layout that were in the original project while still converting the UI to match the current platform UI which is on the main user dashboard that I gave you the path to.

Claude's plan for updating Marketplace module after the prompt above was given

Here is Claude's plan:                                                                        │
│ ╭───────────────────────────────────────────────────────────────────────────────────────────╮ │
│ │ Marketplace Module Comprehensive Review & Mock Data Integration Plan                      │ │
│ │                                                                                           │ │
│ │ Overview                                                                                  │ │
│ │                                                                                           │ │
│ │ Review entire Marketplace module for design consistency and functionality, then integrate │ │
│ │  mock data infrastructure to enable local testing without database.                       │ │
│ │                                                                                           │ │
│ │ Current State Analysis                                                                    │ │
│ │                                                                                           │ │
│ │ ✅ What Exists:                                                                            │ │
│ │ - 12 route files (dashboard, cart, purchases, tools, bundles)                             │ │
│ │ - 18 component files (organized by feature)                                               │ │
│ │ - Backend queries/actions using Prisma directly                                           │ │
│ │ - Dashboard with inline mock data (559 lines)                                             │ │
│ │ - Complete test infrastructure (Session 8)                                                │ │
│ │                                                                                           │ │
│ │ ❌ Critical Gaps:                                                                          │ │
│ │ - NO marketplace mock data provider (CRM has contactsProvider pattern)                    │ │
│ │ - Backend queries call Prisma → won't work with empty schema                              │ │
│ │ - Dashboard mock data is inline → should be in provider                                   │ │
│ │ - Unknown if all pages work with mock data                                                │ │
│ │ - Design consistency with main dashboard not verified                                     │ │
│ │ - Functional testing not performed                                                        │ │
│ │                                                                                           │ │
│ │ ---                                                                                       │ │
│ │ Phase 1: Mock Data Infrastructure (Agent 1)                                               │ │
│ │                                                                                           │ │
│ │ Duration: 45-60 minutesPriority: CRITICAL - Required for all testing                      │ │
│ │                                                                                           │ │
│ │ Objectives                                                                                │ │
│ │                                                                                           │ │
│ │ 1. Create marketplace mock data generators                                                │ │
│ │ 2. Create marketplace data provider (following CRM pattern)                               │ │
│ │ 3. Extract dashboard inline mock data to mocks                                            │ │
│ │ 4. Initialize mock data stores                                                            │ │
│ │                                                                                           │ │
│ │ Tasks                                                                                     │ │
│ │                                                                                           │ │
│ │ - Create lib/data/mocks/marketplace.ts:                                                   │ │
│ │   - generateMockTool() - 47 realistic tools (categories, tiers, pricing)                  │ │
│ │   - generateMockBundle() - 6 bundles (STARTER_PACK, GROWTH_PACK, etc.)                    │ │
│ │   - generateMockPurchase() - Purchase history data                                        │ │
│ │   - generateMockReview() - Tool reviews with ratings                                      │ │
│ │   - generateMockCart() - Shopping cart items                                              │ │
│ │   - Export TypeScript types                                                               │ │
│ │ - Create lib/data/providers/marketplace-provider.ts:                                      │ │
│ │   - Follow crm-provider.ts pattern exactly                                                │ │
│ │   - toolsProvider (findMany, findById, search, filter)                                    │ │
│ │   - bundlesProvider (findMany, findById)                                                  │ │
│ │   - purchasesProvider (findMany, findById, create)                                        │ │
│ │   - reviewsProvider (findMany, create)                                                    │ │
│ │   - cartProvider (get, addItem, removeItem, clear)                                        │ │
│ │   - Use dataConfig.useMocks toggle                                                        │ │
│ │ - Update lib/data/index.ts:                                                               │ │
│ │   - Export all marketplace providers                                                      │ │
│ │                                                                                           │ │
│ │ Verification                                                                              │ │
│ │                                                                                           │ │
│ │ - All providers return realistic mock data                                                │ │
│ │ - Mock data includes enum values matching schema (FOUNDATION, GROWTH, ELITE, T1, T2, T3)  │ │
│ │ - No TypeScript errors                                                                    │ │
│ │ - Follows CRM provider pattern exactly                                                    │ │
│ │                                                                                           │ │
│ │ ---                                                                                       │ │
│ │ Phase 2: Backend Integration (Agent 2)                                                    │ │
│ │                                                                                           │ │
│ │ Duration: 60-90 minutesPriority: CRITICAL - Required for functionality                    │ │
│ │                                                                                           │ │
│ │ Objectives                                                                                │ │
│ │                                                                                           │ │
│ │ 1. Update all backend queries to use providers                                            │ │
│ │ 2. Maintain both mock and Prisma code paths                                               │ │
│ │ 3. Ensure organizationId filtering in mock data                                           │ │
│ │ 4. Test all backend functions with mocks                                                  │ │
│ │                                                                                           │ │
│ │ Tasks                                                                                     │ │
│ │                                                                                           │ │
│ │ - Update lib/modules/marketplace/queries.ts:                                              │ │
│ │   - Import marketplace providers                                                          │ │
│ │   - Wrap Prisma queries with dataConfig.useMocks checks                                   │ │
│ │   - Maintain existing caching (unstable_cache)                                            │ │
│ │   - Preserve organizationId filtering                                                     │ │
│ │ - Update lib/modules/marketplace/actions.ts:                                              │ │
│ │   - Use providers for all mutations                                                       │ │
│ │   - Maintain Zod validation                                                               │ │
│ │   - Keep RBAC checks                                                                      │ │
│ │ - Update lib/modules/marketplace/cart/queries.ts:                                         │ │
│ │   - Use cartProvider                                                                      │ │
│ │   - Maintain session-based cart logic                                                     │ │
│ │ - Update lib/modules/marketplace/reviews/queries.ts:                                      │ │
│ │   - Use reviewsProvider                                                                   │ │
│ │   - Maintain rating calculations                                                          │ │
│ │                                                                                           │ │
│ │ Verification                                                                              │ │
│ │                                                                                           │ │
│ │ - All queries work with NEXT_PUBLIC_USE_MOCKS=true                                        │ │
│ │ - All actions work with mock data                                                         │ │
│ │ - No Prisma errors when mocks enabled                                                     │ │
│ │ - TypeScript: 0 errors                                                                    │ │
│ │ - ESLint: 0 warnings                                                                      │ │
│ │                                                                                           │ │
│ │ ---                                                                                       │ │
│ │ Phase 3: Design Consistency Review (Agent 3)                                              │ │
│ │                                                                                           │ │
│ │ Duration: 60-75 minutesPriority: HIGH - User experience critical                          │ │
│ │                                                                                           │ │
│ │ Objectives                                                                                │ │
│ │                                                                                           │ │
│ │ 1. Compare all Marketplace pages to main dashboard design                                 │ │
│ │ 2. Ensure glass morphism and neon borders consistent                                      │ │
│ │ 3. Verify responsive design patterns                                                      │ │
│ │ 4. Check component library usage                                                          │ │
│ │                                                                                           │ │
│ │ Reference Standards                                                                       │ │
│ │                                                                                           │ │
│ │ - Main dashboard: app/real-estate/dashboard/page.tsx                                      │ │
│ │ - Design guide: docs/MODULE-DASHBOARD-GUIDE.md                                            │ │
│ │ - Glass effects: app/globals.css (lines 221-561)                                          │ │
│ │                                                                                           │ │
│ │ Review Checklist Per Page                                                                 │ │
│ │                                                                                           │ │
│ │ Dashboard (marketplace/dashboard/page.tsx):                                               │ │
│ │ - HeroSection with personalized greeting (time-based)                                     │ │
│ │ - Glass morphism effects (glass-strong for hero)                                          │ │
│ │ - Neon borders (cyan, purple, green, orange)                                              │ │
│ │ - Stat cards match main dashboard pattern                                                 │ │
│ │ - Feature cards with hover effects (hover:-translate-y-1)                                 │ │
│ │ - Responsive grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4)                             │ │
│ │ - Icon usage consistent (Lucide React)                                                    │ │
│ │ - Suspense boundaries for async data                                                      │ │
│ │ - Loading skeletons match content layout                                                  │ │
│ │                                                                                           │ │
│ │ Cart (marketplace/cart/page.tsx):                                                         │ │
│ │ - Same glass/neon design system                                                           │ │
│ │ - Empty state with illustration                                                           │ │
│ │ - Cart items with consistent card styling                                                 │ │
│ │ - Checkout button prominence (primary color)                                              │ │
│ │ - Price display formatting ($XX.XX)                                                       │ │
│ │ - Responsive layout                                                                       │ │
│ │                                                                                           │ │
│ │ Purchases (marketplace/purchases/page.tsx):                                               │ │
│ │ - Purchased tool cards match dashboard tool cards                                         │ │
│ │ - Status badges (active, expired, trial)                                                  │ │
│ │ - Empty state if no purchases                                                             │ │
│ │ - Grid layout consistency                                                                 │ │
│ │ - Action buttons (Configure, Manage, Renew)                                               │ │
│ │                                                                                           │ │
│ │ Tool Detail (marketplace/tools/[toolId]/page.tsx):                                        │ │
│ │ - Hero section for tool                                                                   │ │
│ │ - Feature list with icons                                                                 │ │
│ │ - Pricing display clear and prominent                                                     │ │
│ │ - Screenshots/images placeholder                                                          │ │
│ │ - Reviews section integrated                                                              │ │
│ │ - Purchase CTA button                                                                     │ │
│ │ - Breadcrumb navigation                                                                   │ │
│ │                                                                                           │ │
│ │ Bundle Detail (marketplace/bundles/[bundleId]/page.tsx):                                  │ │
│ │ - Bundle savings calculation visible                                                      │ │
│ │ - Included tools list                                                                     │ │
│ │ - Comparison to individual pricing                                                        │ │
│ │ - Purchase CTA                                                                            │ │
│ │                                                                                           │ │
│ │ Verification                                                                              │ │
│ │                                                                                           │ │
│ │ - Create design consistency report                                                        │ │
│ │ - List any deviations from standards                                                      │ │
│ │ - Provide screenshots/comparisons                                                         │ │
│ │ - Recommend fixes                                                                         │ │
│ │                                                                                           │ │
│ │ ---                                                                                       │ │
│ │ Phase 4: Functional Testing (Agent 4)                                                     │ │
│ │                                                                                           │ │
│ │ Duration: 90-120 minutesPriority: CRITICAL - Must work before deployment                  │ │
│ │                                                                                           │ │
│ │ Objectives                                                                                │ │
│ │                                                                                           │ │
│ │ 1. Test all user flows with mock data                                                     │ │
│ │ 2. Verify all interactive features work                                                   │ │
│ │ 3. Test error states and edge cases                                                       │ │
│ │ 4. Verify multi-tenancy isolation                                                         │ │
│ │                                                                                           │ │
│ │ Test Scenarios                                                                            │ │
│ │                                                                                           │ │
│ │ Browse & Filter Flow:                                                                     │ │
│ │ 1. Navigate to marketplace dashboard                                                      │ │
│ │ 2. Click "Browse Tools" → lands on marketplace main page                                  │ │
│ │ 3. Filter by category (FOUNDATION, GROWTH, ELITE)                                         │ │
│ │ 4. Filter by tier (T1, T2, T3)                                                            │ │
│ │ 5. Search by name                                                                         │ │
│ │ 6. Filter by price range                                                                  │ │
│ │ 7. Verify results update correctly                                                        │ │
│ │ 8. Verify tool cards display properly                                                     │ │
│ │                                                                                           │ │
│ │ Shopping Cart Flow:                                                                       │ │
│ │ 1. Add tool to cart from browse page                                                      │ │
│ │ 2. Verify cart badge updates (shows count)                                                │ │
│ │ 3. Add multiple tools                                                                     │ │
│ │ 4. Navigate to cart page                                                                  │ │
│ │ 5. Remove item from cart                                                                  │ │
│ │ 6. Verify total updates                                                                   │ │
│ │ 7. Clear cart                                                                             │ │
│ │ 8. Test empty cart state                                                                  │ │
│ │                                                                                           │ │
│ │ Purchase Flow:                                                                            │ │
│ │ 1. Add tools to cart                                                                      │ │
│ │ 2. Go to checkout                                                                         │ │
│ │ 3. Review purchase summary                                                                │ │
│ │ 4. Complete purchase (mock payment)                                                       │ │
│ │ 5. Verify redirect to purchases page                                                      │ │
│ │ 6. Verify tools appear in "My Tools"                                                      │ │
│ │ 7. Verify cart is cleared                                                                 │ │
│ │                                                                                           │ │
│ │ Bundle Flow:                                                                              │ │
│ │ 1. Browse bundles                                                                         │ │
│ │ 2. View bundle detail                                                                     │ │
│ │ 3. See included tools                                                                     │ │
│ │ 4. See savings calculation                                                                │ │
│ │ 5. Add bundle to cart                                                                     │ │
│ │ 6. Purchase bundle                                                                        │ │
│ │ 7. Verify all tools in bundle appear in purchases                                         │ │
│ │                                                                                           │ │
│ │ Reviews Flow:                                                                             │ │
│ │ 1. Navigate to purchased tool                                                             │ │
│ │ 2. Submit review (rating + comment)                                                       │ │
│ │ 3. Verify review appears                                                                  │ │
│ │ 4. View all reviews for tool                                                              │ │
│ │ 5. Verify star rating average updates                                                     │ │
│ │                                                                                           │ │
│ │ Multi-Tenancy:                                                                            │ │
│ │ 1. Test with different organization IDs                                                   │ │
│ │ 2. Verify purchases isolated by org                                                       │ │
│ │ 3. Verify cart isolated by user                                                           │ │
│ │ 4. Verify reviews show across orgs but purchases don't                                    │ │
│ │                                                                                           │ │
│ │ Verification                                                                              │ │
│ │                                                                                           │ │
│ │ - All flows complete without errors                                                       │ │
│ │ - Mock data displays correctly                                                            │ │
│ │ - Interactive features work (buttons, forms, filters)                                     │ │
│ │ - Error states handled gracefully                                                         │ │
│ │ - Loading states display                                                                  │ │
│ │ - Empty states display                                                                    │ │
│ │ - Multi-tenancy isolation confirmed                                                       │ │
│ │                                                                                           │ │
│ │ ---                                                                                       │ │
│ │ Phase 5: Navigation & Integration (Agent 5)                                               │ │
│ │                                                                                           │ │
│ │ Duration: 30-45 minutesPriority: MEDIUM - Polish and UX                                   │ │
│ │                                                                                           │ │
│ │ Objectives                                                                                │ │
│ │                                                                                           │ │
│ │ 1. Verify navigation menu integration                                                     │ │
│ │ 2. Test breadcrumbs and back navigation                                                   │ │
│ │ 3. Verify deep linking                                                                    │ │
│ │ 4. Test subscription tier gates                                                           │ │
│ │                                                                                           │ │
│ │ Tasks                                                                                     │ │
│ │                                                                                           │ │
│ │ - Verify sidebar navigation includes Marketplace                                          │ │
│ │ - Test cart badge updates in real-time                                                    │ │
│ │ - Test breadcrumbs on all pages                                                           │ │
│ │ - Test "Back to Dashboard" links                                                          │ │
│ │ - Verify tier gates (FREE=view only, CUSTOM=pay-per-use, STARTER+=includes tools)         │ │
│ │ - Test redirect flows (login → marketplace → back after auth)                             │ │
│ │ - Test 404 pages for invalid tool/bundle IDs                                              │ │
│ │                                                                                           │ │
│ │ Verification                                                                              │ │
│ │                                                                                           │ │
│ │ - Navigation works from all entry points                                                  │ │
│ │ - Cart badge accurate                                                                     │ │
│ │ - Breadcrumbs correct                                                                     │ │
│ │ - Tier gates function                                                                     │ │
│ │ - Deep links work                                                                         │ │
│ │ - Error pages display                                                                     │ │
│ │                                                                                           │ │
│ │ ---                                                                                       │ │
│ │ Phase 6: Test Suite Fixes & Validation (Agent 6)                                          │ │
│ │                                                                                           │ │
│ │ Duration: 45-60 minutesPriority: HIGH - Production readiness                              │ │
│ │                                                                                           │ │
│ │ Objectives                                                                                │ │
│ │                                                                                           │ │
│ │ 1. Fix enum values in test files (from Session 8)                                         │ │
│ │ 2. Run full test suite                                                                    │ │
│ │ 3. Verify test coverage ≥ 80%                                                             │ │
│ │ 4. Run E2E tests                                                                          │ │
│ │ 5. Verify build succeeds                                                                  │ │
│ │                                                                                           │ │
│ │ Tasks                                                                                     │ │
│ │                                                                                           │ │
│ │ - Fix enum values in all test files:                                                      │ │
│ │   - ToolCategory.CRM → ToolCategory.FOUNDATION                                            │ │
│ │   - ToolCategory.ANALYTICS → ToolCategory.GROWTH                                          │ │
│ │   - ToolCategory.MARKETING → ToolCategory.ELITE                                           │ │
│ │   - ToolTier.STARTER → ToolTier.T1                                                        │ │
│ │   - ToolTier.GROWTH → ToolTier.T2                                                         │ │
│ │   - ToolTier.ELITE → ToolTier.T3                                                          │ │
│ │ - Run test suite:                                                                         │ │
│ │ npm run test:marketplace                                                                  │ │
│ │ npm run test:marketplace:coverage                                                         │ │
│ │ npm run test:e2e:marketplace                                                              │ │
│ │ - Fix any failing tests                                                                   │ │
│ │ - Verify coverage ≥ 80%                                                                   │ │
│ │ - Run build: npm run build                                                                │ │
│ │ - Run type check: npx tsc --noEmit                                                        │ │
│ │ - Run lint: npm run lint                                                                  │ │
│ │                                                                                           │ │
│ │ Verification                                                                              │ │
│ │                                                                                           │ │
│ │ - All tests passing                                                                       │ │
│ │ - Coverage ≥ 80%                                                                          │ │
│ │ - E2E tests passing                                                                       │ │
│ │ - Build succeeds                                                                          │ │
│ │ - 0 TypeScript errors                                                                     │ │
│ │ - 0 new ESLint warnings                                                                   │ │
│ │                                                                                           │ │
│ │ ---                                                                                       │ │
│ │ Phase 7: Final Quality Audit (Agent 7)                                                    │ │
│ │                                                                                           │ │
│ │ Duration: 30-45 minutesPriority: MEDIUM - Final polish                                    │ │
│ │                                                                                           │ │
│ │ Objectives                                                                                │ │
│ │                                                                                           │ │
│ │ 1. Final code review                                                                      │ │
│ │ 2. Documentation completeness                                                             │ │
│ │ 3. Accessibility audit                                                                    │ │
│ │ 4. Performance check                                                                      │ │
│ │                                                                                           │ │
│ │ Tasks                                                                                     │ │
│ │                                                                                           │ │
│ │ - Review all files for:                                                                   │ │
│ │   - File size <500 lines                                                                  │ │
│ │   - Proper error boundaries                                                               │ │
│ │   - Loading states                                                                        │ │
│ │   - Empty states                                                                          │ │
│ │   - TypeScript types                                                                      │ │
│ │   - Comments where needed                                                                 │ │
│ │ - Accessibility:                                                                          │ │
│ │   - Proper heading hierarchy (h1 → h2 → h3)                                               │ │
│ │   - ARIA labels on interactive elements                                                   │ │
│ │   - Keyboard navigation works                                                             │ │
│ │   - Focus indicators visible                                                              │ │
│ │   - Color contrast WCAG AA                                                                │ │
│ │ - Performance:                                                                            │ │
│ │   - Images optimized (Next.js Image component)                                            │ │
│ │   - Lazy loading where appropriate                                                        │ │
│ │   - Server Components by default                                                          │ │
│ │   - Minimal client JS                                                                     │ │
│ │   - Caching implemented                                                                   │ │
│ │ - Documentation:                                                                          │ │
│ │   - README updated                                                                        │ │
│ │   - API documentation complete                                                            │ │
│ │   - Component usage examples                                                              │ │
│ │   - Deployment checklist reviewed                                                         │ │
│ │                                                                                           │ │
│ │ Verification                                                                              │ │
│ │                                                                                           │ │
│ │ - Create final audit report                                                               │ │
│ │ - List any issues found                                                                   │ │
│ │ - Confirm production readiness                                                            │ │
│ │                                                                                           │ │
│ │ ---                                                                                       │ │
│ │ Success Criteria                                                                          │ │
│ │                                                                                           │ │
│ │ Phase 1-2 (Mock Data):                                                                    │ │
│ │ - ✅ All providers created following CRM pattern                                           │ │
│ │ - ✅ Mock data realistic and complete                                                      │ │
│ │ - ✅ All backend queries work with mocks                                                   │ │
│ │ - ✅ No Prisma errors when mocks enabled                                                   │ │
│ │                                                                                           │ │
│ │ Phase 3 (Design):                                                                         │ │
│ │ - ✅ All pages match main dashboard design                                                 │ │
│ │ - ✅ Glass morphism and neon borders consistent                                            │ │
│ │ - ✅ Responsive design working                                                             │ │
│ │ - ✅ Component library usage consistent                                                    │ │
│ │                                                                                           │ │
│ │ Phase 4 (Functional):                                                                     │ │
│ │ - ✅ All user flows complete without errors                                                │ │
│ │ - ✅ Interactive features working                                                          │ │
│ │ - ✅ Multi-tenancy isolation verified                                                      │ │
│ │ - ✅ Error/loading/empty states working                                                    │ │
│ │                                                                                           │ │
│ │ Phase 5 (Navigation):                                                                     │ │
│ │ - ✅ Navigation integrated                                                                 │ │
│ │ - ✅ Cart badge updates                                                                    │ │
│ │ - ✅ Tier gates functional                                                                 │ │
│ │ - ✅ Deep linking works                                                                    │ │
│ │                                                                                           │ │
│ │ Phase 6 (Tests):                                                                          │ │
│ │ - ✅ All tests passing                                                                     │ │
│ │ - ✅ Coverage ≥ 80%                                                                        │ │
│ │ - ✅ Build succeeds                                                                        │ │
│ │ - ✅ 0 TypeScript errors                                                                   │ │
│ │                                                                                           │ │
│ │ Phase 7 (Quality):                                                                        │ │
│ │ - ✅ All files <500 lines                                                                  │ │
│ │ - ✅ Accessibility WCAG AA                                                                 │ │
│ │ - ✅ Performance optimized                                                                 │ │
│ │ - ✅ Documentation complete                                                                │ │
│ │                                                                                           │ │
│ │ ---                                                                                       │ │
│ │ Agent Orchestration Pattern                                                               │ │
│ │                                                                                           │ │
│ │ Following single-agent-usage-guide.md:                                                    │ │
│ │                                                                                           │ │
│ │ For Each Phase:                                                                           │ │
│ │ 1. Launch strive-agent-universal with specific phase objectives                           │ │
│ │ 2. Include verification commands in task prompt                                           │ │
│ │ 3. Require EXECUTION REPORT with actual command outputs                                   │ │
│ │ 4. Block on verification failures                                                         │ │
│ │ 5. Independent validation after agent completes                                           │ │
│ │                                                                                           │ │
│ │ Example Phase 1 Agent Invocation:                                                         │ │
│ │ Task strive-agent-universal "                                                             │ │
│ │ Phase 1: Marketplace Mock Data Infrastructure                                             │ │
│ │                                                                                           │ │
│ │ [Detailed objectives from plan]                                                           │ │
│ │                                                                                           │ │
│ │ BLOCKING: DO NOT report complete without:                                                 │ │
│ │ - All provider files created                                                              │ │
│ │ - All mock generators working                                                             │ │
│ │ - Verification commands executed                                                          │ │
│ │ - 0 TypeScript errors shown in output                                                     │ │
│ │ "                                                                                         │ │
│ │                                                                                           │ │
│ │ Token Efficiency:                                                                         │ │
│ │ - ✅ Read local schema docs (500 tokens)                                                   │ │
│ │ - ❌ NEVER use MCP list_tables (18k tokens)                                                │ │
│ │                                                                                           │ │
│ │ ---                                                                                       │ │
│ │ Deliverables                                                                              │ │
│ │                                                                                           │ │
│ │ Phase 1-2: Mock data infrastructure                                                       │ │
│ │ Phase 3: Design consistency report                                                        │ │
│ │ Phase 4: Functional testing report                                                        │ │
│ │ Phase 5: Navigation integration report                                                    │ │
│ │ Phase 6: Test suite results                                                               │ │
│ │ Phase 7: Final audit report + production readiness checklist                              │ │
│ │                                                                                           │ │
│ │ Total Estimated Time: 6-8 hours across 7 phases                                           │ │
│ │ Agents Required: 7 sequential agents (1 per phase)                                        │ │
│ │ Approach: Systematic, thorough, high-quality review