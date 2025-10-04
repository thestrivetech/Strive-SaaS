import PartyCard from "@/components/transaction/party-card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useParties } from "@/lib/hooks/useParties";
import { Skeleton } from "@/components/ui/skeleton";

export default function Parties() {
  const { data: parties, isLoading } = useParties();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Transaction Parties</h1>
          <p className="text-muted-foreground">Manage all parties involved in transactions</p>
        </div>
        <Button data-testid="button-add-party">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Party
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" data-testid={`skeleton-party-${i}`} />
          ))
        ) : parties && parties.length > 0 ? (
          parties.map((party) => (
            <PartyCard
              key={party.id}
              name={party.name}
              role={party.role}
              email={party.email}
              phone={party.phone || undefined}
              permissions={party.permissions}
              onEmail={() => console.log('Email:', party.email)}
              onCall={() => console.log('Call:', party.phone)}
              onRemove={() => console.log('Remove:', party.name)}
              onEditPermissions={() => console.log('Edit permissions:', party.name)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            No parties found
          </div>
        )}
      </div>
    </div>
  );
}
