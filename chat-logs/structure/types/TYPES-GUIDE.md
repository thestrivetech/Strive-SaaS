# Comprehensive Type System Architecture #
## Organization Structure ##
typescript// lib/types/index.ts - Central export point

// Core System Types
export * from './system/organization';
export * from './system/user';
export * from './system/auth';
export * from './system/rbac';
export * from './system/tenant';
export * from './system/subscription';
export * from './system/billing';

// Tool System Types
export * from './tools/base';
export * from './tools/registry';
export * from './tools/lifecycle';
export * from './tools/config';

// Industry-Specific Types
export * from './industries/real-estate';
export * from './industries/healthcare';
export * from './industries/fintech';
export * from './industries/manufacturing';
export * from './industries/retail';
export * from './industries/education';
export * from './industries/legal';
export * from './industries/shared';

// Module Types
export * from './modules/crm';
export * from './modules/projects';
export * from './modules/communications';
export * from './modules/documents';
export * from './modules/analytics';
export * from './modules/ai';

// Integration Types
export * from './integrations/n8n';
export * from './integrations/stripe';
export * from './integrations/openai';
export * from './integrations/supabase';
export * from './integrations/external-apis';

// Common/Shared Types
export * from './common/pagination';
export * from './common/filters';
export * from './common/responses';
export * from './common/errors';
export * from './common/metadata';

# 1. Core System Types #
lib/types/system/organization.ts
typescript// Organization and Multi-tenancy Types

export type OrganizationStatus = 'active' | 'suspended' | 'trial' | 'churned';
/**
 * Subscription tiers (5 levels)
 * IMPORTANT: All pricing and features are PLACEHOLDERS (TBD)
 */
export type OrganizationTier = 'STARTER' | 'GROWTH' | 'ELITE' | 'CUSTOM' | 'ENTERPRISE';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  
  // Status
  status: OrganizationStatus;
  tier: OrganizationTier;
  
  // Subscription
  subscriptionId?: string;
  trialEndsAt?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  
  // Industry
  industry: Industry;
  subIndustry?: string;
  
  // Limits
  limits: OrganizationLimits;
  usage: OrganizationUsage;
  
  // Settings
  settings: OrganizationSettings;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Organization limits based on subscription tier
 * IMPORTANT: All limits are PLACEHOLDERS (TBD)
 */
export interface OrganizationLimits {
  maxUsers: number;                // PLACEHOLDER - TBD
  maxStorageGB: number;            // PLACEHOLDER - TBD
  maxApiCallsPerMonth: number;     // PLACEHOLDER - TBD
  maxToolsEnabled: number;         // PLACEHOLDER - TBD (marketplace tools only)
  maxCustomFields: number;         // PLACEHOLDER - TBD
  maxAutomationRuns: number;       // PLACEHOLDER - TBD
}

export interface OrganizationUsage {
  currentUsers: number;
  storageUsedGB: number;
  apiCallsThisMonth: number;
  toolsEnabled: number;
  automationRunsThisMonth: number;
}

export interface OrganizationSettings {
  // Branding
  logo?: string;
  primaryColor?: string;
  timezone: string;
  dateFormat: string;
  
  // Features
  enabledFeatures: string[];
  featureFlags: Record<string, boolean>;
  
  // Notifications
  notificationPreferences: NotificationPreferences;
  
  // Security
  requireMFA: boolean;
  allowedDomains?: string[];
  sessionTimeoutMinutes: number;
  
  // Integration
  customWebhookUrl?: string;
  apiRateLimitOverride?: number;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  slack?: string; // Webhook URL
  discord?: string;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

# lib/types/system/user.ts #
typescript// User and Profile Types

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'guest';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  
  // Profile
  profile: UserProfile;
  
  // Status
  status: UserStatus;
  lastLoginAt?: Date;
  
  // Security
  mfaEnabled: boolean;
  mfaSecret?: string;
  
  // Preferences
  preferences: UserPreferences;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  
  // Professional
  title?: string;
  department?: string;
  bio?: string;
  linkedIn?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  
  // Dashboard
  defaultDashboard?: string;
  dashboardLayout?: Record<string, any>;
  
  // Productivity
  workingHours?: WorkingHours;
  focusMode?: boolean;
}

export interface WorkingHours {
  timezone: string;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  enabled: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  breaks?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  permissions: string[];
  
  // Status
  isActive: boolean;
  joinedAt: Date;
  leftAt?: Date;
  
