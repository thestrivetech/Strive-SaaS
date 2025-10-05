import { OnboardingLayout } from "../OnboardingLayout";
import { Card } from "@/components/ui/card";

export default function OnboardingLayoutExample() {
  return (
    <OnboardingLayout currentStep={1}>
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Step Content Goes Here</h2>
        <p className="text-muted-foreground">This is where the onboarding step content will be displayed.</p>
      </Card>
    </OnboardingLayout>
  );
}
