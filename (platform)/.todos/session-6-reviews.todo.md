# Session 6: Reviews & Ratings System Implementation

## Phase 1: Schema Verification & Backend Setup
- [ ] Read Prisma schema for tool_reviews model (SCHEMA-MODELS.md)
- [ ] Create reviews directory: lib/modules/marketplace/reviews/
- [ ] Create schemas.ts with ReviewSchema (Zod validation)
- [ ] Create queries.ts (getToolReviews, getUserReviewForTool, getReviewStats)
- [ ] Create actions.ts (createToolReview, deleteToolReview, toggleReviewHelpful)
- [ ] Create index.ts (export public API)
- [ ] Update lib/modules/marketplace/index.ts to export reviews module

## Phase 2: Review Components
- [ ] Create components/real-estate/marketplace/reviews/ directory
- [ ] Create StarRating.tsx (interactive + display modes, keyboard accessible)
- [ ] Create ReviewForm.tsx (client component with StarRating, textarea, submit)
- [ ] Create ReviewItem.tsx (display review with avatar, name, rating, text, timestamp)
- [ ] Create ReviewList.tsx (server component, fetch and display reviews)
- [ ] Create RatingDistribution.tsx (server component, bar chart, average rating)

## Phase 3: Tool Detail Page Integration
- [ ] Create app/real-estate/marketplace/tools/[toolId]/page.tsx
- [ ] Implement tabs: Overview, Reviews
- [ ] Add review restriction check (user must have purchased tool)
- [ ] Get user's existing review if exists (for update vs create)
- [ ] Display RatingDistribution in sidebar
- [ ] Display ReviewList with ReviewForm if purchased
- [ ] Add Suspense for async components

## Phase 4: Security & Validation
- [ ] Add requireAuth() check on tool detail page
- [ ] Verify tool purchase before showing review form
- [ ] Filter reviews by organizationId (multi-tenancy)
- [ ] Validate input with ReviewSchema (Zod)
- [ ] Prevent duplicate reviews (unique constraint: tool_id, reviewer_id)
- [ ] Implement upsert pattern for create/update
- [ ] Add RBAC check (only purchasers can review)

## Phase 5: Testing & Verification
- [ ] TypeScript check: npx tsc --noEmit (0 errors)
- [ ] ESLint check: npm run lint (0 warnings)
- [ ] File size check: all files under 500 lines
- [ ] Test review submission (create)
- [ ] Test review update (upsert)
- [ ] Test rating distribution calculation
- [ ] Test purchase restriction (form only shows if purchased)
- [ ] Test empty states
- [ ] Build test: npm run build

## Phase 6: Documentation & Cleanup
- [ ] Update lib/modules/marketplace/README.md if exists
- [ ] Verify all imports are correct
- [ ] Check console for any warnings
- [ ] Create execution report with verification outputs
- [ ] List all files created/modified with line counts

## Blocking Requirements
- DO NOT report complete without:
  1. All components created and tested
  2. Security validations implemented (purchase check, RBAC, multi-tenancy)
  3. Verification command outputs included
  4. TypeScript 0 errors
  5. ESLint 0 warnings
  6. All files under 500 lines
  7. Review submission works end-to-end
