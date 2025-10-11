'use server';

import { prisma } from '@/lib/database/prisma';

export async function getFeaturedTemplates(limit = 6) {
  return await prisma.workflow_templates.findMany({
    where: {
      is_public: true,
      is_featured: true,
    },
    orderBy: {
      usage_count: 'desc',
    },
    take: limit,
  });
}

export async function getTemplatesByCategory(category: string) {
  return await prisma.workflow_templates.findMany({
    where: {
      is_public: true,
      category: category as any,
    },
    orderBy: {
      rating: 'desc',
    },
  });
}

export async function getTemplateStats() {
  const templates = await prisma.workflow_templates.findMany({
    where: { is_public: true },
  });

  const total = templates.length;
  const featured = templates.filter(t => t.is_featured).length;
  const avgRating = templates.length > 0
    ? templates.reduce((sum, t) => sum + (t.rating || 0), 0) / templates.length
    : 0;

  return {
    total,
    featured,
    avgRating,
  };
}