  // Metadata
  invitedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

# lib/types/system/auth.ts #
typescript// Authentication and Session Types

export interface AuthSession {
  id: string;
  userId: string;
  organizationId?: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuthContext {
  user: User;
  organization?: Organization;
  member?: OrganizationMember;
  permissions: Permission[];
  session: AuthSession;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
  organizationSlug?: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  industry?: Industry;
}

export interface PasswordResetRequest {
  email: string;
  token?: string;
  newPassword?: string;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

# lib/types/system/rbac.ts #
typescript// Role-Based Access Control Types

export type ResourceType = 
  | 'organization'
  | 'user'
  | 'tool'
  | 'module'
  | 'document'
  | 'project'
  | 'contact'
  | 'deal'
  | 'property'
  | 'report'
  | 'settings';

export type Action = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'execute'
  | 'export'
  | 'share';

export interface Permission {
  id: string;
  resource: ResourceType;
  action: Action;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'in' | 'notIn' | 'contains';
  value: any;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  organizationId: string;
  scope?: RoleScope;
  assignedAt: Date;
  assignedBy: string;
}

export interface RoleScope {
  type: 'organization' | 'project' | 'team' | 'custom';
  resourceId?: string;
}

# lib/types/system/subscription.ts #
typescript// Subscription and Billing Types

export type SubscriptionStatus = 
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | 'incomplete';

export type BillingInterval = 'monthly' | 'annual';

/**
 * Subscription details
 * IMPORTANT: All pricing and tier allocations are PLACEHOLDERS (TBD)
 */
export interface Subscription {
  id: string;
  organizationId: string;

  // Stripe
  stripeSubscriptionId: string;
  stripeCustomerId: string;

  // Plan
  tier: OrganizationTier;        // PLACEHOLDER - TBD
  interval: BillingInterval;
  amount: number; // in cents - PLACEHOLDER - TBD
  currency: string;
  
  // Status
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  
  // Trial
  trialStart?: Date;
  trialEnd?: Date;
  
