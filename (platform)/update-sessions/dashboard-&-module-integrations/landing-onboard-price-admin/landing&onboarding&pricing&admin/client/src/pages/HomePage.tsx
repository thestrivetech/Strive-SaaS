import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, Check, Zap, Shield, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for performance with cutting-edge technology"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with SOC 2 compliance"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Powerful insights to drive your business forward"
    }
  ];

  const benefits = [
    "99.9% uptime guarantee",
    "24/7 dedicated support",
    "Easy integration",
    "Scalable infrastructure",
    "Custom workflows",
    "Real-time collaboration"
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Strive Tech</h1>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" data-testid="link-pricing">Pricing</Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" data-testid="link-admin">Admin</Button>
            </Link>
            <Link href="/onboarding">
              <Button data-testid="button-get-started">Get Started</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">
              Build Better Products,<br />Faster
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The enterprise SaaS platform that empowers teams to ship products 10x faster with powerful tools and seamless workflows.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" data-testid="button-start-free-trial">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" data-testid="button-view-pricing">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Everything you need to succeed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of teams already building with Strive Tech
            </p>
            <Link href="/onboarding">
              <Button size="lg" variant="secondary" data-testid="button-start-now">
                Start Now - It's Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © 2024 Strive Tech. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
