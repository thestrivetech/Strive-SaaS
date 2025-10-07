import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizations } from '@/lib/modules/organization/queries';
import { getLeadById } from '@/lib/modules/crm/leads';
import { LeadScoreBadge } from '@/components/real-estate/crm/leads/lead-score-badge';
import { LeadFormDialog } from '@/components/real-estate/crm/leads/lead-form-dialog';
import { LeadActionsMenu } from '@/components/real-estate/crm/leads/lead-actions-menu';
import { LeadActivityTimeline } from '@/components/real-estate/crm/leads/lead-activity-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Phone, Building2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const userOrgs = await getUserOrganizations(user.id);
  const currentOrg = userOrgs[0];

  if (!currentOrg) {
    redirect('/onboarding/organization');
  }

  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/real-estate/crm/leads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Lead Details</h1>
        </div>
      </div>

      <Suspense fallback={<LeadDetailSkeleton />}>
        <LeadDetailContent leadId={id} organizationId={currentOrg.organization_id} />
      </Suspense>
    </div>
  );
}

async function LeadDetailContent({ leadId, organizationId }: { leadId: string; organizationId: string }) {
  const lead = await getLeadById(leadId);

  if (!lead) {
    notFound();
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Main Content - 2 columns */}
      <div className="md:col-span-2 space-y-6">
        {/* Lead Information */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{lead.name}</CardTitle>
                {lead.company && (
                  <p className="text-muted-foreground">{lead.company}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <LeadFormDialog
                  mode="edit"
                  lead={lead}
                  organizationId={organizationId}
                  trigger={<Button variant="outline">Edit</Button>}
                />
                <LeadActionsMenu lead={lead} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score and Status */}
            <div className="flex flex-wrap gap-3">
              <LeadScoreBadge score={lead.score} />
              <Badge variant="outline">{lead.status.replace(/_/g, ' ')}</Badge>
              <Badge variant="outline">{lead.source.replace(/_/g, ' ')}</Badge>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="grid gap-3">
                {lead.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-primary hover:underline"
                    >
                      {lead.email}
                    </a>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-primary hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.company && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.company}</span>
                  </div>
                )}
              </div>
            </div>

            {lead.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {lead.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <LeadActivityTimeline activities={lead.activities || []} />
      </div>

      {/* Sidebar - 1 column */}
      <div className="space-y-6">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Lead Score Value</p>
              <p className="font-medium">{lead.score_value}</p>
            </div>

            {lead.assigned_to && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Assigned To
                </p>
                <p className="font-medium">{lead.assigned_to.name}</p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Created
              </p>
              <p className="font-medium">
                {format(new Date(lead.created_at), 'MMM dd, yyyy')}
              </p>
            </div>

            {lead.last_contact_at && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Last Contact
                </p>
                <p className="font-medium">
                  {format(new Date(lead.last_contact_at), 'MMM dd, yyyy')}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Last Updated
              </p>
              <p className="font-medium">
                {format(new Date(lead.updated_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tags (if implemented) */}
        {lead.tags && lead.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Deals (if any) */}
        {lead.deals && lead.deals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lead.deals.map((deal) => (
                  <div key={deal.id} className="text-sm">
                    <Link
                      href={`/real-estate/crm/deals/${deal.id}`}
                      className="text-primary hover:underline"
                    >
                      {deal.title}
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function LeadDetailSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
