import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, User, Building2, Target } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizations, getOrganizationMembers } from '@/lib/modules/organization/queries';
import { getProjectById, calculateProjectProgress } from '@/lib/modules/projects/queries';
import { getTasks } from '@/lib/modules/tasks/queries';
import { EditProjectDialog } from '@/components/features/projects/edit-project-dialog';
import { DeleteProjectDialog } from '@/components/features/projects/delete-project-dialog';
import { TaskList } from '@/components/features/tasks/task-list';
import { CreateTaskDialog } from '@/components/features/tasks/create-task-dialog';
import { TaskAttachments } from '@/components/features/tasks/task-attachments';
import { ActivityTimeline } from '@/components/features/shared/activity-timeline';
import { getAttachments } from '@/lib/modules/attachments';

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const userOrgs = await getUserOrganizations(user.id);
  const currentOrg = userOrgs[0];

  if (!currentOrg) {
    return notFound();
  }

  const [project, tasks, orgMembers, attachmentsResult] = await Promise.all([
    getProjectById(params.projectId, currentOrg.organizationId),
    getTasks(params.projectId),
    getOrganizationMembers(currentOrg.organizationId),
    getAttachments({ entityType: 'project', entityId: params.projectId }),
  ]);

  const attachments = attachmentsResult.success ? attachmentsResult.data : [];

  if (!project) {
    return notFound();
  }

  // Map organization members to team members format
  const teamMembers = orgMembers.map((member: any) => ({
    id: member.user.id,
    name: member.user.name || member.user.email,
  }));

  // Calculate progress
  const progress = calculateProjectProgress(project.tasks);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-700 border-green-300';
      case 'PLANNING':
        return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'ON_HOLD':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-300';
      case 'COMPLETED':
        return 'bg-gray-500/10 text-gray-700 border-gray-300';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-700 border-red-300';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-500/10 text-gray-700 border-gray-300';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-300';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-700 border-orange-300';
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-700 border-red-300';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: any) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">Project Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EditProjectDialog
            project={{
              ...project,
              budget: project.budget ? Number(project.budget) : null,
            }}
          />
          <DeleteProjectDialog projectId={project.id} projectName={project.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Details about this project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              {project.description && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              )}

              <Separator />

              {/* Customer */}
              {project.customer && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Customer</p>
                    <Link
                      href={`/crm/${project.customer.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {project.customer.name}
                    </Link>
                  </div>
                </div>
              )}

              {/* Project Manager */}
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center gap-2 flex-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={project.projectManager.avatarUrl || undefined} />
                    <AvatarFallback>
                      {project.projectManager.name?.[0]?.toUpperCase() ||
                        project.projectManager.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Project Manager</p>
                    <p className="text-sm text-muted-foreground">
                      {project.projectManager.name || project.projectManager.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-sm text-muted-foreground">{progress}%</p>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Tasks Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>
                    {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''} in this project
                  </CardDescription>
                </div>
                <CreateTaskDialog projectId={project.id} teamMembers={teamMembers} />
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <TaskList
                  tasks={tasks.map((task: any) => ({
                    ...task,
                    estimatedHours: task.estimatedHours ? Number(task.estimatedHours) : null,
                  }))}
                  projectId={project.id}
                  teamMembers={teamMembers}
                  groupByStatus={true}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks yet</p>
                  <p className="text-sm">Create your first task to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Attachments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Project Attachments</CardTitle>
              <CardDescription>Files and documents related to this project</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskAttachments
                taskId={project.id}
                projectId={project.id}
                initialAttachments={attachments.map((att: any) => ({
                  id: att.id,
                  fileName: att.fileName,
                  fileSize: att.fileSize,
                  mimeType: att.mimeType,
                  createdAt: att.createdAt,
                  uploadedBy: {
                    id: att.uploadedBy.id,
                    name: att.uploadedBy.name,
                    email: att.uploadedBy.email,
                  },
                }))}
              />
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent activity for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline
                organizationId={currentOrg.organizationId}
                resourceType="project"
                resourceId={project.id}
                limit={25}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <Badge variant="outline" className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Priority</p>
                <Badge variant="outline" className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Dates & Budget */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(project.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(project.dueDate)}</p>
                </div>
              </div>

              {project.completionDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(project.completionDate)}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Budget</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(project.budget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{formatDate(project.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}