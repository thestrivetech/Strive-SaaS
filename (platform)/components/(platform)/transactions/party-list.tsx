'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, Mail, Phone, Trash2, Loader2 } from 'lucide-react';
import { PartyInviteDialog } from './party-invite-dialog';
import { getPartiesByLoop, removeParty, type PartyWithCounts } from '@/lib/modules/parties';
import { PartyRole, PartyStatus } from '@prisma/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PartyListProps {
  loopId: string;
}

export function PartyList({ loopId }: PartyListProps) {
  const [parties, setParties] = useState<PartyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function loadParties() {
    try {
      setLoading(true);
      const data = await getPartiesByLoop({ loopId });
      setParties(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load parties',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadParties();
  }, [loopId]);

  async function handleRemoveParty(partyId: string) {
    try {
      setRemovingId(partyId);
      await removeParty(partyId);
      toast({
        title: 'Party removed',
        description: 'The party has been removed from this transaction',
      });
      loadParties(); // Reload list
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to remove party',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setRemovingId(null);
    }
  }

  function getRoleBadgeVariant(role: PartyRole): 'default' | 'secondary' | 'outline' {
    switch (role) {
      case 'BUYER':
      case 'SELLER':
        return 'default';
      case 'BUYER_AGENT':
      case 'LISTING_AGENT':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  function getStatusBadgeVariant(status: PartyStatus): 'default' | 'secondary' | 'destructive' {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'REMOVED':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  function formatRole(role: PartyRole): string {
    return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Parties</CardTitle>
        <PartyInviteDialog loopId={loopId} onSuccess={loadParties} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : parties.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No parties added yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add buyers, sellers, and agents to this transaction.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parties.map((party) => (
                  <TableRow key={party.id}>
                    <TableCell className="font-medium">{party.name}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(party.role)}>
                        {formatRole(party.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {party.email}
                        </div>
                        {party.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {party.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(party.status)}>
                        {party.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(party.permissions as string[]).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {party.status !== 'REMOVED' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={removingId === party.id}
                            >
                              {removingId === party.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Party?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {party.name} from this
                                transaction? This action can be reversed by re-inviting the
                                party.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveParty(party.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
