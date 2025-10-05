import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getDealById, getStageTitle, getStageColor } from '@/lib/modules/crm/deals';
import { DealFormDialog } from '@/components/real-estate/crm/deals/deal-form-dialog';
import { DealActionsMenu } from '@/components/real-estate/crm/deals/deal-actions-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, DollarSign, TrendingUp, User, Mail, Phone, Building2 } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

interface DealDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  await requireAuth();
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crm/deals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Deal Details</h1>
      </div>

      <Suspense fallback={<DealDetailSkeleton />}>
        <DealDetailContent dealId={id} />
      </Suspense>
    </div>
  );
}

async function DealDetailContent({ dealId }: { dealId: string }) {
  const user = await getCurrentUser();
  const deal = await getDealById(dealId);

  if (!deal || !user) {
    notFound();
  }

  const organizationId = user.organization_members?.[0]?.organization_id || '';

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Deal Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{deal.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: `var(--${getStageColor(deal.stage)}-500)`,
                      color: `var(--${getStageColor(deal.stage)}-600)`,
                    }}
                  >
                    {getStageTitle(deal.stage)}
                  </Badge>
                  <Badge
                    variant={deal.status === 'WON' ? 'default' : deal.status === 'ACTIVE' ? 'outline' : 'destructive'}
                    className={deal.status === 'WON' ? 'bg-green-500 text-white' : ''}
                  >
                    {deal.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DealFormDialog mode="edit" deal={deal} organizationId={organizationId} />
                <DealActionsMenu dealId={deal.id} dealTitle={deal.title} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Deal Value</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(Number(deal.value))}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Probability</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{deal.probability}%</p>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {deal.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {deal.description}
                  </p>
                </div>
              </>
            )}

            {deal.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Internal Notes</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {deal.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact/Lead Association */}
        {(deal.contact || deal.lead) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Associated Contact</CardTitle>
            </CardHeader>
            <CardContent>
              {deal.contact ? (
                <div className="space-y-2">
                  <Link href={`/crm/contacts/${deal.contact.id}`} className="font-medium text-primary hover:underline">
                    {deal.contact.name}
                  </Link>
                  {deal.contact.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${deal.contact.email}`} className="hover:underline">
                        {deal.contact.email}
                      </a>
                    </div>
                  )}
                  {deal.contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${deal.contact.phone}`} className="hover:underline">
                        {deal.contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              ) : deal.lead ? (
                <div className="space-y-2">
                  <Link href={`/crm/leads/${deal.lead.id}`} className="font-medium text-primary hover:underline">
                    {deal.lead.name}
                  </Link>
                  <Badge variant="outline">{deal.lead.status}</Badge>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.assigned_to && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <p className="text-sm">{deal.assigned_to.name}</p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <p className="text-sm">{formatRelativeTime(deal.created_at)}</p>
              </div>
            </div>

            {deal.expected_close_date && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Expected Close</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm">
                    {new Date(deal.expected_close_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {deal.actual_close_date && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Actual Close</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm">
                    {new Date(deal.actual_close_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {deal.listing && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Property</p>
                <Link href={`/crm/listings/${deal.listing.id}`} className="text-sm text-primary hover:underline flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {deal.listing.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {deal.listing.address}, {deal.listing.city}, {deal.listing.state}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lost Reason */}
        {deal.status === 'LOST' && deal.lost_reason && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lost Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{deal.lost_reason}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function DealDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-24 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
