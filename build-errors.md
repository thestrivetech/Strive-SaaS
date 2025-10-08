 ⚠ `experimental.instrumentationHook` is no longer needed, because `instrumentation.js` is available by default. You can remove it from next.config.mjs.
 ⚠ Invalid next.config.mjs options detected: 
 ⚠     Unrecognized key(s) in object: 'instrumentationHook' at "experimental"
 ⚠ See more info here: https://nextjs.org/docs/messages/invalid-next-config
 ⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\zochr\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles: 
   * C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\package-lock.json

   ▲ Next.js 15.6.0-canary.39 (Turbopack)
   - Environments: .env.local
   - Experiments (use with caution):
     ✓ instrumentationHook
     · optimizePackageImports
     · serverActions

   Creating an optimized production build ...
 ✓ Compiled successfully in 8.8s

./app/(admin)/admin/alerts/page.tsx
15:10  Warning: 'Bell' is defined but never used.  @typescript-eslint/no-unused-vars
82:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/(admin)/admin/feature-flags/page.tsx
24:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
92:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/(admin)/admin/organizations/page.tsx
72:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
77:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
84:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/(auth)/login/page.tsx
94:15  Warning: 'confirmPassword' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./app/(auth)/onboarding/page.tsx
45:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/auth/login/route.ts
20:71  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
31:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
34:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/auth/signup/route.ts
19:15  Warning: '_name' is defined but never used.  @typescript-eslint/no-unused-vars
19:30  Warning: '_value' is defined but never used.  @typescript-eslint/no-unused-vars
19:46  Warning: '_options' is defined but never used.  @typescript-eslint/no-unused-vars
22:18  Warning: '_name' is defined but never used.  @typescript-eslint/no-unused-vars
22:33  Warning: '_options' is defined but never used.  @typescript-eslint/no-unused-vars

./app/api/health/route.ts
153:12  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./app/api/v1/admin/alerts/route.ts
9:27  Warning: 'req' is defined but never used.  @typescript-eslint/no-unused-vars
18:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
33:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/v1/admin/audit-logs/route.ts
36:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/v1/admin/feature-flags/route.ts
10:27  Warning: 'req' is defined but never used.  @typescript-eslint/no-unused-vars
19:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
34:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
49:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/v1/admin/organizations/route.ts
23:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/v1/admin/organizations/[id]/route.ts
68:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
113:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
175:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/v1/admin/users/reactivate/route.ts
36:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/v1/admin/users/route.ts
24:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/v1/admin/users/suspend/route.ts
38:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/v1/admin/users/[id]/route.ts
65:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/v1/ai-garage/templates/route.ts
76:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
127:28  Warning: 'req' is defined but never used.  @typescript-eslint/no-unused-vars

./app/api/v1/dashboard/actions/route.ts
12:27  Warning: 'req' is defined but never used.  @typescript-eslint/no-unused-vars

./app/api/v1/dashboard/metrics/calculate/route.ts
12:28  Warning: 'req' is defined but never used.  @typescript-eslint/no-unused-vars

./app/api/v1/dashboard/metrics/route.ts
14:27  Warning: 'req' is defined but never used.  @typescript-eslint/no-unused-vars

./app/api/v1/dashboard/widgets/route.ts
14:27  Warning: 'req' is defined but never used.  @typescript-eslint/no-unused-vars

./app/api/v1/onboarding/payment-intent/route.ts
34:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/v1/onboarding/session/route.ts
57:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
101:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/webhooks/stripe/route.ts
28:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
70:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
97:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
121:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
151:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
154:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
155:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
176:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
210:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/real-estate/cms-marketing/content/campaigns/new/page.tsx
55:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
61:13  Warning: 'campaign' is assigned a value but never used.  @typescript-eslint/no-unused-vars
132:72  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/real-estate/cms-marketing/content/campaigns/page.tsx
107:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/real-estate/cms-marketing/content/page.tsx
46:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
47:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/real-estate/cms-marketing/dashboard/loading.tsx
2:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars

./app/real-estate/cms-marketing/dashboard/page.tsx
313:60  Warning: 'trend' is defined but never used.  @typescript-eslint/no-unused-vars

