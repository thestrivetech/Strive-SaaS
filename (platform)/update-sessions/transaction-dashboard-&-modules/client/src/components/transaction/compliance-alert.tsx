import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

export type AlertType = "error" | "warning" | "info" | "success";

export interface ComplianceAlertProps {
  type: AlertType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const alertConfig = {
  error: {
    icon: XCircle,
    className: "border-destructive/50 text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-[hsl(38,92%,50%)]/50 text-[hsl(38,92%,50%)]",
  },
  info: {
    icon: Info,
    className: "border-primary/50 text-primary",
  },
  success: {
    icon: CheckCircle,
    className: "border-[hsl(142,71%,45%)]/50 text-[hsl(142,71%,45%)]",
  },
};

export default function ComplianceAlert({ type, title, message, actionLabel, onAction }: ComplianceAlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <Alert className={config.className} data-testid={`alert-${type}`}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm">{message}</p>
        {actionLabel && onAction && (
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={onAction}
            data-testid="button-alert-action"
          >
            {actionLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
