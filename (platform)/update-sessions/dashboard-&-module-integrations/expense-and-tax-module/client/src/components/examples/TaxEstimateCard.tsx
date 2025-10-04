import { TaxEstimateCard } from '../tax-estimate-card';

export default function TaxEstimateCardExample() {
  return (
    <div className="p-8 bg-background">
      <div className="max-w-md">
        <TaxEstimateCard
          totalExpenses={45231}
          deductibleExpenses={38450}
          taxRate={0.25}
        />
      </div>
    </div>
  );
}