./app/real-estate/crm/contacts/page.tsx
48:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/real-estate/crm/contacts/[id]/page.tsx
15:45  Warning: 'Briefcase' is defined but never used.  @typescript-eslint/no-unused-vars
15:56  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars

./app/real-estate/crm/deals/[id]/page.tsx
12:31  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars

./app/real-estate/crm/leads/page.tsx
5:20  Warning: 'getLeadsCount' is defined but never used.  @typescript-eslint/no-unused-vars
12:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
50:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
51:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
52:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/real-estate/dashboard/page.tsx
27:3  Warning: 'Settings' is defined but never used.  @typescript-eslint/no-unused-vars
153:16  Warning: 'KPICardsSection' is defined but never used.  @typescript-eslint/no-unused-vars
218:38  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars
259:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
292:38  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars
351:33  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars
461:33  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars
483:10  Warning: 'KPICardsSkeleton' is defined but never used.  @typescript-eslint/no-unused-vars

./app/real-estate/layout.tsx
67:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/real-estate/workspace/analytics/page.tsx
11:10  Warning: 'getOrganizationCompliance' is defined but never used.  @typescript-eslint/no-unused-vars
12:10  Warning: 'getRecentActivity' is defined but never used.  @typescript-eslint/no-unused-vars

./app/real-estate/workspace/listings/page.tsx
54:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
55:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
180:3  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars

./app/real-estate/workspace/listings/[id]/page.tsx
19:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
22:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars

./app/real-estate/workspace/sign/[signatureId]/page.tsx
16:12  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./app/real-estate/workspace/[loopId]/page.tsx
29:12  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./app/settings/layout.tsx
17:9  Warning: 'session' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./app/settings/page.tsx
12:3  Warning: 'Building' is defined but never used.  @typescript-eslint/no-unused-vars
14:3  Warning: 'Bell' is defined but never used.  @typescript-eslint/no-unused-vars
15:3  Warning: 'Shield' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
18:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
19:3  Warning: 'Palette' is defined but never used.  @typescript-eslint/no-unused-vars

./components/features/admin/data-table.tsx
18:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
35:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
79:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/features/dashboard/widgets/chart-widget.tsx
24:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/features/onboarding/onboarding-progress.tsx
14:3  Warning: 'totalSteps' is defined but never used.  @typescript-eslint/no-unused-vars