  // Add-ons
  enabledTools: string[];
  toolAddons: ToolAddon[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tool addon pricing
 * IMPORTANT: All pricing values are PLACEHOLDERS (TBD)
 */
export interface ToolAddon {
  toolId: string;
  quantity: number;
  pricePerUnit: number;  // PLACEHOLDER - TBD
  totalPrice: number;    // PLACEHOLDER - TBD
}

export interface Invoice {
  id: string;
  organizationId: string;
  subscriptionId: string;
  
  // Stripe
  stripeInvoiceId: string;
  
  // Details
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  
  // Line items
  lineItems: InvoiceLineItem[];
  
  // Dates
  dueDate?: Date;
  paidAt?: Date;
  periodStart: Date;
  periodEnd: Date;
  
  // Files
  invoicePdfUrl?: string;
  
  createdAt: Date;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  toolId?: string;
}

export interface UsageRecord {
  id: string;
  organizationId: string;
  subscriptionId: string;
  
  // Usage
  resourceType: string;
  quantity: number;
  unit: string;
  
  // Period
  periodStart: Date;
  periodEnd: Date;
  
  // Metadata
  metadata?: Record<string, any>;
  recordedAt: Date;
}

# 2. Tool System Types #

/**
 * CRITICAL DISTINCTION - MODULES vs TOOLS
 *
 * MODULES = Core platform dashboards/pages (lib/modules/)
 *   - CRM Dashboard, Projects, AI, Tasks, Chatbot
 *   - Part of base platform functionality
 *   - NOT sold separately
 *   - Always included based on subscription tier
 *   - Examples: lib/modules/crm/, lib/modules/projects/
 *
 * TOOLS = Marketplace add-on utilities (lib/tools/)
 *   - ROI Calculator, Invoice Generator, Property Alerts
 *   - Can be purchased/enabled separately
 *   - May integrate INTO modules or work standalone
 *   - Industry-specific or general purpose
 *   - Examples: lib/tools/shared/roi-calculator/
 */

lib/types/tools/base.ts
typescript// Base Tool Types (already defined but expanded)

export type Industry =
  | 'shared'
  | 'real-estate'
  | 'healthcare'
  | 'fintech'
  | 'manufacturing'
  | 'retail'
  | 'education'
  | 'legal'
  | 'hospitality'
  | 'logistics'
  | 'construction';

export type ToolCategory = 
  | 'lead-management'
  | 'communication'
  | 'automation'
  | 'analytics'
  | 'financial'
  | 'marketing'
  | 'document-management'
  | 'compliance'
  | 'operations'
  | 'customer-service'
  | 'scheduling'
  | 'reporting'
  | 'integration';

/**
 * Subscription tiers (5 levels)
 * IMPORTANT: All pricing and features are PLACEHOLDERS (TBD)
 */
export type ToolTier = 'STARTER' | 'GROWTH' | 'ELITE' | 'CUSTOM' | 'ENTERPRISE';

/**
 * Tool scope - distinguishes platform modules from marketplace tools
 */
export type ToolScope =
  | 'module'        // Core platform module (lib/modules/) - always included
  | 'tool'          // Marketplace tool (lib/tools/) - purchasable add-on
  | 'integration';  // Tool that integrates into a module

/**
 * How the tool is implemented/deployed
 */
export type ToolImplementation =
  | 'platform-module' // Core platform module in lib/modules/ (always available per tier)
  | 'nextjs'          // Built into Next.js app (marketplace tool)
  | 'n8n'             // n8n workflow automation (marketplace tool)
  | 'hybrid'          // Combination of Next.js + n8n (marketplace tool)
  | 'external';       // Third-party integration (marketplace tool)

export type ToolStatus = 'active' | 'beta' | 'deprecated' | 'maintenance';

export interface Tool {
  metadata: ToolMetadata;
  actions?: ToolActions;
  queries?: ToolQueries;
  hooks?: ToolHooks;
  healthCheck?: HealthCheckFunction;
}

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: string;
  industry: Industry;

  // ⭐ CRITICAL: Scope designation
  scope: ToolScope;  // 'module' | 'tool' | 'integration'

  category: ToolCategory;
  tier: ToolTier;  // PLACEHOLDER - TBD
  implementation: ToolImplementation;

  basePrice: number;  // PLACEHOLDER - TBD
  setupFee?: number;  // PLACEHOLDER - TBD
  usageBasedPricing?: UsageBasedPricing;  // PLACEHOLDER - TBD

  // ⭐ NEW: Which tiers include this for free
  includedInTiers?: ToolTier[];  // PLACEHOLDER - TBD
  
  version: string;
  dependencies?: ToolDependency[];
  apiEndpoints?: string[];
  n8nWorkflows?: string[];
  
  configurableSettings?: ToolSetting[];
  requiresSetup: boolean;
  setupSteps?: SetupStep[];
  
  status: ToolStatus;
  releasedAt: Date;
  updatedAt: Date;
  
  // Documentation
  docsUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
  
  // Marketing
  features: string[];
  benefits: string[];
  screenshots?: string[];
  testimonials?: Testimonial[];
}

/**
 * Usage-based pricing for tools
 * IMPORTANT: All pricing values are PLACEHOLDERS (TBD)
 */
export interface UsageBasedPricing {
  unit: string; // 'api_call', 'document', 'report', etc.
  pricePerUnit: number;        // PLACEHOLDER - TBD
  includedUnits: number;       // PLACEHOLDER - TBD
  overage Pricing: number;     // PLACEHOLDER - TBD
}

export interface ToolDependency {
  toolId: string;
  required: boolean;
  reason?: string;
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  type: 'api_key' | 'oauth' | 'webhook' | 'configuration' | 'verification';
  required: boolean;
  estimatedMinutes: number;
}

export interface Testimonial {
  author: string;
  company: string;
  quote: string;
  rating: number;
}

export type ToolActions = Record<string, (...args: any[]) => Promise<any>>;
export type ToolQueries = Record<string, (...args: any[]) => Promise<any>>;

export interface ToolHooks {
  onEnable?: (organizationId: string) => Promise<void>;
  onDisable?: (organizationId: string) => Promise<void>;
  onConfigure?: (organizationId: string, settings: Record<string, any>) => Promise<void>;
  onUpdate?: (organizationId: string, oldVersion: string, newVersion: string) => Promise<void>;
}

export type HealthCheckFunction = () => Promise<HealthCheckResult>;

export interface HealthCheckResult {
  healthy: boolean;
  message?: string;
  checks?: HealthCheck[];
  lastChecked: Date;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  responseTime?: number;
}

# lib/types/tools/config.ts #
typescript// Tool Configuration Types

export interface OrganizationToolConfig {
  id: string;
  organizationId: string;
  toolId: string;
  
