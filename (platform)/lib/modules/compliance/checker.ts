import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { ComplianceAlert, ComplianceAlertType, AlertSeverity } from './alerts';

/**
 * Compliance Checker Module
 *
 * Automated compliance checking for transaction loops
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 *
 * @module compliance/checker
 */

/**
 * Check compliance for a single loop
 *
 * @param loopId - Transaction loop ID
 * @returns Array of compliance alerts
 */
export async function checkLoopCompliance(loopId: string): Promise<ComplianceAlert[]> {
  return withTenantContext(async () => {
    try {
      const loop = await prisma.transaction_loops.findFirst({
        where: { id: loopId },
        include: {
          documents: true,
          parties: true,
          signatures: true,
          transaction_tasks: true,
        },
      });

      if (!loop) {
        throw new Error('Loop not found');
      }

      const alerts: ComplianceAlert[] = [];

      // Run all compliance checks
      alerts.push(...checkRequiredParties(loop));
      alerts.push(...checkRequiredDocuments(loop));
      alerts.push(...checkExpiredSignatures(loop));
      alerts.push(...checkOverdueTasks(loop));
      alerts.push(...checkMissingClosingDate(loop));
      alerts.push(...checkInactiveParties(loop));

      return alerts.filter(alert => alert !== null);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}

/**
 * Get organization-wide compliance alerts
 *
 * @returns Array of compliance alerts across all active loops
 */
export async function getOrganizationCompliance(): Promise<ComplianceAlert[]> {
  return withTenantContext(async () => {
    try {
      const loops = await prisma.transaction_loops.findMany({
        where: {
          status: { notIn: ['CLOSED', 'CANCELLED', 'ARCHIVED'] },
        },
      });

      const allAlerts = await Promise.all(
        loops.map((loop: { id: string }) => checkLoopCompliance(loop.id))
      );

      return allAlerts.flat();
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}

/**
 * Get compliance summary statistics
 *
 * @returns Compliance stats by severity
 */
export async function getComplianceStats(): Promise<{
  total: number;
  error: number;
  warning: number;
  info: number;
}> {
  return withTenantContext(async () => {
    try {
      const alerts = await getOrganizationCompliance();

      return {
        total: alerts.length,
        error: alerts.filter(a => a.severity === 'error').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length,
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}

/**
 * Check for required parties based on transaction type
 */
function checkRequiredParties(loop: any): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];
  const activeParties = loop.parties.filter((p: any) => p.status === 'ACTIVE');

  const requiredRoles: Record<string, string[]> = {
    PURCHASE_AGREEMENT: ['BUYER', 'SELLER', 'LISTING_AGENT', 'BUYER_AGENT'],
    LISTING_AGREEMENT: ['SELLER', 'LISTING_AGENT'],
    LEASE_AGREEMENT: ['BUYER', 'SELLER', 'LISTING_AGENT'], // Tenant, Landlord
    COMMERCIAL_PURCHASE: ['BUYER', 'SELLER', 'LISTING_AGENT', 'BUYER_AGENT'],
    COMMERCIAL_LEASE: ['BUYER', 'SELLER', 'LISTING_AGENT'],
  };

  const required = requiredRoles[loop.transaction_type] || [];

  required.forEach(role => {
    const hasRole = activeParties.some((p: any) => p.role === role);
    if (!hasRole) {
      alerts.push({
        id: `${loop.id}-missing-${role.toLowerCase()}`,
        severity: role.includes('AGENT') ? 'warning' : 'error',
        message: `Missing required party: ${formatRole(role)}`,
        loopId: loop.id,
        type: 'missing_party',
        details: { role },
      });
    }
  });

  return alerts;
}

/**
 * Check for required documents based on transaction type
 */
function checkRequiredDocuments(loop: any): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];
  const documents = loop.documents;

  const requiredCategories: Record<string, string[]> = {
    PURCHASE_AGREEMENT: ['contract', 'disclosure'],
    LISTING_AGREEMENT: ['contract', 'listing'],
    LEASE_AGREEMENT: ['contract', 'lease'],
    COMMERCIAL_PURCHASE: ['contract', 'disclosure'],
    COMMERCIAL_LEASE: ['contract', 'lease'],
  };

  const required = requiredCategories[loop.transaction_type] || ['contract'];

  required.forEach(category => {
    const hasCategory = documents.some((d: any) => d.category === category);
    if (!hasCategory) {
      alerts.push({
        id: `${loop.id}-missing-${category}`,
        severity: category === 'contract' ? 'error' : 'warning',
        message: `Missing required document: ${formatCategory(category)}`,
        loopId: loop.id,
        type: 'missing_document',
        details: { category },
      });
    }
  });

  return alerts;
}

/**
 * Check for expired signature requests
 */
function checkExpiredSignatures(loop: any): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];
  const now = new Date();

  loop.signatures.forEach((sig: any) => {
    if (sig.status === 'PENDING' && sig.expires_at && sig.expires_at < now) {
      alerts.push({
        id: `${sig.id}-expired`,
        severity: 'error',
        message: `Signature request expired: ${sig.title}`,
        loopId: loop.id,
        type: 'expired_signature',
        details: {
          signatureId: sig.id,
          title: sig.title,
          expiredAt: sig.expires_at,
        },
      });
    }
  });

  return alerts;
}

/**
 * Check for overdue tasks
 */
function checkOverdueTasks(loop: any): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];
  const now = new Date();

  const overdueTasks = loop.transaction_tasks.filter(
    (t: any) => t.due_date && t.due_date < now && t.status !== 'DONE'
  );

  if (overdueTasks.length > 0) {
    // Group by priority
    const urgentOverdue = overdueTasks.filter((t: any) => t.priority === 'URGENT');
    const highOverdue = overdueTasks.filter((t: any) => t.priority === 'HIGH');

    if (urgentOverdue.length > 0) {
      alerts.push({
        id: `${loop.id}-urgent-overdue`,
        severity: 'error',
        message: `${urgentOverdue.length} urgent overdue tasks`,
        loopId: loop.id,
        type: 'overdue_tasks',
        details: {
          count: urgentOverdue.length,
          priority: 'URGENT',
          tasks: urgentOverdue.map((t: any) => ({ id: t.id, title: t.title })),
        },
      });
    }

    if (highOverdue.length > 0) {
      alerts.push({
        id: `${loop.id}-high-overdue`,
        severity: 'warning',
        message: `${highOverdue.length} high priority overdue tasks`,
        loopId: loop.id,
        type: 'overdue_tasks',
        details: {
          count: highOverdue.length,
          priority: 'HIGH',
          tasks: highOverdue.map((t: any) => ({ id: t.id, title: t.title })),
        },
      });
    }

    if (overdueTasks.length > urgentOverdue.length + highOverdue.length) {
      const regularCount = overdueTasks.length - urgentOverdue.length - highOverdue.length;
      alerts.push({
        id: `${loop.id}-overdue`,
        severity: 'info',
        message: `${regularCount} overdue tasks`,
        loopId: loop.id,
        type: 'overdue_tasks',
        details: {
          count: regularCount,
          priority: 'NORMAL',
        },
      });
    }
  }

  return alerts;
}

/**
 * Check for missing expected closing date
 */
function checkMissingClosingDate(loop: any): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];

  if (loop.status === 'UNDER_CONTRACT' || loop.status === 'CLOSING') {
    if (!loop.expected_closing) {
      alerts.push({
        id: `${loop.id}-no-closing-date`,
        severity: 'warning',
        message: 'Missing expected closing date',
        loopId: loop.id,
        type: 'missing_data',
        details: { field: 'expected_closing' },
      });
    }
  }

  return alerts;
}

