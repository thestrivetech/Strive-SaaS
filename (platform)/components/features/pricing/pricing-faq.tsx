'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    question: 'Can I change plans anytime?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle. If you upgrade, you\'ll be prorated for the current period.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes, all paid plans come with a 14-day free trial. No credit card required to start. You can explore all features before committing.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      'Your data is safely stored for 30 days after cancellation, giving you time to export or reactivate your account. After 30 days, data is permanently deleted.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 30-day money-back guarantee on all plans. If you\'re not satisfied, contact support for a full refund within the first 30 days.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and ACH transfers for annual plans. Enterprise plans can pay via invoice.',
  },
  {
    question: 'Can I get a custom plan?',
    answer:
      'Yes! Enterprise plans are fully customizable. Contact our sales team to discuss your specific requirements and we\'ll create a plan that fits your needs.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use bank-level encryption (AES-256), SOC 2 Type II compliance, and multi-tenant isolation. Your data is yours and is never shared.',
  },
  {
    question: 'What kind of support do you offer?',
    answer:
      'Starter and Growth plans include email support (24-48 hour response). Elite plans get priority support (4-hour response). Enterprise plans get dedicated support with 24/7 phone access.',
  },
];

export function PricingFAQ() {
  return (
    <section className="px-6 py-24 bg-muted/30">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {FAQS.map((faq, index) => (
            <Card key={index} className="hover-elevate">
              <AccordionItem value={`item-${index}`} className="border-none">
                <CardContent className="pt-6 pb-0">
                  <AccordionTrigger className="hover:no-underline">
                    <h3 className="font-semibold text-lg text-left">
                      {faq.question}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground pt-2">{faq.answer}</p>
                  </AccordionContent>
                </CardContent>
              </AccordionItem>
            </Card>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <Button variant="outline" asChild>
            <a href="/contact">Contact Support</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
