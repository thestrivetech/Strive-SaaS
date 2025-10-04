'use server';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClientWithAuth } from '@/lib/supabase-server';
import {
  createCustomerSchema,
  updateCustomerSchema,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from './schemas';
import { revalidatePath } from 'next/cache';
import { getUserOrganizations } from '../organization/queries';

export async function createCustomer(input: CreateCustomerInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = createCustomerSchema.parse(input);

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org) => org.organizationId === validated.organizationId);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Create customer
  const customer = await prisma.customers.create({
    data: {
      name: validated.name,
      email: validated.email || null,
      phone: validated.phone || null,
      company: validated.company || null,
      status: validated.status,
      source: validated.source,
      tags: validated.tags,
      customFields: validated.customFields as any,
      assignedToId: validated.assignedToId || null,
      organizationId: validated.organizationId,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: validated.organizationId,
      userId: user.id,
      action: 'created_customer',
      resourceType: 'customer',
      resourceId: customer.id,
      newData: { name: customer.name, status: customer.status },
    },
  });

  revalidatePath('/crm');

  return customer;
}

export async function updateCustomer(input: UpdateCustomerInput) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = updateCustomerSchema.parse(input);

  // Get existing customer to check access
  const existingCustomer = await prisma.customers.findUnique({
    where: { id: validated.id },
  });

  if (!existingCustomer) {
    throw new Error('Customer not found');
  }

  // Verify user has access to this organization
  const userOrgs = await getUserOrganizations(user.id);
  const hasAccess = userOrgs.some((org) => org.organizationId === existingCustomer.organizationId);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Update customer
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
      customFields: validated.customFields as any,
      assignedToId: validated.assignedToId || null,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: existingCustomer.organizationId,
      userId: user.id,
      action: 'updated_customer',
      resourceType: 'customer',
      resourceId: updatedCustomer.id,
      oldData: existingCustomer,
      newData: updatedCustomer,
    },
  });

  revalidatePath('/crm');
  revalidatePath(`/crm/${validated.id}`);

  return updatedCustomer;
}

export async function deleteCustomer(customerId: string) {
  const supabase = await createServerSupabaseClientWithAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
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
  const hasAccess = userOrgs.some((org) => org.organizationId === customer.organizationId);

  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }

  // Delete customer
  await prisma.customers.delete({
    where: { id: customerId },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: customer.organizationId,
      userId: user.id,
      action: 'deleted_customer',
      resourceType: 'customer',
      resourceId: customerId,
      oldData: customer,
    },
  });

  revalidatePath('/crm');

  return { success: true };
}