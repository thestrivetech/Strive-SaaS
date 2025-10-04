import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";

interface PaymentFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function PaymentForm({ onNext, onBack }: PaymentFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold">Payment Information</h2>
          <p className="text-sm text-muted-foreground">Secure payment processing</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="card-number">Card Number</Label>
          <Input
            id="card-number"
            placeholder="1234 5678 9012 3456"
            data-testid="input-card-number"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              placeholder="MM/YY"
              data-testid="input-expiry"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              placeholder="123"
              data-testid="input-cvc"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cardholder">Cardholder Name</Label>
          <Input
            id="cardholder"
            placeholder="John Doe"
            data-testid="input-cardholder"
          />
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" type="button" onClick={onBack} data-testid="button-back">
            Back
          </Button>
          <Button type="submit" data-testid="button-complete">
            Complete Setup
          </Button>
        </div>
      </form>
    </Card>
  );
}
