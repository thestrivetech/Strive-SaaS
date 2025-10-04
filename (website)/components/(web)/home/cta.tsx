import Link from "next/link";
import { ArrowRight, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "https://app.strivetech.ai";

  return (
    <section className="py-20 bg-gradient-to-br from-primary to-blue-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-10 text-white/90">
            Join hundreds of businesses that have already transformed their operations with our AI-powered solutions.
            Start your journey today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href={platformUrl} className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10">
              <Link href="/request" className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Book a Demo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10">
              <Link href="/contact" className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Contact Us
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white/90">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white/90">14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white/90">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
