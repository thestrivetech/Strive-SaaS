import { PaymentForm } from "../PaymentForm";

export default function PaymentFormExample() {
  return (
    <PaymentForm 
      onNext={() => console.log("Payment submitted")}
      onBack={() => console.log("Going back")}
    />
  );
}
