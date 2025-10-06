'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Zap,
  Shield,
  Users,
  BarChart3,
  Clock,
  Sparkles,
  Globe,
  Lock,
  Rocket,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on cutting-edge tech for blazing performance',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance certifications',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with real-time updates',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Powerful insights to drive better decisions',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Expert help whenever you need it',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Smart automation to save time and reduce errors',
  },
  {
    icon: Globe,
    title: 'Global CDN',
    description: 'Fast access from anywhere in the world',
  },
  {
    icon: Lock,
    title: 'Data Privacy',
    description: 'Your data stays yours, always encrypted',
  },
  {
    icon: Rocket,
    title: 'Rapid Deployment',
    description: 'Go live in minutes, not weeks',
  },
];

export function FeaturesSection() {
  return (
    <section className="px-6 py-24 sm:py-32 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed to help your team work smarter, not harder.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover-elevate transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
