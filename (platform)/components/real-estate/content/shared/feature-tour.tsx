'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Feature Tour Component
 *
 * Displays a guided tour for first-time ContentPilot users
 * Uses localStorage to track completion
 * Client component for localStorage access
 */

interface TourStep {
  title: string;
  description: string;
  image?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to ContentPilot!',
    description:
      'Your all-in-one content management and marketing platform. Create, publish, and track content performance all in one place.',
  },
  {
    title: 'Create Content Easily',
    description:
      'Use our powerful editor to create blog posts, pages, and marketing content. Schedule posts for future publishing.',
  },
  {
    title: 'Launch Campaigns',
    description:
      'Create email campaigns and social media posts. Track engagement and optimize your marketing strategy.',
  },
  {
    title: 'Track Performance',
    description:
      'View detailed analytics on content performance, campaign metrics, and audience engagement.',
  },
  {
    title: 'Ready to Start?',
    description:
      'Explore the dashboard to see your content overview, or jump right into creating your first piece of content!',
  },
];

const STORAGE_KEY = 'contentpilot-tour-completed';

export function FeatureTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem(STORAGE_KEY);

    if (!tourCompleted) {
      // Show tour after a brief delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = TOUR_STEPS[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{currentTourStep.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>{currentTourStep.description}</DialogDescription>
        </DialogHeader>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 py-4">
          {TOUR_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-6 bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Skip Tour
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button onClick={handleNext}>
              {currentStep === TOUR_STEPS.length - 1 ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
