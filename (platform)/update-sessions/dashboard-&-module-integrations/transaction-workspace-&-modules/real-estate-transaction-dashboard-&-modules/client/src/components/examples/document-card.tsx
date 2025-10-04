import DocumentCard from '../transaction/document-card';

export default function DocumentCardExample() {
  return (
    <div className="p-4 max-w-2xl space-y-3">
      <DocumentCard
        id="1"
        name="Purchase_Agreement_Final.pdf"
        type="pdf"
        size="2.4 MB"
        version={3}
        lastModified="2 hours ago"
        uploadedBy="John Smith"
        status="signed"
        onView={() => console.log('View clicked')}
        onDownload={() => console.log('Download clicked')}
        onDelete={() => console.log('Delete clicked')}
      />
      <DocumentCard
        id="2"
        name="Inspection_Report.pdf"
        type="pdf"
        size="1.2 MB"
        version={1}
        lastModified="1 day ago"
        uploadedBy="Sarah Johnson"
        status="pending"
        onView={() => console.log('View clicked')}
        onDownload={() => console.log('Download clicked')}
        onDelete={() => console.log('Delete clicked')}
      />
    </div>
  );
}
