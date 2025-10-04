"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  onReturnHome: () => void;
}

export function SuccessMessage({ onReturnHome }: SuccessMessageProps) {
  return (
    <div className="pt-16 min-h-screen hero-gradient flex items-center justify-center">
      <Card className="max-w-2xl mx-auto hero-gradient backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#ff7033] mb-4">
            Request Received - Showcase Preparation Begins!
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Thank you for choosing Strive. Our solution architects are now preparing your personalized AI showcase. Within 24 hours, you'll receive a detailed showcase agenda tailored to your specific requirements and industry challenges.
          </p>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-[#020a1c] mb-3">Your Showcase Timeline:</h3>
            <ul className="text-left space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span><strong>Within 2 hours:</strong> Our solution architects begin reviewing your specific requirements</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span><strong>Within 24 hours:</strong> You'll receive a personalized showcase agenda and calendar invitation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span><strong>Showcase session:</strong> Live demonstration of AI solutions tailored to your business challenges</span>
              </li>
            </ul>
          </div>
          <Button
            onClick={onReturnHome}
            className="bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            Return to Homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
