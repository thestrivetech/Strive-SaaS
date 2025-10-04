import LoopCard from '../transaction/loop-card';

export default function LoopCardExample() {
  return (
    <div className="p-4 max-w-sm">
      <LoopCard
        id="1"
        propertyAddress="123 Maple Street, Springfield"
        status="active"
        transactionType="Purchase Agreement"
        listingPrice={450000}
        closingDate="Dec 15, 2025"
        progress={65}
        parties={[
          { name: "John Smith", role: "Buyer" },
          { name: "Sarah Johnson", role: "Seller" },
          { name: "Mike Davis", role: "Agent" },
        ]}
        documentCount={12}
        onView={() => console.log('View clicked')}
        onEdit={() => console.log('Edit clicked')}
        onDelete={() => console.log('Delete clicked')}
      />
    </div>
  );
}
