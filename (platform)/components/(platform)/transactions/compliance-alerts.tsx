'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ComplianceAlert } from '@/lib/modules/compliance';
import {
  getAlertIcon,
  getAlertColor,
  getAlertAction,
  sortAlertsByPriority,
} from '@/lib/modules/compliance';
import * as Icons from 'lucide-react';
import Link from 'next/link';

interface ComplianceAlertsProps {
  alerts: ComplianceAlert[];
  title?: string;
  description?: string;
  maxHeight?: string;
  showActions?: boolean;
}

export function ComplianceAlerts({
  alerts,
  title = 'Compliance Alerts',
  description,
  maxHeight = '500px',
  showActions = true,
}: ComplianceAlertsProps) {
  const sortedAlerts = sortAlertsByPriority(alerts);

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50">
            <Icons.CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">All Clear!</AlertTitle>
            <AlertDescription className="text-green-700">
              No compliance issues detected. All transactions are in good standing.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Badge variant="destructive" className="h-6">
            {alerts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-4" style={{ maxHeight }}>
          <div className="space-y-3">
            {sortedAlerts.map((alert) => (
              <ComplianceAlertItem
                key={alert.id}
                alert={alert}
                showAction={showActions}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ComplianceAlertItem({
  alert,
  showAction,
}: {
  alert: ComplianceAlert;
  showAction: boolean;
}) {
  const iconName = getAlertIcon(alert.type);
  const colors = getAlertColor(alert.severity);
  const actionText = getAlertAction(alert);

  // Get the icon component dynamically
  const Icon = (Icons as any)[toPascalCase(iconName)] || Icons.AlertCircle;

  return (
    <Alert className={`${colors.bg} ${colors.border}`}>
      <Icon className={`h-4 w-4 ${colors.icon}`} />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <AlertTitle className={colors.text}>
              <div className="flex items-center gap-2">
                {alert.message}
                <Badge
                  variant="outline"
                  className={`text-xs ${colors.border} ${colors.text}`}
                >
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
            </AlertTitle>
            {alert.details && (
              <AlertDescription className={`mt-1 ${colors.text} opacity-80`}>
                {formatAlertDetails(alert)}
              </AlertDescription>
            )}
          </div>
          {showAction && (
            <Button
              size="sm"
              variant="outline"
              className={`flex-shrink-0 ${colors.border}`}
              asChild
            >
              <Link href={`/transactions/${alert.loopId}`}>{actionText}</Link>
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

/**
 * Format alert details for display
 */
function formatAlertDetails(alert: ComplianceAlert): string {
  const { details } = alert;
  if (!details) return '';

  const parts: string[] = [];

  if (details.role) {
    parts.push(`Role: ${details.role}`);
  }

  if (details.category) {
    parts.push(`Category: ${details.category}`);
  }

  if (details.count) {
    parts.push(`Count: ${details.count}`);
  }

  if (details.priority) {
    parts.push(`Priority: ${details.priority}`);
  }

  if (details.expiredAt) {
    parts.push(`Expired: ${new Date(details.expiredAt).toLocaleDateString()}`);
  }

  return parts.join(' • ');
}

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
