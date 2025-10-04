import { LeadScoreBadge } from "../crm/leads/lead-score-badge";

export default function LeadScoreBadgeExample() {
  return (
    <div className="flex flex-wrap gap-3 p-6">
      <LeadScoreBadge score="hot" />
      <LeadScoreBadge score="warm" />
      <LeadScoreBadge score="cold" />
      <LeadScoreBadge score="hot" showIcon={false} />
      <LeadScoreBadge score="warm" showIcon={false} />
      <LeadScoreBadge score="cold" showIcon={false} />
    </div>
  );
}
