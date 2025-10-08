import { useWebSocket } from '@/hooks/useWebSocket';
import { Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export function WebSocketStatus() {
  const { isConnected, lastUpdate } = useWebSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (lastUpdate?.type === 'workflow_completed') {
      toast({
        title: 'Workflow Completed',
        description: `Workflow execution finished successfully`,
      });
    } else if (lastUpdate?.type === 'workflow_failed') {
      toast({
        title: 'Workflow Failed',
        description: lastUpdate.data?.error || 'Workflow execution failed',
        variant: 'destructive',
      });
    }
  }, [lastUpdate, toast]);

  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border"
      data-testid="websocket-status"
    >
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500 dark:text-green-400" />
          <span className="text-xs text-muted-foreground">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500 dark:text-red-400" />
          <span className="text-xs text-muted-foreground">Offline</span>
        </>
      )}
    </div>
  );
}
