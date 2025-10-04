import { PlanSelectionForm } from "../PlanSelectionForm";

export default function PlanSelectionFormExample() {
  return (
    <PlanSelectionForm 
      onNext={(tier) => console.log("Selected tier:", tier)}
      onBack={() => console.log("Going back")}
    />
  );
}