  enabled: boolean;
  settings: Record<string, any>;
  secrets: Record<string, string>; // Encrypted
  
  enabledAt?: Date;
  disabledAt?: Date;
  configuredAt?: Date;
  lastUsedAt?: Date;
  
  usage: ToolUsageStats;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolSetting {
  key: string;
  label: string;
  description?: string;
  type: ToolSettingType;
  defaultValue: any;
  required: boolean;
  validation?: ToolSettingValidation;
  options?: ToolSettingOption[];
  dependsOn?: ToolSettingDependency;
  group?: string;
}

export type ToolSettingType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'url'
  | 'email'
  | 'phone'
  | 'json'
  | 'secret'
  | 'color'
  | 'date';

export interface ToolSettingValidation {
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
}

export interface ToolSettingOption {
  label: string;
  value: any;
  description?: string;
  disabled?: boolean;
}

export interface ToolSettingDependency {
  settingKey: string;
  condition: 'equals' | 'notEquals' | 'in' | 'notIn';
  value: any;
}

export interface ToolUsageStats {
  executionCount: number;
  lastExecutedAt?: Date;
  successRate: number;
  averageExecutionTime: number;
  totalCost: number;
  
  // Period stats
  thisMonth: PeriodStats;
  lastMonth: PeriodStats;
}

export interface PeriodStats {
  executions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalCost: number;
  averageExecutionTime: number;
}

# lib/types/tools/lifecycle.ts #
typescript// Tool Lifecycle and Event Types

export type ToolEventType =
  | 'tool.enabled'
  | 'tool.disabled'
  | 'tool.configured'
  | 'tool.executed'
  | 'tool.error'
  | 'tool.updated';

export interface ToolEvent {
  id: string;
  organizationId: string;
  toolId: string;
  type: ToolEventType;
  
  actor: EventActor;
  
  data: Record<string, any>;
  metadata?: Record<string, any>;
  
  timestamp: Date;
}

export interface EventActor {
  type: 'user' | 'system' | 'automation';
  id: string;
  name?: string;
}

export interface ToolUsageLog {
  id: string;
  organizationId: string;
  toolId: string;
  userId?: string;
  
  action: string;
  resourceType?: string;
  resourceId?: string;
  
  input?: Record<string, any>;
  output?: Record<string, any>;
  
  executionTime: number; // milliseconds
  success: boolean;
  errorMessage?: string;
  errorStack?: string;
  
  cost?: number;
  
  metadata?: Record<string, any>;
  
  createdAt: Date;
}

export interface ToolMigration {
  id: string;
  toolId: string;
  fromVersion: string;
  toVersion: string;
  
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  steps: MigrationStep[];
  
  startedAt?: Date;
  completedAt?: Date;
  
  error?: string;
}

export interface MigrationStep {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  order: number;
  
  completedAt?: Date;
  error?: string;
}

# 3. Industry-Specific Types #
lib/types/industries/real-estate.ts
typescript// Real Estate Industry Types

export type PropertyType = 
  | 'single-family'
  | 'multi-family'
  | 'condo'
  | 'townhouse'
  | 'land'
  | 'commercial'
  | 'industrial'
  | 'mixed-use';

export type PropertyStatus = 
  | 'active'
  | 'pending'
  | 'sold'
  | 'off-market'
  | 'coming-soon'
  | 'expired';

export type TransactionType = 'sale' | 'lease' | 'rental';

export interface Property {
  id: string;
  organizationId: string;
  
  // Basic Info
  mlsNumber?: string;
  address: Address;
  type: PropertyType;
  status: PropertyStatus;
  
  // Pricing
  listPrice: number;
  soldPrice?: number;
  pricePerSqFt?: number;
  
  // Details
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSizeAcres?: number;
  yearBuilt?: number;
  
  // Features
  features: string[];
  appliances: string[];
  parking?: ParkingInfo;
  
  // Media
  photos: PropertyPhoto[];
  virtualTourUrl?: string;
  videoUrl?: string;
  floorPlanUrl?: string;
  
  // Listing
  description?: string;
  listingAgent?: string;
  listDate?: Date;
  daysOnMarket?: number;
  
  // Financial
  taxes: PropertyTaxes;
  hoa?: HOAInfo;
  
  // Rental specific
  rentalInfo?: RentalInfo;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Coordinates
  latitude?: number;
  longitude?: number;
  
