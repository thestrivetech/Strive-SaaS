import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Plus,
  Calendar,
  FolderKanban,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizations, getOrganizationMembers } from '@/lib/modules/organization/queries';
import { getProjects, getProjectStats, calculateProjectProgress, getProjectsCount } from '@/lib/modules/projects/queries';
import { getCustomers } from '@/lib/modules/crm/queries';
import { CreateProjectDialog } from '@/components/(platform)/projects/create-project-dialog';
import { ProjectListSkeleton } from '@/components/(platform)/projects/project-list-skeleton';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { ProjectFilters } from '@/components/(platform)/projects/project-filters';
import ExportButton from '@/components/(platform)/features/export/export-button';
import { formatDateForCSV, type CSVColumn } from '@/lib/export/csv';
import type { ProjectStatus, Priority, projects } from '@prisma/client';
import type { ProjectFilters as ProjectFiltersType } from '@/lib/types/platform';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    limit?: string;
    status?: string;
    priority?: string;
    manager?: string;
    customer?: string;
    createdFrom?: string;
    createdTo?: string;
    dueFrom?: string;
    dueTo?: string;
  };
}) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const userOrgs = await getUserOrganizations(user.id);
  const currentOrg = userOrgs[0];

  if (!currentOrg) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Create an organization first to manage projects.
          </p>
        </div>
      </div>
    );
  }

  const currentPage = parseInt(searchParams.page || '1');
  const pageSize = parseInt(searchParams.limit || '25');

  return (
    <Suspense fallback={<ProjectListSkeleton />}>
      <ProjectListContent
        organizationId={currentOrg.organizationId}
        currentPage={currentPage}
        pageSize={pageSize}
        searchParams={searchParams}
      />
    </Suspense>
  );
}

async function ProjectListContent({
  organizationId,
  currentPage,
  pageSize,
  searchParams,
}: {
  organizationId: string;
  currentPage: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
}) {
  const filters: ProjectFiltersType = {
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  };

  // Add filter parameters
  if (searchParams.status) {
    filters.status = searchParams.status as ProjectStatus;
  }
  if (searchParams.priority) {
    filters.priority = searchParams.priority as Priority;
  }
  if (searchParams.manager && searchParams.manager !== '__none__') {
    filters.projectManagerId = searchParams.manager;
  }
  if (searchParams.customer && searchParams.customer !== '__none__') {
    filters.customerId = searchParams.customer;
  }
  if (searchParams.createdFrom) {
    filters.createdFrom = new Date(searchParams.createdFrom);
  }
  if (searchParams.createdTo) {
    filters.createdTo = new Date(searchParams.createdTo);
  }
  if (searchParams.dueFrom) {
    filters.dueFrom = new Date(searchParams.dueFrom);
  }
  if (searchParams.dueTo) {
    filters.dueTo = new Date(searchParams.dueTo);
  }

  const [projects, stats, customers, orgMembers, totalCount] = await Promise.all([
    getProjects(filters),
    getProjectStats(),
    getCustomers(),
    getOrganizationMembers(organizationId),
    getProjectsCount(filters),
  ]);

  // Map organization members to team members format
  const teamMembers = orgMembers.map((member) => ({
    id: member.user.id,
    name: member.user.name || member.user.email,
  }));

  // CSV Export columns
  const exportColumns: CSVColumn<projects>[] = [
    { key: 'name', label: 'Project Name' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'startDate', label: 'Start Date', format: (value) => formatDateForCSV(value as Date | string | null) },
    { key: 'endDate', label: 'End Date', format: (value) => formatDateForCSV(value as Date | string | null) },
    { key: 'budget', label: 'Budget' },
    { key: 'createdAt', label: 'Created Date', format: (value) => formatDateForCSV(value as Date | string | null) },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ACTIVE':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'PLANNING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'ON_HOLD':
        return <XCircle className="h-4 w-4 text-orange-600" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'LOW':
        return 'bg-green-500/10 text-green-700 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={projects}
            columns={exportColumns}
            filename="projects"
          />
          <ProjectFilters
            customers={customers.map((c) => ({ id: c.id, name: c.name }))}
            teamMembers={teamMembers}
          />
          <CreateProjectDialog
            organizationId={organizationId}
            customers={customers.map((c) => ({ id: c.id, name: c.name }))}
            teamMembers={teamMembers}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">All projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalBudget ? (Number(stats.totalBudget) / 1000).toFixed(0) + 'k' : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground">No projects yet.</p>
                <p className="text-sm text-muted-foreground">
                  Click &quot;New Project&quot; to create your first project.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => {
            const progress = calculateProjectProgress(project.tasks);

            return (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>
                        {project.customer?.name || 'No customer'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(project.status)}
                    <span className="text-sm capitalize">
                      {project.status.replace('_', ' ').toLowerCase()}
                    </span>
                    <Badge variant="outline" className={getPriorityColor(project.priority)}>
                      {project.priority.toLowerCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(project.dueDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FolderKanban className="h-3 w-3" />
                      {project.tasks.length} tasks
                    </div>
                  </div>

                  {project.projectManager && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {(project.projectManager.name || 'PM').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {project.projectManager.name || 'Project Manager'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {projects.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalItems={totalCount}
          itemsPerPage={pageSize}
        />
      )}
    </div>
  );
}