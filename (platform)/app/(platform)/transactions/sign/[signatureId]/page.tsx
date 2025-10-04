import { getSignatureById } from '@/lib/modules/signatures';
import { SignDocumentForm } from '@/components/(platform)/transactions/sign-document-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { FileText, MapPin } from 'lucide-react';

export default async function SigningPage({
  params,
}: {
  params: { signatureId: string };
}) {
  let signature;
  try {
    signature = await getSignatureById(params.signatureId);
  } catch (error) {
    notFound();
  }

  const isExpired = signature.request.expires_at &&
    new Date(signature.request.expires_at) < new Date();
  const isAlreadySigned = signature.status === 'SIGNED';
  const isDeclined = signature.status === 'DECLINED';

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Signature Request</CardTitle>
            <Badge variant={
              isAlreadySigned ? 'default' :
              isDeclined ? 'destructive' :
              isExpired ? 'secondary' : 'outline'
            }>
              {isAlreadySigned ? 'Signed' :
               isDeclined ? 'Declined' :
               isExpired ? 'Expired' : 'Pending'}
            </Badge>
          </div>
          <CardDescription>{signature.request.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{signature.request.loop.property_address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{signature.document.original_name}</span>
          </div>
          {signature.request.message && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm">{signature.request.message}</p>
            </div>
          )}
          {isExpired && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
              <p className="text-sm font-medium">This signature request has expired.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isAlreadySigned && !isDeclined && !isExpired && (
        <SignDocumentForm signature={signature} />
      )}

      {isAlreadySigned && signature.signed_at && (
        <Card>
          <CardHeader>
            <CardTitle>Document Signed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Signed by {signature.signer.name} on {new Date(signature.signed_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
