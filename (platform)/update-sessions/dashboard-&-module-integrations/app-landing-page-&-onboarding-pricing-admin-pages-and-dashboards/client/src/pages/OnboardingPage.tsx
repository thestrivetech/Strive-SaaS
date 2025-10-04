import { useState } from "react";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import { OrgDetailsForm } from "@/components/OrgDetailsForm";
import { PlanSelectionForm } from "@/components/PlanSelectionForm";
import { PaymentForm } from "@/components/PaymentForm";
import { OnboardingComplete } from "@/components/OnboardingComplete";

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    org: { name: "", website: "", description: "" },
    tier: null as string | null,
  });

  const handleOrgNext = (data: { name: string; website: string; description: string }) => {
    setFormData({ ...formData, org: data });
    setCurrentStep(2);
  };

  const handlePlanNext = (tier: string) => {
    setFormData({ ...formData, tier });
    setCurrentStep(3);
  };

  const handlePaymentNext = () => {
    setCurrentStep(4);
  };

  const handleComplete = () => {
    console.log("Onboarding complete, navigating to dashboard");
  };

  return (
    <OnboardingLayout currentStep={currentStep}>
      {currentStep === 1 && <OrgDetailsForm onNext={handleOrgNext} />}
      {currentStep === 2 && (
        <PlanSelectionForm
          onNext={handlePlanNext}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && (
        <PaymentForm
          onNext={handlePaymentNext}
          onBack={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 4 && <OnboardingComplete onContinue={handleComplete} />}
    </OnboardingLayout>
  );
}
