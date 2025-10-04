import { OrgDetailsForm } from "../OrgDetailsForm";

export default function OrgDetailsFormExample() {
  return (
    <OrgDetailsForm 
      onNext={(data) => console.log("Organization details submitted:", data)}
    />
  );
}
