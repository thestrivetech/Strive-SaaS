'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="create-loop"]',
    title: 'Create Your First Transaction',
    content: 'Start by creating a new transaction loop. Click here to begin tracking your real estate transaction from start to finish.',
  },
  {
    target: '[data-tour="documents"]',
    title: 'Upload Documents',
    content: 'Securely upload and manage all transaction-related documents. Documents are encrypted and accessible only to authorized parties.',
  },
  {
    target: '[data-tour="parties"]',
    title: 'Invite Parties',
    content: 'Add buyers, sellers, agents, and other stakeholders to your transaction. Each party gets controlled access based on their role.',
  },
  {
    target: '[data-tour="signatures"]',
    title: 'Request E-Signatures',
    content: 'Send documents for electronic signature. Track signature status in real-time and get notified when documents are signed.',
  },
];

/**
 * Onboarding Tour Component
 *
 * Shows a guided tour for first-time users of the transaction management system
 * Uses localStorage to track if user has completed the tour
 *
 * NOTE: This is a custom implementation since react-joyride doesn't support React 19
 */
export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(true);

  useEffect(() => {
    // Check if user has completed the tour
    const completed = localStorage.getItem('transactions-tour-completed');
    if (!completed) {
      setHasCompletedTour(false);
      // Start tour after a small delay to ensure page is loaded
      setTimeout(() => setIsActive(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    // Don't mark as completed if skipped, so it shows again next time
  };

  const completeTour = () => {
    localStorage.setItem('transactions-tour-completed', 'true');
    setIsActive(false);
    setHasCompletedTour(true);
  };

  if (!isActive || hasCompletedTour) {
    return null;
  }

  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={handleSkip} />

      {/* Tour Card */}
      <div className="fixed bottom-4 right-4 z-50 w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription className="mt-1">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{step.content}</p>

            {/* Progress Dots */}
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-primary'
                      : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleSkip}>
                  Skip Tour
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === TOUR_STEPS.length - 1 ? (
                    'Get Started'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
