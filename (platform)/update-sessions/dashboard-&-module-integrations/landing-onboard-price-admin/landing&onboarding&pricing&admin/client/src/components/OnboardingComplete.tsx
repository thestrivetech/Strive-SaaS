import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface OnboardingCompleteProps {
  onContinue: () => void;
}

export function OnboardingComplete({ onContinue }: OnboardingCompleteProps) {
  return (
    <Card className="p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold mb-3">Welcome to Strive Tech!</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Your account has been successfully set up. You're all ready to start using our platform.
      </p>
      
      <Button onClick={onContinue} size="lg" data-testid="button-continue">
        Go to Dashboard
      </Button>
    </Card>
  );
}
