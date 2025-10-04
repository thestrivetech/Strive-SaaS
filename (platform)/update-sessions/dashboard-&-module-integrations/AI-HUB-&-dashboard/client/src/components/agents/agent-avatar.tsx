import { cn } from "@/lib/utils";

interface AgentAvatarProps {
  agent: {
    id: string;
    name: string;
    avatar?: string | null;
    status?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-20 h-20 text-lg'
};

const gradients = [
  'from-primary to-accent',
  'from-neon-violet to-neon-green',
  'from-chart-4 to-chart-5',
  'from-accent to-primary',
  'from-neon-green to-neon-violet'
];

export default function AgentAvatar({ agent, size = 'md', showStatus = false, className }: AgentAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getGradient = (id: string) => {
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-neon-green';
      case 'BUSY':
        return 'bg-primary';
      case 'IDLE':
        return 'bg-chart-4';
      case 'OFFLINE':
        return 'bg-muted-foreground';
      default:
        return 'bg-neon-green';
    }
  };

  return (
    <div className={cn("relative inline-flex", className)} data-testid={`agent-avatar-${agent.id}`}>
      {agent.avatar ? (
        <img 
          src={agent.avatar} 
          alt={agent.name}
          className={cn(
            "rounded-full object-cover border-2 border-background",
            sizeClasses[size]
          )}
        />
      ) : (
        <div 
          className={cn(
            "rounded-full bg-gradient-to-br flex items-center justify-center font-bold border-2 border-background",
            sizeClasses[size],
            `bg-gradient-to-br ${getGradient(agent.id)}`
          )}
          data-testid={`agent-initials-${agent.id}`}
        >
          {getInitials(agent.name)}
        </div>
      )}
      
      {showStatus && agent.status && (
        <div 
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
            getStatusColor(agent.status),
            size === 'sm' && "w-2 h-2",
            size === 'lg' && "w-4 h-4",
            size === 'xl' && "w-5 h-5"
          )}
          data-testid={`agent-status-${agent.id}`}
        />
      )}
    </div>
  );
}
