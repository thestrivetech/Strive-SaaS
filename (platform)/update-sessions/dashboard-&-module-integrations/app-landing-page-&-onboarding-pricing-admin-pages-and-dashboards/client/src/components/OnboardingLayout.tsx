import { ProgressStepper } from "./ProgressStepper";
import { ThemeToggle } from "./ThemeToggle";

interface OnboardingLayoutProps {
  currentStep: number;
  children: React.ReactNode;
}

const steps = [
  { id: 1, title: "Organization" },
  { id: 2, title: "Plan" },
  { id: 3, title: "Payment" },
  { id: 4, title: "Complete" }
];

export function OnboardingLayout({ currentStep, children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Strive Tech</h1>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <ProgressStepper steps={steps} currentStep={currentStep} />
          
          <div className="mt-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
