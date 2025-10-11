import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { type ConnectionStatus as ConnectionStatusType } from '@/lib/modules/connections/schemas';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const statusConfig = {
    CONNECTED: {
      label: 'Connected',
      icon: CheckCircle,
      className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    },
    DISCONNECTED: {
      label: 'Disconnected',
      icon: XCircle,
      className: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
    },
    ERROR: {
      label: 'Error',
      icon: AlertCircle,
      className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    },
    EXPIRED: {
      label: 'Expired',
      icon: Clock,
      className: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
