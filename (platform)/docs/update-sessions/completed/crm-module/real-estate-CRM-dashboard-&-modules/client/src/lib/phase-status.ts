export type PhaseStatus = "new_lead" | "in_contact" | "active" | "negotiation" | "closed";

export interface PhaseStatusConfig {
  label: string;
  value: PhaseStatus;
  color: string;
  textColor: string;
  borderColor: string;
}

export const phaseStatuses: PhaseStatusConfig[] = [
  {
    label: "New Lead",
    value: "new_lead",
    color: "bg-chart-1/10",
    textColor: "text-chart-1",
    borderColor: "border-chart-1/20",
  },
  {
    label: "In Contact",
    value: "in_contact",
    color: "bg-chart-2/10",
    textColor: "text-chart-2",
    borderColor: "border-chart-2/20",
  },
  {
    label: "Active",
    value: "active",
    color: "bg-chart-3/10",
    textColor: "text-chart-3",
    borderColor: "border-chart-3/20",
  },
  {
    label: "Negotiation",
    value: "negotiation",
    color: "bg-chart-4/10",
    textColor: "text-chart-4",
    borderColor: "border-chart-4/20",
  },
  {
    label: "Closed",
    value: "closed",
    color: "bg-primary/10",
    textColor: "text-primary",
    borderColor: "border-primary/20",
  },
];

export function getPhaseConfig(status: PhaseStatus): PhaseStatusConfig {
  return phaseStatuses.find(s => s.value === status) || phaseStatuses[0];
}
