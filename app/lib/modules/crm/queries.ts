import { prisma } from '@/lib/prisma';
import type { Customer, CustomerStatus, CustomerSource, Prisma } from '@prisma/client';
import type { CustomerFilters } from './schemas';

type CustomerWithAssignee = Prisma.CustomerGetPayload<{
  include: { assignedTo: { select: { id: true; name: true; email: true; avatarUrl: true } } };
}>;

export async function getCustomers(
  organizationId: string,
  filters?: CustomerFilters
): Promise<CustomerWithAssignee[]> {
  const where: any = { organizationId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.source) {
    where.source = filters.source;
  }

  if (filters?.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters?.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }

  return prisma.customer.findMany({
    where,
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
  });
}

export async function getCustomerById(
  customerId: string,
  organizationId: string
): Promise<Customer | null> {
  return prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      projects: {
        include: {
          projectManager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      appointments: {
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
      },
    },
  });
}

export async function getCustomerStats(organizationId: string) {
  const [totalCustomers, activeCustomers, leadCount, prospectCount] = await Promise.all([
    prisma.customer.count({ where: { organizationId } }),
    prisma.customer.count({
      where: { organizationId, status: 'ACTIVE' },
    }),
    prisma.customer.count({
      where: { organizationId, status: 'LEAD' },
    }),
    prisma.customer.count({
      where: { organizationId, status: 'PROSPECT' },
    }),
  ]);

  return {
    totalCustomers,
    activeCustomers,
    leadCount,
    prospectCount,
  };
}

export async function searchCustomers(
  organizationId: string,
  query: string,
  limit: number = 10
): Promise<Customer[]> {
  return prisma.customer.findMany({
    where: {
      organizationId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: { name: 'asc' },
  });
}