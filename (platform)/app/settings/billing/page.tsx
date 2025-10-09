import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { CreditCard, Download } from 'lucide-react';

export default async function BillingPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing Settings</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {user?.subscription_tier === 'FREE' ? 'Free Plan' :
                   user?.subscription_tier === 'STARTER' ? 'Starter Plan' :
                   user?.subscription_tier === 'GROWTH' ? 'Growth Plan' :
                   user?.subscription_tier === 'ELITE' ? 'Elite Plan' :
                   'Enterprise Plan'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.subscription_tier === 'FREE' ? 'Basic features' :
                   user?.subscription_tier === 'STARTER' ? '$299/month per seat' :
                   user?.subscription_tier === 'GROWTH' ? '$699/month per seat' :
                   user?.subscription_tier === 'ELITE' ? '$999/month per seat' :
                   'Custom pricing'}
                </p>
              </div>
              {/* TODO: Phase 2.3 - Connect to Stripe for plan changes */}
              <Button variant="outline">Change Plan</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/24</p>
                </div>
              </div>
            </div>
            {/* TODO: Phase 2.3 - Connect to Stripe for payment method updates */}
            <Button variant="outline" className="w-full">
              Update Payment Method
            </Button>
          </div>

          <div>
            {/* TODO: Phase 2.3 - Connect to Stripe for invoice downloads */}
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Invoices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
