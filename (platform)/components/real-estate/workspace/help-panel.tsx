'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, FileText, Users, CheckSquare, FileSignature, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Help Panel Component
 *
 * Provides contextual help and FAQs for the transaction management system
 * Can be toggled on/off by the user
 */
export function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-30 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 w-full max-w-md">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Transaction Help</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>How do I create a transaction loop?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Click the &quot;Create Loop&quot; button on the main transactions page. Fill in the property
                details, transaction type, and listing price. You can add parties and documents after
                creating the loop.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>What roles can parties have?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Parties can be assigned roles like Buyer, Seller, Agent, Attorney, Inspector, or Other.
                Each role determines their access level and what documents they can view or sign.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <FileSignature className="h-4 w-4" />
                  <span>How do e-signatures work?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Upload a document, then request signatures from specific parties. They&apos;ll receive an
                email with a secure link to review and sign. You can track signature status in real-time
                and receive notifications when documents are signed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>What are workflow templates?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Workflow templates are pre-configured sequences of tasks, documents, and milestones for
                common transaction types. Apply a template to automatically set up your transaction loop
                with all necessary steps.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>
                <span>How secure are my documents?</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                All documents are encrypted at rest using AES-256-GCM encryption. Access is controlled
                through role-based permissions, and all document activity is logged for audit compliance.
                Only authorized parties can view or download documents.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>
                <span>Can I customize compliance checks?</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Yes! Navigate to Settings → Compliance to configure required documents, parties, and
                deadline rules for your organization. Custom rules will apply to all new transaction loops.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 space-y-2 border-t pt-4">
            <p className="text-sm font-medium">Need more help?</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <a href="/docs/transactions" target="_blank">
                  View Full Documentation
                </a>
              </Button>
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <a href="/support" target="_blank">
                  Contact Support
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
