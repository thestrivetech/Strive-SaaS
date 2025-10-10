/**
 * Project & Task Test Fixtures
 * Predefined project and task data for consistent testing
 */

import { TaskStatus, TaskPriority, LoopStatus } from '@prisma/client';

export const testProjects = {
  activeProject: {
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    status: LoopStatus.ACTIVE,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    budget: 50000,
  },

  plannedProject: {
    name: 'Mobile App Development',
    description: 'Build iOS and Android apps',
    status: LoopStatus.PENDING,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-12-31'),
    budget: 100000,
  },

  completedProject: {
    name: 'Marketing Campaign',
    description: 'Q1 2024 marketing campaign',
    status: LoopStatus.CLOSED,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    budget: 25000,
  },

  onHoldProject: {
    name: 'Legacy System Migration',
    description: 'Migrate from old system to new platform',
    status: LoopStatus.PENDING,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-31'),
    budget: 75000,
  },
};

export const testTasks = {
  todoTask: {
    title: 'Design Homepage Mockup',
    description: 'Create high-fidelity mockup for new homepage',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    estimatedHours: 8,
    tags: ['design', 'homepage'],
  },

  inProgressTask: {
    title: 'Implement User Authentication',
    description: 'Add login and signup functionality',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    estimatedHours: 16,
    tags: ['backend', 'auth'],
  },

  doneTask: {
    title: 'Setup Development Environment',
    description: 'Configure local development setup',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    estimatedHours: 4,
    actualHours: 3,
    completedAt: new Date(),
    tags: ['setup'],
  },

  lowPriorityTask: {
    title: 'Update Documentation',
    description: 'Update API documentation',
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    estimatedHours: 2,
    tags: ['docs'],
  },

  urgentTask: {
    title: 'Fix Production Bug',
    description: 'Critical bug affecting users',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.URGENT,
    estimatedHours: 4,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    tags: ['bug', 'urgent'],
  },
};

export const taskStatusTransitions = {
  valid: [
    { from: TaskStatus.TODO, to: TaskStatus.IN_PROGRESS },
    { from: TaskStatus.IN_PROGRESS, to: TaskStatus.COMPLETED },
    { from: TaskStatus.IN_PROGRESS, to: TaskStatus.TODO }, // Back to todo
    { from: TaskStatus.COMPLETED, to: TaskStatus.IN_PROGRESS }, // Reopen
  ],
  // Add custom validation logic if needed
};
