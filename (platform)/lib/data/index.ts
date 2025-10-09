/**
 * Data Layer - Central Export
 *
 * Import all data providers from here
 *
 * @example
 * ```typescript
 * import { contactsProvider } from '@/lib/data';
 *
 * const contacts = await contactsProvider.findMany(orgId);
 * ```
 */

export { dataConfig, simulateDelay, maybeThrowError } from './config';

// CRM Providers
export { contactsProvider, leadsProvider, customersProvider } from './providers/crm-provider';

// CMS & Marketing Providers
export { contentProvider } from './providers/content-provider';
export { campaignsProvider } from './providers/campaigns-provider';

// Marketplace Providers
export {
  toolsProvider,
  bundlesProvider,
  purchasesProvider,
  reviewsProvider,
  cartProvider,
} from './providers/marketplace-provider';

// Analytics Providers
export { getOverviewKPIs, getSalesFunnelData, getAgentPerformance } from './providers/analytics-provider';

// Appointments Providers
export { getUpcomingAppointments } from './providers/appointments-provider';

// Activities Providers
export { getRecentActivities } from './providers/activities-provider';

// Workspace/Transactions Providers
export {
  loopsProvider,
  tasksProvider,
  documentsProvider,
  partiesProvider,
  signaturesProvider,
  listingsProvider,
  transactionActivityProvider,
  transactionAnalyticsProvider,
} from './providers/transactions-provider';

// Expense & Tax Providers
export {
  expensesProvider,
  categoriesProvider,
  taxProvider,
  receiptsProvider,
  reportsProvider,
} from './providers/expenses-provider';

export { expenseTaxReportsProvider } from './providers/expense-tax-reports-provider';

// REID Providers
export {
  marketDataProvider,
  trendsProvider,
  demographicsProvider,
  roiProvider,
  alertsProvider,
  schoolsProvider,
  reidReportsProvider,
  reidAnalyticsProvider,
} from './providers/reid-provider';

// AI Hub Providers
export {
  conversationsProvider,
  messagesProvider,
  automationsProvider,
  insightsProvider,
  contentGenerationProvider,
  aiUsageProvider,
  aiHubDashboardProvider,
} from './providers/ai-hub-provider';

// User Dashboard Providers
export {
  widgetsProvider,
  dashboardLayoutsProvider,
  quickActionsProvider,
} from './providers/dashboard-provider';

// Mock types (for TypeScript)
export type { MockContact, MockLead, MockCustomer } from './mocks/crm';
export type { MockContentItem, MockCampaign, MockEmailCampaign } from './mocks/content';
export type {
  MockTool,
  MockBundle,
  MockPurchase,
  MockReview,
  MockCart,
} from './mocks/marketplace';
export type {
  MockLoop,
  MockTask,
  MockDocument,
  MockParty,
  MockSignature,
  MockListing,
  MockTransactionActivity,
} from './mocks/transactions';
export type {
  MockExpense,
  MockExpenseCategory,
  MockTaxEstimate,
  MockReceipt,
  MockTaxReport,
} from './mocks/expenses';
export type {
  MockReportTemplate,
  MockGeneratedReport,
  ReportFormat,
} from './mocks/expense-tax-reports';
export type {
  MockMarketData,
  MockTrendPoint,
  MockDemographics,
  MockROISimulation,
  MockAlert,
  MockSchool,
  MockREIDReport,
} from './mocks/reid';
export type {
  MockConversation,
  MockMessage,
  MockAutomation,
  MockInsight,
  MockGeneratedContent,
  MockAIUsage,
} from './mocks/ai-hub';
export type {
  MockWidget,
  MockDashboardLayout,
  MockQuickAction,
} from './mocks/widgets';