./components/features/onboarding/plan-selection-form.tsx
72:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/layouts/admin-layout.tsx
31:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/layouts/dashboard-shell.tsx
23:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/layouts/employee-layout.tsx
27:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/cms-marketing/analytics/export-button.tsx
35:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/content/campaigns/social-post-scheduler.tsx
40:9  Warning: 'form' is assigned a value but never used.  @typescript-eslint/no-unused-vars
65:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/content/content-editor.tsx
20:8  Warning: 'ContentItemInput' is defined but never used.  @typescript-eslint/no-unused-vars
28:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
42:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/content/content-list-table.tsx
71:45  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/content/editor/publish-settings.tsx
17:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
54:57  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
78:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
108:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
125:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/content/editor/seo-panel.tsx
12:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/content/media/media-card.tsx
44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
45:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
46:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/content/media/media-grid.tsx
23:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
24:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
25:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/content/media/media-library.tsx
32:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
63:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/content/media/media-picker-dialog.tsx
35:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
83:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/content/media/media-upload-zone.tsx
39:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/crm/calendar/appointment-card.tsx
3:10  Warning: 'format' is defined but never used.  @typescript-eslint/no-unused-vars
4:10  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
4:35  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/crm/calendar/appointment-form-dialog.tsx
48:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
56:3  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/crm/calendar/calendar-month-view.tsx
3:76  Warning: 'isSameDay' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/crm/calendar/calendar-view.tsx
72:67  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/crm/calendar/task-list.tsx
12:28  Warning: 'userId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/crm/contacts/contact-actions-menu.tsx
108:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
113:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
117:57  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
121:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/crm/contacts/contact-form-dialog.tsx
60:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
94:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/crm/deals/deal-card.tsx
61:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
64:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
67:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
67:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
70:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/crm/deals/deal-form-dialog.tsx
58:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
84:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/crm/deals/pipeline-board.tsx
17:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/crm/leads/lead-card.tsx
25:10  Warning: 'showEditDialog' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/crm/leads/lead-form-dialog.tsx
33:57  Warning: 'CreateLeadInput' is defined but never used.  @typescript-eslint/no-unused-vars
60:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
90:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/marketplace/cart/CartItem.tsx
10:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/marketplace/cart/ShoppingCartPanel.tsx
5:52  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
62:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/marketplace/grid/MarketplaceGrid.tsx
12:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
18:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/projects/create-project-dialog.tsx
58:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/projects/edit-project-dialog.tsx
5:44  Warning: 'Control' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/projects/organization/create-organization-dialog.tsx
72:13  Warning: 'org' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/projects/organization/organization-switcher.tsx
29:10  Warning: 'showCreateDialog' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/projects/project-filters.tsx
26:10  Warning: 'ProjectStatus' is defined but never used.  @typescript-eslint/no-unused-vars
26:25  Warning: 'Priority' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/workspace/activity-feed.tsx
69:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/workspace/apply-workflow-dialog.tsx
68:6  Warning: React Hook useEffect has a missing dependency: 'loadTemplates'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/real-estate/workspace/compliance-alerts.tsx
97:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/workspace/create-signature-dialog.tsx
15:41  Warning: 'loopId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/workspace/document-list.tsx
12:10  Warning: 'Download' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/workspace/document-version-dialog.tsx
14:41  Warning: 'documentId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/workspace/loop-overview.tsx
2:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
8:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/real-estate/workspace/party-list.tsx
60:6  Warning: React Hook useEffect has a missing dependency: 'loadParties'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/real-estate/workspace/sign-document-form.tsx
11:15  Warning: 'X' is defined but never used.  @typescript-eslint/no-unused-vars
14:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
23:9  Warning: 'canvasRef' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/workspace/signature-list.tsx
1:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
3:10  Warning: 'CheckCircle2' is defined but never used.  @typescript-eslint/no-unused-vars
3:24  Warning: 'XCircle' is defined but never used.  @typescript-eslint/no-unused-vars
3:33  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
5:33  Warning: 'requestId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/workspace/signature-requests.tsx
11:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
12:25  Warning: 'Plus' is defined but never used.  @typescript-eslint/no-unused-vars

./components/real-estate/workspace/task-checklist.tsx
47:6  Warning: React Hook useEffect has a missing dependency: 'loadTasks'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/real-estate/workspace/task-create-dialog.tsx
75:6  Warning: React Hook useEffect has a missing dependency: 'loadParties'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/real-estate/workspace/workflow-templates.tsx
53:6  Warning: React Hook useEffect has a missing dependency: 'loadTemplates'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/shared/dashboard/CommandBar.tsx
75:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/shared/dashboard/DashboardContent.tsx
5:10  Warning: 'HeroSection' is defined but never used.  @typescript-eslint/no-unused-vars
31:42  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/shared/dashboard/DashboardErrorBoundary.tsx
16:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
34:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/shared/dashboard/DashboardGrid.tsx
55:10  Warning: 'isDragging' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/shared/dashboard/MobileBottomNav.tsx
11:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/shared/dashboard/Sidebar.tsx
10:3  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
36:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/shared/dashboard/widgets/AIInsightsWidget.tsx
7:10  Warning: 'Lightbulb' is defined but never used.  @typescript-eslint/no-unused-vars
45:36  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/shared/dashboard/widgets/KPIRingsWidget.tsx
108:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
111:34  Warning: 'stats' is defined but never used.  @typescript-eslint/no-unused-vars

./components/shared/dashboard/widgets/LiveChartsWidget.tsx
51:36  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/shared/dashboard/widgets/SmartSuggestionsWidget.tsx
5:68  Warning: 'Users' is defined but never used.  @typescript-eslint/no-unused-vars
15:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
108:42  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/shared/dashboard/widgets/WorldMapWidget.tsx
18:34  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/shared/layouts/platform-layout.tsx
26:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/shared/navigation/notification-dropdown.tsx
3:31  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
8:10  Warning: 'Separator' is defined but never used.  @typescript-eslint/no-unused-vars
12:3  Warning: 'DropdownMenuItem' is defined but never used.  @typescript-eslint/no-unused-vars
36:3  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars

