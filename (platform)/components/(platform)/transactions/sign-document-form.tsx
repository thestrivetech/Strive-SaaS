'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { signDocument, declineSignature } from '@/lib/modules/signatures';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Pen, X } from 'lucide-react';

interface SignDocumentFormProps {
  signature: any; // Type from getSignatureById
}

export function SignDocumentForm({ signature }: SignDocumentFormProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [showDecline, setShowDecline] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSign() {
    if (!signatureData) {
      toast({
        title: 'Signature required',
        description: 'Please draw your signature before submitting',
        variant: 'destructive',
      });
      return;
    }

    setIsSigning(true);
    try {
      await signDocument({
        signatureId: signature.id,
        signatureData,
        authMethod: 'EMAIL',
      });
      toast({
        title: 'Document signed',
        description: 'Your signature has been recorded successfully.',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Signing failed',
        description: error instanceof Error ? error.message : 'Failed to sign document',
        variant: 'destructive',
      });
    } finally {
      setIsSigning(false);
    }
  }

  async function handleDecline() {
    if (!declineReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for declining',
        variant: 'destructive',
      });
      return;
    }

    setIsDeclining(true);
    try {
      await declineSignature({
        signatureId: signature.id,
        reason: declineReason,
      });
      toast({
        title: 'Signature declined',
        description: 'You have declined to sign this document.',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Decline failed',
        description: error instanceof Error ? error.message : 'Failed to decline signature',
        variant: 'destructive',
      });
    } finally {
      setIsDeclining(false);
    }
  }

  const handleCanvasClick = () => {
    // Simplified signature capture - in real app would use canvas drawing
    setSignatureData(`data:image/png;base64,signature-${Date.now()}`);
    toast({
      title: 'Signature captured',
      description: 'Your signature has been recorded.',
    });
  };

  return (
    <div className="space-y-4">
      {!showDecline ? (
        <Card>
          <CardHeader>
            <CardTitle>Sign Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Draw your signature</Label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors mt-2"
                onClick={handleCanvasClick}
              >
                <Pen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {signatureData ? 'Signature captured - click to re-sign' : 'Click to add signature'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSign} disabled={isSigning} className="flex-1">
                {isSigning ? 'Signing...' : 'Sign Document'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDecline(true)}
                disabled={isSigning}
              >
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Decline Signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for declining *</Label>
              <Textarea
                id="reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Please provide a reason for declining to sign..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={isDeclining}
                className="flex-1"
              >
                {isDeclining ? 'Declining...' : 'Confirm Decline'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDecline(false)}
                disabled={isDeclining}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
