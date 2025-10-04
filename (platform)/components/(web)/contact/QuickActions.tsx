"use client";

import { Calendar, Eye, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onBrochureClick: () => void;
}

export function QuickActions({ onBrochureClick }: QuickActionsProps) {
  const router = useRouter();

  const quickActions = [
    { icon: <Calendar className="mr-2" />, text: "Request Personalized Demo", action: "demo" },
    {
      icon: <Eye className="mr-1 sm:mr-2 flex-shrink-0" />,
      text: (
        <span className="flex items-center gap-1.5">
          <span className="hidden sm:inline">Download Brochure</span>
          <span className="sm:hidden text-xs">Download</span>
        </span>
      ),
      action: "brochure"
    },
    {
      icon: <MessageCircle className="mr-1 sm:mr-2 flex-shrink-0" />,
      text: (
        <span className="flex items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline">Chat Live with AI Specialist</span>
          <span className="sm:hidden text-xs leading-tight">Chat with AI</span>
        </span>
      ),
      action: "chat"
    }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "demo":
        router.push('/request');
        break;
      case "brochure":
        onBrochureClick();
        break;
      case "chat":
        router.push('/chatbot-sai');
        break;
    }
  };

  return (
    <Card className="p-6 md:p-8 shadow-xl" style={{ backgroundColor: '#ffffffeb', border: '1px solid #ff7033' }}>
      <CardContent className="p-0">
        <div className="text-center mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <h3
            className="text-lg md:text-2xl font-bold mb-1 md:mb-2"
            style={{ color: '#020a1c' }}
            data-testid="text-quick-actions-title"
          >
            Ready to Take the Next Step?
          </h3>
          <p className="text-muted-foreground text-sm md:text-base" style={{ color: '#666' }}>
            Book your free strategy assessment and explore our resources
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {/* Primary assessment button */}
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 sm:py-3 md:py-4 px-3 sm:px-4 text-sm sm:text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500 min-h-[2.75rem] sm:min-h-[3rem]"
            onClick={() => router.push('/assessment')}
            data-testid="button-schedule-assessment"
          >
            <Calendar className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Book Free Strategy Assessment</span>
            <span className="sm:hidden text-center leading-tight">Book Free Assessment</span>
          </Button>

          {/* Secondary actions */}
          <div className="grid grid-cols-1 gap-3">
            {quickActions.slice(0, 2).map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-center py-2 sm:py-3 px-2 sm:px-4 border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-md text-xs sm:text-sm md:text-base min-h-[2.5rem] sm:min-h-[2.75rem] whitespace-normal sm:whitespace-nowrap"
                onClick={() => handleQuickAction(action.action)}
                data-testid={`button-${action.action}`}
              >
                {action.icon}
                {action.text}
              </Button>
            ))}
          </div>
          {/* Chat button spans full width */}
          {quickActions[2] && (
            <Button
              variant="outline"
              className="w-full justify-center py-2 sm:py-3 px-2 sm:px-4 border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-md relative overflow-hidden text-xs sm:text-sm md:text-base min-h-[2.5rem] sm:min-h-[2.75rem] whitespace-normal sm:whitespace-nowrap"
              onClick={() => handleQuickAction(quickActions[2].action)}
              data-testid={`button-${quickActions[2].action}`}
            >
              {quickActions[2].icon}
              {quickActions[2].text}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
