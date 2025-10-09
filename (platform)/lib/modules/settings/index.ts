// Profile actions
export {
  updateProfile,
  uploadAvatar,
  updatePreferences,
  updateNotificationPreferences,
} from './profile/actions';

// Organization actions
export {
  updateOrganization,
  inviteTeamMember,
  updateMemberRole,
  removeMember,
} from './organization/actions';

// Billing actions
export {
  updatePlan,
  addPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
  downloadInvoice,
  cancelSubscription,
} from './billing/actions';

// Security actions
export {
  changePassword,
  enable2FA,
  disable2FA,
  revokeSession,
  revokeAllSessions,
} from './security/actions';

// Profile queries
export {
  getUserProfile,
  getUserPreferences,
  getNotificationPreferences,
} from './profile/queries';

// Organization queries
export {
  getOrganization,
  getOrganizationMembers,
  getOrganizationStats,
} from './organization/queries';

// Billing queries
export {
  getSubscription,
  getPaymentMethods,
  getInvoices,
} from './billing/queries';

// Security queries
export {
  getActiveSessions,
  getSecurityLog,
  get2FAStatus,
} from './security/queries';

// Profile schemas
export type {
  UpdateProfileInput,
  UpdatePreferencesInput,
  UpdateNotificationPreferencesInput,
} from './profile/schemas';

// Organization schemas
export type {
  UpdateOrganizationInput,
  InviteTeamMemberInput,
  UpdateMemberRoleInput,
  RemoveMemberInput,
} from './organization/schemas';

// Billing schemas
export type {
  SubscriptionTier,
  UpdatePlanInput,
  AddPaymentMethodInput,
  UpdatePaymentMethodInput,
  RemovePaymentMethodInput,
  DownloadInvoiceInput,
} from './billing/schemas';

// Security schemas
export type {
  ChangePasswordInput,
  Enable2FAInput,
  Disable2FAInput,
  RevokeSessionInput,
} from './security/schemas';
