'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  downloadInvoice,
  cancelSubscription,
} from '@/lib/modules/settings';
import { CreditCard, Download, AlertTriangle } from 'lucide-react';

interface Subscription {
  tier: string;
  status: string;
  billingCycle: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  seats: number;
  price: number;
}

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: string;
  pdfUrl: string;
}

interface BillingSettingsFormProps {
  subscription: Subscription;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
}

export function BillingSettingsForm({
  subscription,
  paymentMethods,
  invoices,
}: BillingSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleChangePlan = () => {
    startTransition(async () => {
      // TODO: Open plan selection dialog
      toast({
        title: 'Plan selection',
        description: 'Plan selection dialog coming soon',
      });
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    startTransition(async () => {
      const result = await downloadInvoice({ invoiceId });

      if (result.success) {
        toast({
          title: 'Invoice ready',
          description: result.message,
        });
        // In real implementation, would open PDF in new tab
        // window.open(result.pdfUrl, '_blank');
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  const handleCancelSubscription = () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    startTransition(async () => {
      const result = await cancelSubscription();

      if (result.success) {
        toast({
          title: 'Subscription canceled',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription tier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{subscription.tier} Plan</p>
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                ${subscription.price}/month · {subscription.seats} seats
              </p>
            </div>
            <Button onClick={handleChangePlan} disabled={isPending}>
              Change Plan
            </Button>
          </div>

          <div className="text-sm">
            <p className="text-muted-foreground">
              Next billing date: {subscription.currentPeriodEnd.toLocaleDateString()}
            </p>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <p>Subscription will be canceled at the end of the billing period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((pm) => (
            <div key={pm.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5" />
                <div>
                  <p className="font-medium">
                    {pm.card.brand.toUpperCase()} •••• {pm.card.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {pm.card.expiryMonth}/{pm.card.expiryYear}
                  </p>
                </div>
                {pm.isDefault && (
                  <Badge variant="outline">Default</Badge>
                )}
              </div>
              <Button variant="outline" disabled={isPending}>
                Update
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invoices Card */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    ${(invoice.amount / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.date.toLocaleDateString()} · {invoice.status}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadInvoice(invoice.id)}
                  disabled={isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Cancel Subscription</CardTitle>
          <CardDescription>
            Cancel your subscription. You will retain access until the end of your billing period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleCancelSubscription}
            disabled={isPending || subscription.cancelAtPeriodEnd}
          >
            {subscription.cancelAtPeriodEnd ? 'Cancellation Scheduled' : 'Cancel Subscription'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