  // Parsed
  county?: string;
  neighborhood?: string;
  subdivision?: string;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  order: number;
  isPrimary: boolean;
}

export interface ParkingInfo {
  spaces: number;
  type: 'garage' | 'carport' | 'driveway' | 'street' | 'none';
  covered: boolean;
}

export interface PropertyTaxes {
  annualAmount: number;
  year: number;
  assessedValue?: number;
}

export interface HOAInfo {
  monthlyFee: number;
  name?: string;
  phone?: string;
  amenities?: string[];
}

export interface RentalInfo {
  monthlyRent: number;
  securityDeposit: number;
  leaseTermMonths: number;
  availableDate: Date;
  petsAllowed: boolean;
  utilitiesIncluded: string[];
}

export interface PropertyAlert {
  id: string;
  organizationId: string;
  customerId: string;
  
  name: string;
  criteria: PropertySearchCriteria;
  
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  channels: NotificationChannel[];
  
  isActive: boolean;
  
  lastMatchedAt?: Date;
  matchCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertySearchCriteria {
  // Location
  cities?: string[];
  states?: string[];
  zipCodes?: string[];
  radius?: number; // miles from coordinates
  coordinates?: { lat: number; lng: number };
  
  // Price
  minPrice?: number;
  maxPrice?: number;
  
  // Property
  propertyTypes?: PropertyType[];
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  
  // Features
  requiredFeatures?: string[];
  excludedFeatures?: string[];
  
  // Other
  maxDaysOnMarket?: number;
  keywords?: string[];
}

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

export interface Transaction {
  id: string;
  organizationId: string;
  propertyId: string;
  
  type: TransactionType;
  status: TransactionStatus;
  
  // Parties
  buyerId?: string;
  sellerId?: string;
  buyerAgentId?: string;
  sellerAgentId?: string;
  
  // Financial
  purchasePrice: number;
  commission: CommissionSplit;
  
  // Timeline
  contractDate?: Date;
  inspectionDate?: Date;
  appraisalDate?: Date;
  closingDate?: Date;
  
  // Documents
  documents: TransactionDocument[];
  
  // Milestones
  milestones: TransactionMilestone[];
  
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionStatus =
  | 'pre-contract'
  | 'under-contract'
  | 'inspection'
  | 'appraisal'
  | 'financing'
  | 'clear-to-close'
  | 'closed'
  | 'canceled';

export interface CommissionSplit {
  totalPercent: number;
  buyerAgentPercent: number;
  sellerAgentPercent: number;
  totalAmount: number;
}

export interface TransactionDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  required: boolean;
  signatureRequired: boolean;
  signedAt?: Date;
}

export interface TransactionMilestone {
  id: string;
  name: string;
  dueDate?: Date;
  completedDate?: Date;
  responsible: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  notes?: string;
}

export interface CMA {
  id: string;
  organizationId: string;
  propertyId: string;
  
  subjectProperty: Property;
  comparables: ComparableProperty[];
  
  estimatedValue: number;
  valueRange: { min: number; max: number };
  
  adjustments: CMAdjustment[];
  
  reportUrl?: string;
  
  createdBy: string;
  createdAt: Date;
}

export interface ComparableProperty extends Property {
  distance: number; // miles from subject
  adjustments: CMAdjustment[];
  adjustedPrice: number;
}

export interface CMAdjustment {
  factor: string;
  amount: number;
  reason: string;
}

# lib/types/industries/healthcare.ts # 
typescript// Healthcare Industry Types (HIPAA-compliant)

export type PatientStatus = 'active' | 'inactive' | 'deceased';

export interface Patient {
  id: string;
  organizationId: string;
  
  // Demographics (PHI - Protected Health Information)
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // Contact
  contact: PatientContact;
  
  // Medical
  medicalRecordNumber: string;
  bloodType?: string;
  allergies: Allergy[];
  medications: Medication[];
  conditions: MedicalCondition[];
  
  // Insurance
  insurance: InsuranceInfo[];
  
  // Status
  status: PatientStatus;
  
  // Emergency Contact
  emergencyContact?: EmergencyContact;
  
