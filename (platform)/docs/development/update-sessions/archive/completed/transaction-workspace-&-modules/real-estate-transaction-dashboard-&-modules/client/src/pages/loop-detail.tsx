import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/transaction/status-badge";
import DocumentCard from "@/components/transaction/document-card";
import ActivityFeed from "@/components/transaction/activity-feed";
import SignatureRequest from "@/components/transaction/signature-request";
import TaskChecklist from "@/components/transaction/task-checklist";
import MilestoneTimeline from "@/components/transaction/milestone-timeline";
import PartyCard from "@/components/transaction/party-card";
import ComplianceAlert from "@/components/transaction/compliance-alert";
import { ArrowLeft, MapPin, Calendar, DollarSign, Share2, MoreVertical } from "lucide-react";
import { Link } from "wouter";

export default function LoopDetail() {
  const documents = [
    {
      id: "1",
      name: "Purchase_Agreement_Final.pdf",
      type: "pdf" as const,
      size: "2.4 MB",
      version: 3,
      lastModified: "2 hours ago",
      uploadedBy: "John Smith",
      status: "signed" as const,
    },
    {
      id: "2",
      name: "Inspection_Report.pdf",
      type: "pdf" as const,
      size: "1.2 MB",
      version: 1,
      lastModified: "1 day ago",
      uploadedBy: "Sarah Johnson",
      status: "pending" as const,
    },
  ];

  const activities = [
    {
      id: "1",
      type: "signature" as const,
      user: { name: "John Smith" },
      action: "signed",
      target: "Purchase Agreement",
      timestamp: "2 minutes ago",
    },
    {
      id: "2",
      type: "upload" as const,
      user: { name: "Sarah Johnson" },
      action: "uploaded",
      target: "Inspection Report",
      timestamp: "1 hour ago",
    },
  ];

  const tasks = [
    {
      id: "1",
      title: "Order home inspection",
      completed: true,
      assignee: { name: "John Smith" },
      dueDate: "Dec 5, 2025",
      priority: "high" as const,
    },
    {
      id: "2",
      title: "Submit loan application",
      completed: false,
      assignee: { name: "Sarah Johnson" },
      dueDate: "Dec 18, 2025",
      priority: "high" as const,
    },
  ];

  const milestones = [
    {
      id: "1",
      title: "Contract Signed",
      date: "Dec 1, 2025",
      completed: true,
    },
    {
      id: "2",
      title: "Inspection Period",
      date: "Dec 8, 2025",
      completed: true,
    },
    {
      id: "3",
      title: "Financing Contingency",
      date: "Dec 15, 2025",
      completed: false,
    },
  ];

  const parties = [
    {
      name: "John Smith",
      role: "Buyer",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      permissions: ["View Documents", "Sign Documents"],
    },
    {
      name: "Sarah Johnson",
      role: "Listing Agent",
      email: "sarah.j@realty.com",
      permissions: ["View Documents", "Edit Documents", "Sign Documents"],
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold" data-testid="text-property-address">123 Maple Street, Springfield</h1>
            <StatusBadge status="active" showIcon />
          </div>
          <p className="text-muted-foreground">Purchase Agreement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-share">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-more">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Property Type</span>
            </div>
            <p className="text-sm font-medium">Single Family Home</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Listing Price</span>
            </div>
            <p className="text-sm font-medium font-mono" data-testid="text-listing-price">$450,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Closing Date</span>
            </div>
            <p className="text-sm font-medium" data-testid="text-closing-date">December 15, 2025</p>
          </CardContent>
        </Card>
      </div>

      <ComplianceAlert
        type="warning"
        title="Approaching Deadline"
        message="Inspection contingency expires in 2 days. Ensure all inspection reports are reviewed and documented."
        actionLabel="View Tasks"
        onAction={() => console.log('View tasks clicked')}
      />

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
          <TabsTrigger value="tasks" data-testid="tab-tasks">Tasks</TabsTrigger>
          <TabsTrigger value="parties" data-testid="tab-parties">Parties</TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      {...doc}
                      onView={() => console.log('View document:', doc.id)}
                      onDownload={() => console.log('Download document:', doc.id)}
                      onDelete={() => console.log('Delete document:', doc.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <SignatureRequest
                documentName="Purchase Agreement - 123 Maple Street"
                totalParties={4}
                signedCount={2}
                deadline="Dec 20, 2025"
                parties={[
                  { name: "John Smith", email: "john@example.com", role: "Buyer", status: "signed" },
                  { name: "Sarah Johnson", email: "sarah@example.com", role: "Seller", status: "signed" },
                  { name: "Mike Davis", email: "mike@example.com", role: "Agent", status: "viewed" },
                  { name: "Emily Chen", email: "emily@example.com", role: "Agent", status: "pending" },
                ]}
                onSendReminder={(email) => console.log('Remind:', email)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TaskChecklist
              title="Purchase Checklist"
              tasks={tasks}
              onToggleTask={(id) => console.log('Toggle:', id)}
            />
            <MilestoneTimeline milestones={milestones} />
          </div>
        </TabsContent>

        <TabsContent value="parties" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {parties.map((party, idx) => (
              <PartyCard
                key={idx}
                {...party}
                onEmail={() => console.log('Email:', party.email)}
                onCall={() => console.log('Call:', party.phone)}
                onRemove={() => console.log('Remove:', party.name)}
                onEditPermissions={() => console.log('Edit permissions:', party.name)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