./components/shared/navigation/sidebar-nav.tsx
8:3  Warning: 'FolderKanban' is defined but never used.  @typescript-eslint/no-unused-vars
11:3  Warning: 'Wrench' is defined but never used.  @typescript-eslint/no-unused-vars
12:3  Warning: 'Shield' is defined but never used.  @typescript-eslint/no-unused-vars

./components/subscription/tier-gate.tsx
45:9  Warning: 'router' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/ui/analytics-error-boundary.tsx
58:14  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars

./components/ui/bulk-selector.tsx
68:9  Warning: 'handleToggle' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/ui/calendar.tsx
55:51  Warning: 'disabled' is defined but never used.  @typescript-eslint/no-unused-vars

./components/ui/file-upload.tsx
4:31  Warning: 'Loader2' is defined but never used.  @typescript-eslint/no-unused-vars
113:29  Warning: 'removed' is assigned a value but never used.  @typescript-eslint/no-unused-vars
206:21  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/ui/floating-chat.tsx
4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
19:10  Warning: 'viewportHeight' is assigned a value but never used.  @typescript-eslint/no-unused-vars
49:48  Warning: The ref value 'performanceId.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'performanceId.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps
51:6  Warning: React Hook useEffect has missing dependencies: 'handleAnalytics', 'handleChatbotClose', 'handleChatbotError', 'handleChatbotMinimize', 'handleChatbotReady', and 'preconnectToChatbot'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
153:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
164:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
179:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
245:9  Warning: 'renderErrorState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
308:9  Warning: 'renderLoadingState' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/ui/hero-section.tsx
1:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
4:8  Warning: 'LazyImage' is defined but never used.  @typescript-eslint/no-unused-vars
16:3  Warning: 'title' is defined but never used.  @typescript-eslint/no-unused-vars
23:10  Warning: 'isHovering' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/ui/lazy-image.tsx
87:7  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/ui/multi-select.tsx
4:10  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars

./components/ui/optimized-image.tsx
169:57  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/ui/professional-brochure.tsx
18:3  Warning: 'Smartphone' is defined but never used.  @typescript-eslint/no-unused-vars
128:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/ui/select.tsx
5:10  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars

./components/ui/sub-filter-bar.tsx
37:27  Warning: React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead.  react-hooks/exhaustive-deps
163:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
163:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/analytics/analytics-tracker.ts
78:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
119:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
127:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
161:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
215:20  Warning: 'os' is assigned a value but never used.  @typescript-eslint/no-unused-vars
228:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/analytics/web-vitals.ts
6:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
48:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
49:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/auth/auth-helpers.ts
27:20  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
36:20  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
72:10  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
150:16  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/auth/rbac.ts
244:32  Warning: 'role' is defined but never used.  @typescript-eslint/no-unused-vars
252:33  Warning: 'role' is defined but never used.  @typescript-eslint/no-unused-vars
490:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
500:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
510:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
579:36  Warning: 'user' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/browser-detection.ts
122:71  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/chatbot-iframe-communication.ts
11:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
17:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
137:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/chatbot-performance-monitor.ts
10:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
25:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
89:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/data/mocks/crm.ts
16:3  Warning: 'randomFutureDate' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/database/prisma-extension.ts
53:47  Warning: 'operation' is defined but never used.  @typescript-eslint/no-unused-vars
53:58  Warning: 'model' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/database/prisma-middleware.ts
133:74  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
136:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
144:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
172:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
172:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
177:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
177:57  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
182:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
182:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
188:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
192:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
200:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
201:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
214:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
215:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
220:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
220:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
220:70  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
226:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
227:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
239:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
242:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
249:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
250:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
260:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
282:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/database/utils.ts
2:10  Warning: 'setTenantContext' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/export/csv.ts
47:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
47:70  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/hooks/useChatbotViewport.ts
46:11  Warning: 'debugHeight' is assigned a value but never used.  @typescript-eslint/no-unused-vars
48:11  Warning: 'infoCardsHeight' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/industries/healthcare/index.ts
81:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/industries/healthcare/types.ts
207:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/industries/real-estate/index.ts
83:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/industries/registry.ts
105:15  Warning: '_' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/industries/_core/base-industry.ts
36:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
142:20  Warning: 'settings' is defined but never used.  @typescript-eslint/no-unused-vars
142:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
155:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/industries/_core/industry-config.ts
54:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
55:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
104:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
116:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/industries/_core/industry-router.ts
83:91  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
106:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
118:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
134:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/middleware/rate-limit.ts
83:11  Warning: 'remaining' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/modules/admin/actions.ts
63:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
90:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
117:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
185:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/admin/audit.ts
13:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
65:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/admin/queries.ts
29:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
71:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
108:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/ai/actions.ts
89:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/ai-garage/blueprints/actions.ts
248:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
249:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
250:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/ai-garage/blueprints/queries.ts
6:15  Warning: 'tool_blueprints' is defined but never used.  @typescript-eslint/no-unused-vars
223:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
339:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/ai-garage/orders/actions.ts
164:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/ai-garage/orders/queries.ts
6:15  Warning: 'custom_agent_orders' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/ai-garage/orders/utils.ts
8:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/ai-garage/templates/queries.ts
6:15  Warning: 'agent_templates' is defined but never used.  @typescript-eslint/no-unused-vars
280:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/ai-garage/templates/utils.ts
227:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
228:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
229:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
230:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/ai-hub/schemas.ts
1:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/appointments/actions.ts
65:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
156:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/appointments/queries.ts
4:15  Warning: 'appointments' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/attachments/actions.ts
14:8  Warning: 'UploadAttachmentInput' is defined but never used.  @typescript-eslint/no-unused-vars
15:8  Warning: 'DeleteAttachmentInput' is defined but never used.  @typescript-eslint/no-unused-vars
16:8  Warning: 'GetAttachmentsInput' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/compliance/alerts.ts
34:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/compliance/checker.ts
6:32  Warning: 'ComplianceAlertType' is defined but never used.  @typescript-eslint/no-unused-vars
6:53  Warning: 'AlertSeverity' is defined but never used.  @typescript-eslint/no-unused-vars
113:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
115:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
128:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
147:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
162:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
181:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
185:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
208:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
213:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
218:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
219:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
231:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
246:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
273:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
295:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
299:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
311:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/content/analytics/content-analytics.ts
161:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/content/analytics/reports.ts
122:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/content/campaigns/actions.ts
84:31  Warning: '_orgId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
151:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
239:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/content/campaigns/queries.ts
28:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
161:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
194:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/content/content/actions.ts
3:23  Warning: 'getCurrentUser' is defined but never used.  @typescript-eslint/no-unused-vars
17:10  Warning: 'getUserOrganizationId' is defined but never used.  @typescript-eslint/no-unused-vars
101:32  Warning: '_orgId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
194:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/content/content/queries.ts
51:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
243:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/content/media/queries.ts
29:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
180:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
351:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
406:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/content/media/schemas.ts
103:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
107:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
111:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
115:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/crm/contacts/queries.ts
59:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
121:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
392:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/crm/core/actions.ts
95:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
214:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/crm/deals/pipeline.ts
3:21  Warning: 'DealStatus' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/crm/deals/queries/pipeline.ts
48:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/crm/deals/queries.ts
6:15  Warning: 'deals' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/dashboard/activities/queries.ts
90:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/dashboard/metrics/calculator.ts
110:3  Warning: 'query' is defined but never used.  @typescript-eslint/no-unused-vars
111:3  Warning: 'orgId' is defined but never used.  @typescript-eslint/no-unused-vars
129:3  Warning: 'query' is defined but never used.  @typescript-eslint/no-unused-vars
130:3  Warning: 'orgId' is defined but never used.  @typescript-eslint/no-unused-vars
148:3  Warning: 'query' is defined but never used.  @typescript-eslint/no-unused-vars
149:3  Warning: 'orgId' is defined but never used.  @typescript-eslint/no-unused-vars
167:3  Warning: 'query' is defined but never used.  @typescript-eslint/no-unused-vars
168:3  Warning: 'orgId' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/dashboard/metrics/queries.ts
49:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/dashboard/widgets/queries.ts
48:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/marketplace/schemas.ts
2:34  Warning: 'BundleType' is defined but never used.  @typescript-eslint/no-unused-vars
2:46  Warning: 'PurchaseStatus' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/notifications/queries.ts
60:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/onboarding/actions.ts
51:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
78:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
110:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
137:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
159:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
160:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
180:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
199:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
228:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/onboarding/payment.ts
108:94  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/onboarding/session.ts
79:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
82:9  Warning: 'session' is assigned a value but never used.  @typescript-eslint/no-unused-vars
84:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/projects/actions.ts
33:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/projects/queries.ts
31:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
121:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/projects/schemas.ts
3:10  Warning: 'createDateSchema' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/rei-analytics/schemas.ts
13:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/reid/reports/actions.ts
216:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
222:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/reid/reports/generator.ts
39:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
86:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
123:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
162:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
204:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
244:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/tasks/actions.ts
128:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/tasks/queries.ts
6:22  Warning: 'Priority' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/tasks/schemas.ts
3:10  Warning: 'createDateSchema' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/transactions/analytics/queries.ts
70:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/transactions/documents/actions.ts
11:15  Warning: 'UploadDocumentInput' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/transactions/documents/queries.ts
63:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/transactions/documents/schemas.ts
2:10  Warning: 'ALLOWED_MIME_TYPES' is defined but never used.  @typescript-eslint/no-unused-vars
2:30  Warning: 'MAX_FILE_SIZE' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/transactions/listings/actions.ts
268:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/transactions/listings/queries.ts
60:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
174:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
462:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/transactions/milestones/calculator.ts
76:9  Warning: 'totalSignatureRequests' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/modules/transactions/signatures/queries.ts
6:10  Warning: 'QuerySignatureRequestsSchema' is defined but never used.  @typescript-eslint/no-unused-vars
7:15  Warning: 'QuerySignatureRequestsInput' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/modules/transactions/workflows/actions.ts
63:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
158:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
316:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/modules/transactions/workflows/queries.ts
31:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/pdf/pdf-generator-legacy.ts
95:11  Warning: 'filename' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/pdf/professional-brochure.tsx
18:3  Warning: 'Smartphone' is defined but never used.  @typescript-eslint/no-unused-vars
129:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./lib/pdf-generator.ts
9:3  Warning: 'setPDFOpacity' is defined but never used.  @typescript-eslint/no-unused-vars
10:3  Warning: 'resetPDFOpacity' is defined but never used.  @typescript-eslint/no-unused-vars
105:11  Warning: 'filename' is assigned a value but never used.  @typescript-eslint/no-unused-vars
400:13  Warning: 'techWidth' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/performance/dashboard-cache.ts
16:10  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars
47:10  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars
62:10  Warning: 'organizationId' is defined but never used.  @typescript-eslint/no-unused-vars
95:34  Warning: 'metricId' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/performance/dynamic-imports.tsx
44:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
54:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
74:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
178:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/security/audit.ts
213:9  Warning: 'serverActionFiles' is assigned a value but never used.  @typescript-eslint/no-unused-vars
243:9  Warning: 'schemaFiles' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/services/rag-service.ts
118:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
261:5  Warning: 'conversationHistory' is defined but never used.  @typescript-eslint/no-unused-vars
261:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/storage/encryption/index.ts
6:7  Warning: 'AUTH_TAG_LENGTH' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/storage/supabase-storage.ts
391:11  Warning: 'path' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/storage/validation.ts
81:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
149:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
243:3  Warning: 'buffer' is defined but never used.  @typescript-eslint/no-unused-vars
244:3  Warning: 'expectedMimeType' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/supabase/server.ts
48:20  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
56:20  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/tools/registry/helpers.ts
311:57  Warning: 'depIndustry' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/tools/shared/crm-basic/index.ts
11:30  Warning: 'DEFAULT_CRM_SETTINGS' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/utils/parent-communication.ts
8:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
277:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
294:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
337:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
