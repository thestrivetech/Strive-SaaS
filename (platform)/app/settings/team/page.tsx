import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getOrganizationMembers, getOrganizationStats, getOrganization } from '@/lib/modules/settings';
import { RoleBadge } from '@/components/settings/role-badge';
import { TeamStats } from '@/components/settings/team-stats';
import { InviteMemberDialog } from '@/components/settings/invite-member-dialog';
import { TeamMemberActions } from '@/components/settings/team-member-actions';
import { redirect } from 'next/navigation';

export default async function TeamPage() {
  const user = await getCurrentUser();

  if (!user || !user.organization_id) {
    redirect('/settings');
  }

  const [organization, members, stats] = await Promise.all([
    getOrganization(user.organization_id),
    getOrganizationMembers(user.organization_id),
    getOrganizationStats(user.organization_id),
  ]);

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Organization not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s team members and their roles
          </p>
        </div>
        <InviteMemberDialog organizationId={organization.id} />
      </div>

      <TeamStats
        totalMembers={stats.totalMembers}
        adminCount={stats.adminCount}
        activeCount={stats.activeCount}
      />

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            All members of {organization.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.users.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.users.name?.substring(0, 2).toUpperCase() || member.users.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.users.name || 'Unnamed User'}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.users.id === user.id ? '(You)' : ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.users.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={member.role} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joined_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.users.is_active ? 'default' : 'secondary'}>
                      {member.users.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.role !== 'OWNER' && member.users.id !== user.id && (
                      <TeamMemberActions
                        userId={member.users.id}
                        userName={member.users.name || member.users.email}
                        currentRole={member.role}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
