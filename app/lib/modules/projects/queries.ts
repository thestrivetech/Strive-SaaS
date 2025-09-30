import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { ProjectFilters } from './schemas';

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    customer: { select: { id: true; name: true; email: true } };
    projectManager: { select: { id: true; name: true; email: true; avatarUrl: true } };
    tasks: { select: { id: true; status: true } };
  };
}>;

export async function getProjects(
  organizationId: string,
  filters?: ProjectFilters
): Promise<ProjectWithRelations[]> {
  const where: any = { organizationId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.priority) {
    where.priority = filters.priority;
  }

  if (filters?.customerId) {
    where.customerId = filters.customerId;
  }

  if (filters?.projectManagerId) {
    where.projectManagerId = filters.projectManagerId;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.project.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      projectManager: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      tasks: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
  });
}

export async function getProjectById(
  projectId: string,
  organizationId: string
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      projectManager: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      tasks: {
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function getProjectStats(organizationId: string) {
  const [totalProjects, activeProjects, completedProjects, onHoldProjects] = await Promise.all([
    prisma.project.count({ where: { organizationId } }),
    prisma.project.count({
      where: { organizationId, status: 'ACTIVE' },
    }),
    prisma.project.count({
      where: { organizationId, status: 'COMPLETED' },
    }),
    prisma.project.count({
      where: { organizationId, status: 'ON_HOLD' },
    }),
  ]);

  // Calculate total budget
  const budgetResult = await prisma.project.aggregate({
    where: { organizationId },
    _sum: {
      budget: true,
    },
  });

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
    totalBudget: budgetResult._sum.budget || 0,
  };
}

export function calculateProjectProgress(tasks: { status: string }[]): number {
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter((task) => task.status === 'DONE').length;
  return Math.round((completedTasks / tasks.length) * 100);
}