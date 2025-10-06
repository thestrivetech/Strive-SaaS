'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="text-2xl font-bold text-primary">
            Strive
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          <Link
            href="/features"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Docs
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/onboarding">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t">
          <div className="space-y-2 px-6 py-4">
            <Link
              href="/features"
              className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
            >
              Docs
            </Link>
            <div className="border-t pt-4 space-y-2">
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/onboarding">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
