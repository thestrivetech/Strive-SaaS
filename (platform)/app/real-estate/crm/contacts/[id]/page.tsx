import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getContactWithFullHistory } from '@/lib/modules/crm/contacts';
import { getUserOrganizations } from '@/lib/modules/organization/queries';
import { ContactActionsMenu } from '@/components/real-estate/crm/contacts/contact-actions-menu';
import { ContactCommunications } from '@/components/real-estate/crm/contacts/contact-communications';
import { ContactFormDialog } from '@/components/real-estate/crm/contacts/contact-form-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar, Linkedin, Twitter, MessageCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { ContactType, ContactStatus } from '@/lib/modules/crm/contacts';

interface ContactDetailPageProps {
  params: {
    id: string;
  };
}

// Type badge variants
const typeVariants: Record<ContactType, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  PROSPECT: { label: 'Prospect', variant: 'outline' },
  CLIENT: { label: 'Client', variant: 'default' },
  PAST_CLIENT: { label: 'Past Client', variant: 'secondary' },
  PARTNER: { label: 'Partner', variant: 'secondary' },
  VENDOR: { label: 'Vendor', variant: 'secondary' },
};

// Status badge variants
const statusVariants: Record<ContactStatus, { label: string; variant: 'default' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: 'Active', variant: 'default' },
  INACTIVE: { label: 'Inactive', variant: 'outline' },
  DO_NOT_CONTACT: { label: 'Do Not Contact', variant: 'destructive' },
};

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
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

  return (
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <Link href="/real-estate/crm/contacts">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>
      </Link>

      <Suspense fallback={<ContactDetailSkeleton />}>
        <ContactDetail contactId={params.id} organizationId={currentOrg.organization_id} />
      </Suspense>
    </div>
  );
}

async function ContactDetail({ contactId, organizationId }: { contactId: string; organizationId: string }) {
  const contact = await getContactWithFullHistory(contactId);

  if (!contact) {
    notFound();
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const typeConfig = typeVariants[contact.type || 'PROSPECT'];
  const statusConfig = statusVariants[contact.status || 'ACTIVE'];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{getInitials(contact.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{contact.name}</h1>
                  {contact.position && contact.company && (
                    <p className="text-muted-foreground">
                      {contact.position} at {contact.company}
                    </p>
                  )}
                  {contact.position && !contact.company && (
                    <p className="text-muted-foreground">{contact.position}</p>
                  )}
                  {!contact.position && contact.company && (
                    <p className="text-muted-foreground">{contact.company}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <ContactFormDialog
                  mode="edit"
                  contact={contact}
                  organizationId={organizationId}
                  trigger={<Button variant="outline">Edit</Button>}
                />
                <ContactActionsMenu contact={contact} />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                  {contact.email}
                </a>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}

            {contact.company && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contact.company}</span>
              </div>
            )}

            {contact.preferred_contact_method && (
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Preferred: {contact.preferred_contact_method.charAt(0).toUpperCase() + contact.preferred_contact_method.slice(1)}
                </span>
              </div>
            )}

            {contact.linkedin_url && (
              <div className="flex items-center gap-3">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}

            {contact.twitter_url && (
              <div className="flex items-center gap-3">
                <Twitter className="h-4 w-4 text-muted-foreground" />
                <a
                  href={contact.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  Twitter Profile
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {contact.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Communication History */}
        {contact.activities && (
          <ContactCommunications activities={contact.activities} />
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.assigned_to && contact.assigned_to.name && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(contact.assigned_to.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{contact.assigned_to.name}</span>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm">
                {contact.created_at ? format(new Date(contact.created_at), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>

            {contact.last_contact_at && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Contact</p>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(contact.last_contact_at), { addSuffix: true })}
                </p>
              </div>
            )}

            {contact.tags && contact.tags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Deals */}
        {contact.deals && contact.deals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Related Deals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contact.deals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/real-estate/crm/deals/${deal.id}`}
                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium text-sm">{deal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    ${deal.value?.toString() || '0'} • {deal.stage}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ContactDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
