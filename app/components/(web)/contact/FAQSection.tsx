"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export function FAQSection() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How quickly can we start seeing results with Strive's AI solutions?",
      answer: "Most clients launch their first AI-powered project in as little as 2 to 4 weeks with measurable business value soon after."
    },
    {
      question: "What support can we expect after implementation?",
      answer: "Our experts guide you from onboarding through ongoing optimization. You'll have a dedicated success manager, proactive monitoring, and 24/7 support."
    },
    {
      question: "Which industries have you helped?",
      answer: "We empower teams in real estate, dental practices, finance, logistics, healthcare, and beyond. If your industry isn't listed, chances are, we can help."
    },
    {
      question: "How does Strive protect our data?",
      answer: "Your data security is our top priority. Strive adheres to leading compliance standards and uses advanced encryption to keep your information safe."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="mt-16 md:mt-20">
      <div className="text-center mb-8 md:mb-12">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4"
          data-testid="text-faq-title"
        >
          Frequently Asked Questions
        </h2>
        <p
          className="text-lg md:text-xl text-muted-foreground"
          data-testid="text-faq-subtitle"
        >
          Quick answers to common questions.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="overflow-hidden" style={{ backgroundColor: '#ffffffeb' }}>
            <button
              className="w-full text-left p-5 sm:p-4 md:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors min-h-[64px] sm:min-h-[60px] md:min-h-auto"
              onClick={() => toggleFaq(index)}
              data-testid={`button-faq-${index}`}
            >
              <span className="font-medium text-sm md:text-base pr-4" data-testid={`text-faq-question-${index}`} style={{ color: '#020a1c' }}>
                {faq.question}
              </span>
              <div className="flex-shrink-0">
                {expandedFaq === index ? (
                  <ChevronUp className="text-primary w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <ChevronDown className="text-primary w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>
            </button>
            {expandedFaq === index && (
              <div
                className="px-4 md:px-6 pb-4 md:pb-6 text-sm md:text-base leading-relaxed"
                style={{ color: '#666' }}
                data-testid={`text-faq-answer-${index}`}
              >
                {faq.answer}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