/**
 * Check for inactive parties in active loop
 */
function checkInactiveParties(loop: any): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];

  const inactiveParties = loop.parties.filter(
    (p: any) => p.status === 'INACTIVE' || p.status === 'REMOVED'
  );

  if (inactiveParties.length > 0 && loop.status === 'ACTIVE') {
    alerts.push({
      id: `${loop.id}-inactive-parties`,
      severity: 'info',
      message: `${inactiveParties.length} inactive parties in active transaction`,
      loopId: loop.id,
      type: 'inactive_party',
      details: {
        count: inactiveParties.length,
        parties: inactiveParties.map((p: any) => ({ id: p.id, name: p.name, status: p.status })),
      },
    });
  }

  return alerts;
}

/**
 * Format role for display
 */
function formatRole(role: string): string {
  const roleLabels: Record<string, string> = {
    BUYER: 'Buyer',
    SELLER: 'Seller',
    LISTING_AGENT: 'Listing Agent',
    BUYER_AGENT: 'Buyer Agent',
    TRANSACTION_COORDINATOR: 'Transaction Coordinator',
    ESCROW_OFFICER: 'Escrow Officer',
    LENDER: 'Lender',
    TITLE_COMPANY: 'Title Company',
    INSPECTOR: 'Inspector',
    APPRAISER: 'Appraiser',
    ATTORNEY: 'Attorney',
  };

  return roleLabels[role] || role;
}

/**
 * Format category for display
 */
function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
