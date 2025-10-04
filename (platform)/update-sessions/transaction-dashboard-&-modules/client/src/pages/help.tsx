import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Book } from "lucide-react";

export default function Help() {
  const faqs = [
    {
      question: "How do I create a new transaction loop?",
      answer: "Click the 'Create Loop' button on the dashboard, fill in the property details, transaction type, and expected closing date. You can then add parties and documents to the loop.",
    },
    {
      question: "How do I request signatures from parties?",
      answer: "Upload the document that needs signatures, then click the 'Request Signature' button. Select the parties who need to sign and configure the signing order (sequential or parallel).",
    },
    {
      question: "Can I track document versions?",
      answer: "Yes, every time a document is modified or updated, a new version is automatically created. You can view the version history and compare changes from the document details page.",
    },
    {
      question: "How do I manage party permissions?",
      answer: "Go to the Parties tab within a transaction loop, click on a party card, and select 'Edit Permissions'. You can grant or revoke specific permissions like viewing, editing, or signing documents.",
    },
    {
      question: "What happens when a deadline is missed?",
      answer: "The system will automatically send notifications to relevant parties. Overdue tasks and milestones will be highlighted in red throughout the platform, and you'll receive alerts in your notification center.",
    },
    {
      question: "How do I export transaction reports?",
      answer: "Navigate to Analytics, select the date range and transaction criteria, then click 'Export Report'. You can download reports in PDF or CSV format for accounting and compliance purposes.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Help & Support</h1>
        <p className="text-muted-foreground">Get assistance with RealtyFlow</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover-elevate cursor-pointer" onClick={() => console.log('Contact support')}>
          <CardHeader>
            <Mail className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-base">Email Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Get help via email within 24 hours</p>
            <p className="text-sm font-medium text-primary mt-2" data-testid="button-email-support">
              support@realtyflow.com
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" onClick={() => console.log('Live chat')}>
          <CardHeader>
            <MessageCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-base">Live Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Chat with our support team now</p>
            <Button variant="outline" size="sm" className="mt-2" data-testid="button-live-chat">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" onClick={() => console.log('Documentation')}>
          <CardHeader>
            <Book className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-base">Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Browse our comprehensive guides</p>
            <Button variant="outline" size="sm" className="mt-2" data-testid="button-documentation">
              View Docs
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger data-testid={`faq-question-${idx}`}>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video Tutorials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" data-testid="button-tutorial-1">
              Getting Started with RealtyFlow
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-tutorial-2">
              Managing Transaction Loops
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-tutorial-3">
              Document Management Best Practices
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-tutorial-4">
              E-Signature Workflows
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
