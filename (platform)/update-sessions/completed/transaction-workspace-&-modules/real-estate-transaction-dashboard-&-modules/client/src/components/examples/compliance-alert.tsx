import ComplianceAlert from '../transaction/compliance-alert';

export default function ComplianceAlertExample() {
  return (
    <div className="p-4 max-w-2xl space-y-4">
      <ComplianceAlert
        type="error"
        title="Missing Required Disclosure"
        message="Lead-based paint disclosure is required for properties built before 1978. Please upload this document to maintain compliance."
        actionLabel="Upload Document"
        onAction={() => console.log('Upload clicked')}
      />
      <ComplianceAlert
        type="warning"
        title="Approaching Deadline"
        message="Inspection contingency expires in 2 days. Ensure all inspection reports are reviewed and documented."
        actionLabel="View Tasks"
        onAction={() => console.log('View tasks clicked')}
      />
      <ComplianceAlert
        type="success"
        title="Compliance Check Passed"
        message="All required state disclosures have been uploaded and signed by appropriate parties."
      />
      <ComplianceAlert
        type="info"
        title="New State Regulation"
        message="California has updated disclosure requirements effective January 2026. Review updated forms in the template library."
        actionLabel="View Templates"
        onAction={() => console.log('View templates clicked')}
      />
    </div>
  );
}
