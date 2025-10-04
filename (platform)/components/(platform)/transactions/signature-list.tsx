import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export function SignatureList({ requestId }: { requestId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Signatures</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Signature list will display individual signatures for this request.
        </p>
      </CardContent>
    </Card>
  );
}
