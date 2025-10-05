import { ProgressStepper } from "../ProgressStepper";

export default function ProgressStepperExample() {
  const steps = [
    { id: 1, title: "Organization" },
    { id: 2, title: "Plan" },
    { id: 3, title: "Payment" },
    { id: 4, title: "Complete" }
  ];

  return <ProgressStepper steps={steps} currentStep={2} />;
}
