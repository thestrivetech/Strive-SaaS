import { useState, useCallback } from "react";
import { Lead, Client, FollowUp, Note } from "@/lib/types/real-estate/crm";
import { PhaseStatus } from "@/lib/phase-status";

export function useLeadsState(initialLeads: Lead[]) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const updatePhase = useCallback((id: string, phase: PhaseStatus) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          // Auto-convert to client when closed
          if (phase === "closed" && !lead.isClient) {
            return {
              ...lead,
              phase,
              isClient: true,
              closedDate: new Date(),
              followUps: [],
              notes: [],
            } as Client;
          }
          return { ...lead, phase };
        }
        return lead;
      })
    );
  }, []);

  const addFollowUp = useCallback(
    (clientId: string, followUp: Omit<FollowUp, "id">) => {
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id === clientId && lead.isClient) {
            const client = lead as Client;
            return {
              ...client,
              followUps: [
                ...client.followUps,
                {
                  ...followUp,
                  id: `followup-${Date.now()}-${Math.random()}`,
                },
              ],
            };
          }
          return lead;
        })
      );
    },
    []
  );

  const addNote = useCallback(
    (clientId: string, note: Omit<Note, "id" | "createdAt">) => {
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id === clientId && lead.isClient) {
            const client = lead as Client;
            return {
              ...client,
              notes: [
                {
                  ...note,
                  id: `note-${Date.now()}-${Math.random()}`,
                  createdAt: new Date(),
                },
                ...client.notes,
              ],
            };
          }
          return lead;
        })
      );
    },
    []
  );

  const toggleFollowUp = useCallback((clientId: string, followUpId: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === clientId && lead.isClient) {
          const client = lead as Client;
          return {
            ...client,
            followUps: client.followUps.map((f) =>
              f.id === followUpId ? { ...f, completed: !f.completed } : f
            ),
          };
        }
        return lead;
      })
    );
  }, []);

  const clients = leads.filter((lead): lead is Client => lead.isClient === true);

  return {
    leads,
    clients,
    updatePhase,
    addFollowUp,
    addNote,
    toggleFollowUp,
  };
}
