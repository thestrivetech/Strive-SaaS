import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getOrganization } from '@/lib/modules/settings';
import { OrganizationForm } from '@/components/settings/organization-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function OrganizationPage() {
  const user = await getCurrentUser();

  if (!user || !user.organization_id) {
    redirect('/settings');
  }

  const organization = await getOrganization(user.organization_id);

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">
            Organization not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization information and team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Manage your organization information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationForm organization={organization} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Link href="/settings/team">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Manage Team Members
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground text-center">
              View and manage all team members in your organization
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
