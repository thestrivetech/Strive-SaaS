import { OnboardingComplete } from "../OnboardingComplete";

export default function OnboardingCompleteExample() {
  return (
    <OnboardingComplete 
      onContinue={() => console.log("Continuing to dashboard")}
    />
  );
}
