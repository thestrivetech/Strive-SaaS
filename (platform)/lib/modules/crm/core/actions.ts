'use server';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase-server';
import { hasOrgPermission } from '@/lib/auth/org-rbac';
import { canAccessFeature } from '@/lib/auth/subscription';
import { canAccessCRM } from '@/lib/auth/rbac';
type CreateCustomerInput = any;
type UpdateCustomerInput = any;

/**
 * Create a new customer
 *
 * @param input - Customer data including name, email, phone, organization
 * @returns Created customer record
 * @throws {Error} If user lacks permissions, validation fails, or database error occurs
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (contacts:write permission)
 * - Verifies user has access to specified organization
 */
export async function createCustomer(input: CreateCustomerInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get user's Prisma data with subscription tier and roles
  const prismaUser = await prisma.users.findUnique({
    where: { id: user.id },
    include: {
      organization_members: {
        include: {
          organizations: true,
        },
      },
    },
  });

  if (!prismaUser) {
    throw new Error('User not found');
  }

  const validated = input;

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org) => org.organization_id === validated.organizationId);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(prismaUser.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(prismaUser.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to create customers');
  }

  // 3. Check OrganizationRole
  const orgMember = prismaUser.organization_members.find(
    (m) => m.organization_id === validated.organizationId
  );
  if (!orgMember || !hasOrgPermission(prismaUser.role, orgMember.role, 'contacts:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to create customers');
  }

  // Create customer with tenant context (RLS enforcement)
  return await withTenantContext(async () => {
    try {
      const customer = await prisma.customers.create({
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        company: validated.company || null,
        status: validated.status,
        source: validated.source,
        tags: validated.tags,
        custom_fields: validated.customFields as any,
        assigned_to: validated.assignedToId || null,
        organization_id: validated.organizationId,
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: validated.organizationId,
        user_id: user.id,
        action: 'created_customer',
        resource_type: 'customer',
        resource_id: customer.id,
        new_data: { name: customer.name, status: customer.status },
      },
    });

      revalidatePath('/crm');

      return customer;
    } catch (error) {
      console.error('[CRM:Core] createCustomer failed:', error);
      throw new Error(
        `[CRM:Core] Failed to create customer: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Update an existing customer
 *
 * @param input - Updated customer data with ID
 * @returns Updated customer record
 * @throws {Error} If customer not found, access denied, or update fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (contacts:write permission)
 * - Verifies customer belongs to user's accessible organizations
 */
export async function updateCustomer(input: UpdateCustomerInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get user's Prisma data with subscription tier and roles
  const prismaUser = await prisma.users.findUnique({
    where: { id: user.id },
    include: {
      organization_members: {
        include: {
          organizations: true,
        },
      },
    },
  });

  if (!prismaUser) {
    throw new Error('User not found');
  }

  const validated = input;

  // Get existing customer to check access
  const existingCustomer = await prisma.customers.findUnique({
    where: { id: validated.id },
  });

  if (!existingCustomer) {
    throw new Error('Customer not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org) => org.organization_id === existingCustomer.organization_id);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(prismaUser.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(prismaUser.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to update customers');
  }

  // 3. Check OrganizationRole
  const orgMember = prismaUser.organization_members.find(
    (m) => m.organization_id === existingCustomer.organization_id
  );
  if (!orgMember || !hasOrgPermission(prismaUser.role, orgMember.role, 'contacts:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to update customers');
  }

  // Update customer with tenant context (RLS enforcement)
  return await withTenantContext(async () => {
    try {
      const updatedCustomer = await prisma.customers.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        company: validated.company || null,
        status: validated.status,
        source: validated.source,
        tags: validated.tags,
        custom_fields: validated.customFields as any,
        assigned_to: validated.assignedToId || null,
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: existingCustomer.organization_id,
        user_id: user.id,
        action: 'updated_customer',
        resource_type: 'customer',
        resource_id: updatedCustomer.id,
        old_data: existingCustomer,
        new_data: updatedCustomer,
      },
    });

      revalidatePath('/crm');
      revalidatePath(`/crm/${validated.id}`);

      return updatedCustomer;
    } catch (error) {
      console.error('[CRM:Core] updateCustomer failed:', error);
      throw new Error(
        `[CRM:Core] Failed to update customer: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Delete a customer
 *
 * @param customerId - Customer ID to delete
 * @returns Success status object
 * @throws {Error} If customer not found, access denied, or deletion fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: ADMIN or OWNER (contacts:manage permission)
 * - Verifies customer belongs to user's accessible organizations
 */
export async function deleteCustomer(customerId: string) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get user's Prisma data with subscription tier and roles
  const prismaUser = await prisma.users.findUnique({
    where: { id: user.id },
    include: {
      organization_members: {
        include: {
          organizations: true,
        },
      },
    },
  });

  if (!prismaUser) {
    throw new Error('User not found');
  }

  // Get customer to check access
  const customer = await prisma.customers.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org) => org.organization_id === customer.organization_id);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(prismaUser.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(prismaUser.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to delete customers');
  }

  // 3. Check OrganizationRole (manage permission for delete)
  const orgMember = prismaUser.organization_members.find(
    (m) => m.organization_id === customer.organization_id
  );
  if (!orgMember || !hasOrgPermission(prismaUser.role, orgMember.role, 'contacts:manage')) {
    throw new Error('Unauthorized: Insufficient organization permissions to delete customers');
  }

  // Delete customer with tenant context (RLS enforcement)
  return await withTenantContext(async () => {
    try {
      await prisma.customers.delete({
      where: { id: customerId },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: customer.organization_id,
        user_id: user.id,
        action: 'deleted_customer',
        resource_type: 'customer',
        resource_id: customerId,
        old_data: customer,
      },
    });

      revalidatePath('/crm');

      return { success: true };
    } catch (error) {
      console.error('[CRM:Core] deleteCustomer failed:', error);
      throw new Error(
        `[CRM:Core] Failed to delete customer: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}