  // Consent
  hipaaConsentSigned: boolean;
  hipaaConsentDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientContact {
  phone: string;
  email?: string;
  address: Address;
  preferredContactMethod: 'phone' | 'email' | 'mail';
}

export interface Allergy {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction?: string;
  diagnosedDate?: Date;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface MedicalCondition {
  name: string;
  diagnosedDate: Date;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberRelationship: 'self' | 'spouse' | 'child' | 'other';
  effectiveDate: Date;
  expirationDate?: Date;
  isPrimary: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface Appointment {
  id: string;
  organizationId: string;
  patientId: string;
  providerId: string;
  
  // Schedule
  dateTime: Date;
  duration: number; // minutes
  type: AppointmentType;
  status: AppointmentStatus;
  
  // Details
  reason: string;
  notes?: string;
  
  // Location
  location: string;
  room?: string;
  isTelehealth: boolean;
  telehealthUrl?: string;
  
  // Billing
  copay?: number;
  
  // Reminders
  remindersSent: Date[];
  
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentType = 
  | 'new-patient'
  | 'follow-up'
  | 'annual'
  | 'sick-visit'
  | 'procedure'
  | 'consultation';

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'checked-in'
  | 'in-progress'
  | 'completed'
  | 'no-show'
  | 'canceled';

export interface ClinicalNote {
  id: string;
  organizationId: string;
  patientId: string;
  appointmentId?: string;
  
  providerId: string;
  
  type: 'soap' | 'progress' | 'discharge' | 'consultation';
  
  // SOAP format
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  
  // Vitals
  vitals?: VitalSigns;
  
  // Billing codes
  diagnosisCodes: string[]; // ICD-10
  procedureCodes: string[]; // CPT
  
  // Status
  isFinalized: boolean;
  finalizedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface VitalSigns {
  temperature?: number; // Fahrenheit
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number; // pounds
  height?: number; // inches
  bmi?: number;
}

export interface Prescription {
  id: string;
  organizationId: string;
  patientId: string;
  providerId: string;
  
  medication: string;
  dosage: string;
  frequency: string;
  quantity: number;
  refills: number;
  
  instructions: string;
  
  prescribedDate: Date;
  expirationDate: Date;
  
  pharmacyId?: string;
  
  status: 'active' | 'filled' | 'expired' | 'canceled';
  
  createdAt: Date;
}

export interface LabOrder {
  id: string;
  organizationId: string;
  patientId: string;
  providerId: string;
  
  testType: string;
  testCode: string; // LOINC code
  
  orderedDate: Date;
  collectedDate?: Date;
  resultDate?: Date;
  
  status: 'ordered' | 'collected' | 'in-progress' | 'resulted' | 'canceled';
  
  results?: LabResult[];
  
  priority: 'routine' | 'urgent' | 'stat';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LabResult {
  test: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  notes?: string;
}

# lib/types/industries/fintech.ts #
typescript// Financial Technology Types

export type AccountType = 
  | 'checking'
  | 'savings'
  | 'credit'
  | 'investment'
  | 'loan'
  | 'crypto';

export type TransactionCategory = 
  | 'income'
  | 'expense'
  | 'transfer'
  | 'payment'
  | 'refund';

export interface FinancialAccount {
  id: string;
  organizationId: string;
  customerId: string;
  
  // Account Details
  accountNumber: string;
  routingNumber?: string;
  type: AccountType;
  institutionName: string;
  institutionId?: string;
  
  // Balance
  currentBalance: number;
  availableBalance: number;
  currency: string;
  
  // Status
  isActive: boolean;
  isPrimary: boolean;
  
  // Linked
  plaidAccessToken?: string;
  lastSynced?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialTransaction {
  id: string;
  organizationId: string;
  accountId: string;
  
  // Transaction Details
  date: Date;
  amount: number;
  currency: string;
  description: string;
  merchantName?: string;
  
  // Categorization
  category: TransactionCategory;
  subcategory?: string;
  tags: string[];
  
  // Status
  status: 'pending' | 'posted' | 'cleared';
  
  // Enrichment
  isRecurring: boolean;
  confidence?: number; // AI categorization confidence
  
  // Metadata
  externalId?: string;
  plaidTransactionId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditScore {
  id: string;
  customerId: string;
  
  score: number;
  bureau: 'experian' | 'equifax' | 'transunion';
  scoreModel: string; // 'FICO 8', 'VantageScore 3.0', etc.
  
  factors: CreditFactor[];
  
  pulledDate: Date;
  nextUpdateDate?: Date;
}

export interface CreditFactor {
  code: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface KYCVerification {
  id: string;
  organizationId: string;
  customerId: string;
  
  // Identity
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  ssn?: string; // Last 4 or full (encrypted)
  address: Address;
  
  // Documents
  documents: IdentityDocument[];
  
  // Verification
  status: 'pending' | 'verified' | 'failed' | 'manual-review';
  verifiedAt?: Date;
  verificationMethod: string;
  
  // Risk Assessment
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  
  // Compliance
  amlCheckPassed: boolean;
  sanctionsCheckPassed: boolean;
  pepCheckPassed: boolean; // Politically Exposed Person
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IdentityDocument {
  id: string;
  type: 'drivers-license' | 'passport' | 'ssn-card' | 'utility-bill';
  frontImageUrl: string;
  backImageUrl?: string;
  extractedData?: Record<string, any>;
  verificationStatus: 'pending' | 'verified' | 'failed';
  uploadedAt: Date;
}

export interface FraudAlert {
  id: string;
  organizationId: string;
  customerId?: string;
  transactionId?: string;
  
  type: 'suspicious-activity' | 'unusual-location' | 'high-amount' | 'velocity' | 'device-fingerprint';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  description: string;
  indicators: FraudIndicator[];
  
  status: 'open' | 'investigating' | 'resolved' | 'false-positive';
  
  actionTaken?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  detectedAt: Date;
  createdAt: Date;
}

export interface FraudIndicator {
  type: string;
  value: string;
  confidence: number;
}

export interface Investment {
  id: string;
  organizationId: string;
  customerId: string;
  accountId: string;
  
  // Asset
  symbol: string;
  name: string;
  assetType: 'stock' | 'etf' | 'mutual-fund' | 'bond' | 'crypto' | 'other';
  
  // Holdings
  quantity: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
  
  // Performance
  totalReturn: number;
  totalReturnPercent: number;
  
  // Dates
  purchaseDate: Date;
  lastPriceUpdate: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  organizationId: string;
  customerId: string;
  
  name: string;
  period: 'monthly' | 'quarterly' | 'annual';
  
  categories: BudgetCategory[];
  
  startDate: Date;
  endDate: Date;
  
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

# 4. Module Types (CRM, Projects, etc.) #
lib/types/modules/crm.ts
typescript// CRM Module Types

export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'nurture';

export type LeadSource = 
  | 'website'
  | 'referral'
  | 'social-media'
  | 'advertising'
  | 'event'
  | 'cold-outreach'
  | 'partner'
  | 'other';

export interface Lead {
  id: string;
  organizationId: string;
  
  // Contact Info
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  
  // Lead Details
  source: LeadSource;
  status: LeadStatus;
  score: number;
  
  // Assignment
  assignedTo?: string;
  
  // Timeline
  lastContactedAt?: Date;
  convertedAt?: Date;
  
  // Tracking
  activities: Activity[];
  notes: Note[];
  tags: string[];
  
  // Custom Fields
  customFields: Record<string, any>;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  organizationId: string;
  
  // Personal Info
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  
  // Professional
  company?: string;
  title?: string;
  industry?: string;
  
  // Address
  address?: Address;
  
  // Social
  linkedIn?: string;
  twitter?: string;
  
  // Relationships
  accountId?: string;
  ownerId?: string;
  
  // Engagement
  lastContactedAt?: Date;
  lifetimeValue: number;
  
  // Tags & Custom
  tags: string[];
  customFields: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  organizationId: string;
  
  name: string;
  amount: number;
  currency: string;
  
  // Status
  stage: DealStage;
  probability: number; // 0-100
  
  // Relationships
  contactId: string;
  accountId?: string;
  ownerId: string;
  
  // Timeline
  expectedCloseDate: Date;
  closedDate?: Date;
  
  // Details
  description?: string;
  source: LeadSource;
  
  // Products/Services
  lineItems: DealLineItem[];
  
  // Loss reason (if lost)
  lossReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type DealStage = 
  | 'qualification'
  | 'needs-analysis'
  | 'proposal'
  | 'negotiation'
  | 'closed-won'
  | 'closed-lost';

export interface DealLineItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}

export type ActivityType = 
  | 'call'
  | 'email'
  | 'meeting'
  | 'task'
  | 'note';

export interface Activity {
  id: string;
  organizationId: string;
  
  type: ActivityType;
  subject: string;
  description?: string;
  
  // Relationships
  relatedTo: ActivityRelation[];
  
  // Ownership
  createdBy: string;
  assignedTo?: string;
  
  // Timing
  dueDate?: Date;
  completedAt?: Date;
  
  // Status
  isCompleted: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityRelation {
  type: 'lead' | 'contact' | 'deal' | 'account';
  id: string;
}

export interface Note {
  id: string;
  organizationId: string;
  
  content: string;
  isPinned: boolean;
  
  // Relationships
  relatedTo: ActivityRelation[];
  
  // Ownership
  createdBy: string;
  
  createdAt: Date;
  updatedAt: Date;
}

# lib/types/modules/projects.ts #
typescript// Project Management Module Types

export type ProjectStatus = 
  | 'planning'
  | 'active'
  | 'on-hold'
  | 'completed'
  | 'canceled';

export type TaskStatus = 
  | 'todo'
  | 'in-progress'
  | 'review'
  | 'done'
  | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  organizationId: string;
  
  name: string;
  description?: string;
  
  status: ProjectStatus;
  progress: number; // 0-100
  
  // Team
  ownerId: string;
  members: ProjectMember[];
  
  // Timeline
  startDate?: Date;
  endDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  
  // Budget
  budget?: number;
  actualCost?: number;
  
  // Organization
  boards: Board[];
  tags: string[];
  
  // Client
  clientId?: string;
  isBillable: boolean;
  
  // Settings
  settings: ProjectSettings;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface ProjectSettings {
  isPrivate: boolean;
  allowGuests: boolean;
  requireTaskApproval: boolean;
  timeTrackingEnabled: boolean;
  notifyOnTaskAssignment: boolean;
}

export interface Board {
  id: string;
  projectId: string;
  
  name: string;
  description?: string;
  
  type: 'kanban' | 'list' | 'timeline' | 'calendar';
  
  columns: BoardColumn[];
  
  isDefault: boolean;
  order: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardColumn {
  id: string;
  name: string;
  color?: string;
  order: number;
  taskLimit?: number;
  
  // Workflow
  isCompleted: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  boardId: string;
  columnId: string;
  
  title: string;
  description?: string;
  
  status: TaskStatus;
  priority: TaskPriority;
  
  // Assignment
  assigneeId?: string;
  reviewerId?: string;
  
  // Timeline
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  
  // Effort
  estimatedHours?: number;
  actualHours?: number;
  
  // Relationships
  parentTaskId?: string;
  subtasks: string[];
  dependencies: TaskDependency[];
  
  // Organization
  tags: string[];
  order: number;
  
  // Checklist
  checklist: ChecklistItem[];
  
  // Attachments
  attachments: Attachment[];
  
  // Comments
  commentCount: number;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDependency {
  taskId: string;
  type: 'blocks' | 'blocked-by';
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  order: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  
  content: string;
  
  authorId: string;
  
  // Threading
  parentCommentId?: string;
  
  // Mentions
  mentions: string[];
  
  // Reactions
  reactions: Reaction[];
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Reaction {
  emoji: string;
  userId: string;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  organizationId: string;
  projectId?: string;
  taskId?: string;
  
  userId: string;
  
  description?: string;
  
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  
  isBillable: boolean;
  hourlyRate?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

# 5. Common/Shared Types #
lib/types/common/pagination.ts
typescript// Pagination and List Types

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface CursorPaginationParams {
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

export interface InfiniteScrollParams {
  pageSize: number;
  cursor?: string;
}

# lib/types/common/filters.ts #
typescript// Filter and Search Types

export interface FilterOperator {
  equals?: any;
  notEquals?: any;
  in?: any[];
  notIn?: any[];
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  between?: [any, any];
  isNull?: boolean;
  isNotNull?: boolean;
}

export interface FilterCondition {
  field: string;
  operator: keyof FilterOperator;
  value: any;
}

export interface FilterGroup {
  conditions: (FilterCondition | FilterGroup)[];
  operator: 'AND' | 'OR';
}

export interface SearchParams {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

export interface QueryParams {
  filters?: FilterGroup;
  search?: SearchParams;
  sort?: SortOption[];
  pagination?: PaginationParams;
}

# lib/types/common/responses.ts #
typescript// API Response Types

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export interface BatchResponse<T> {
  success: boolean;
  results: BatchResult<T>[];
  successCount: number;
  errorCount: number;
}

export interface BatchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  index: number;
}

# lib/types/common/errors.ts #
typescript// Error Types

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'PAYMENT_REQUIRED'
  | 'TOO_MANY_REQUESTS';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}