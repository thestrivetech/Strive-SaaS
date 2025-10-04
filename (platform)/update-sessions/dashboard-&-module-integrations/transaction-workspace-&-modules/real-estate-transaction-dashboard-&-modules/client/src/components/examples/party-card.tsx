import PartyCard from '../transaction/party-card';

export default function PartyCardExample() {
  return (
    <div className="p-4 max-w-md space-y-4">
      <PartyCard
        name="John Smith"
        role="Buyer"
        email="john.smith@email.com"
        phone="+1 (555) 123-4567"
        permissions={["View Documents", "Sign Documents", "Message"]}
        onEmail={() => console.log('Email clicked')}
        onCall={() => console.log('Call clicked')}
        onRemove={() => console.log('Remove clicked')}
        onEditPermissions={() => console.log('Edit permissions clicked')}
      />
      <PartyCard
        name="Sarah Johnson"
        role="Listing Agent"
        email="sarah.j@realty.com"
        phone="+1 (555) 987-6543"
        permissions={["View Documents", "Edit Documents", "Sign Documents", "Manage Parties", "Message"]}
        onEmail={() => console.log('Email clicked')}
        onCall={() => console.log('Call clicked')}
        onRemove={() => console.log('Remove clicked')}
        onEditPermissions={() => console.log('Edit permissions clicked')}
      />
    </div>
  );
}
