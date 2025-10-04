"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function NewsletterSection() {
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newsletterEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address.",
      });
      return;
    }

    setIsNewsletterSubmitting(true);

    try {
      const response = await fetch("/api/analytics/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      if (!response.ok) {
        throw new Error("Subscription failed");
      }

      toast({
        title: "Successfully Subscribed! 🎉",
        description: "You'll receive our latest resources and insights.",
      });

      setNewsletterEmail("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: "Please try again later.",
      });
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-4">
            <Mail className="w-12 h-12 text-orange-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Stay Updated with AI Insights
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Get exclusive whitepapers, case studies, and industry insights delivered to your inbox.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 bg-white"
              data-testid="input-newsletter-email"
            />
            <Button
              type="submit"
              disabled={isNewsletterSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              data-testid="button-newsletter-submit"
            >
              {isNewsletterSubmitting ? (
                "Subscribing..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          </form>
          <p className="text-slate-400 text-sm mt-4">
            Join 5,000+ professionals. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
