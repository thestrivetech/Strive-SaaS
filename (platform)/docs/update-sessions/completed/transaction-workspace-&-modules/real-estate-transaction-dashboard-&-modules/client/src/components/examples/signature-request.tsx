import SignatureRequest from '../transaction/signature-request';

export default function SignatureRequestExample() {
  return (
    <div className="p-4 max-w-2xl">
      <SignatureRequest
        documentName="Purchase Agreement - 123 Maple Street"
        totalParties={4}
        signedCount={2}
        deadline="Dec 20, 2025"
        parties={[
          { name: "John Smith", email: "john@example.com", role: "Buyer", status: "signed", signedAt: "Dec 10, 2025" },
          { name: "Sarah Johnson", email: "sarah@example.com", role: "Seller", status: "signed", signedAt: "Dec 11, 2025" },
          { name: "Mike Davis", email: "mike@example.com", role: "Listing Agent", status: "viewed" },
          { name: "Emily Chen", email: "emily@example.com", role: "Buyer's Agent", status: "pending" },
        ]}
        onSendReminder={(email) => console.log('Send reminder to:', email)}
        onResend={(email) => console.log('Resend to:', email)}
      />
    </div>
  );
}
