import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizations } from '@/lib/modules/organization/queries';
import { getCustomerById } from '@/lib/modules/crm/queries';
import { EditCustomerDialog } from '@/components/(platform)/real-estate/crm/edit-customer-dialog';
import { DeleteCustomerDialog } from '@/components/(platform)/real-estate/crm/delete-customer-dialog';
import { ActivityTimeline } from '@/components/(web)/features/shared/activity-timeline';

export default async function CustomerDetailPage({
  params,
}: {
  params: { customerId: string };
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

  const customer = await getCustomerById(params.customerId, currentOrg.organizationId);

  if (!customer) {
    return notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-700';
      case 'PROSPECT':
        return 'bg-blue-500/10 text-blue-700';
      case 'LEAD':
        return 'bg-yellow-500/10 text-yellow-700';
      case 'CHURNED':
        return 'bg-gray-500/10 text-gray-700';
      default:
        return 'bg-gray-500/10 text-gray-700';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/crm">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <p className="text-muted-foreground">Customer Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EditCustomerDialog customer={customer} />
          <DeleteCustomerDialog customerId={customer.id} customerName={customer.name} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Customer contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={customer.assignedTo?.avatarUrl || undefined} />
                  <AvatarFallback className="text-lg">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold">{customer.name}</p>
                  <Badge variant="outline" className={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${customer.email}`} className="text-sm font-medium hover:underline">
                        {customer.email}
                      </a>
                    </div>
                  </div>
                )}

                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a href={`tel:${customer.phone}`} className="text-sm font-medium hover:underline">
                        {customer.phone}
                      </a>
                    </div>
                  </div>
                )}

                {customer.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="text-sm font-medium">{customer.company}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned To</p>
                    <p className="text-sm font-medium">{customer.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Associated projects with this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {customer.projects && customer.projects.length > 0 ? (
                <div className="space-y-3">
                  {customer.projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Manager: {project.projectManager?.name || 'Unassigned'}
                        </p>
                      </div>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No projects associated with this customer.</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent activity for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline
                organizationId={currentOrg.organizationId}
                resourceType="customer"
                resourceId={customer.id}
                limit={25}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="text-sm font-medium capitalize">{customer.source.toLowerCase()}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{formatDate(customer.createdAt)}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{formatDate(customer.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.appointments && customer.appointments.length > 0 ? (
                <div className="space-y-3">
                  {customer.appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{appointment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(appointment.startTime)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No appointments scheduled.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}