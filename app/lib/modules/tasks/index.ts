// Public API for tasks module
export {
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
} from './actions';

export {
  getTasks,
  getTaskById,
  getTaskStats,
  getUserTasks,
} from './queries';

export {
  createTaskSchema,
  updateTaskSchema,
  taskFiltersSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskFilters,
} from './schemas';

export type { TaskWithAssignee, TaskWithDetails, TaskWithProject } from './queries';