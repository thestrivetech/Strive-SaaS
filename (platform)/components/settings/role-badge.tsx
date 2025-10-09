import { Badge } from '@/components/ui/badge';
import { Shield, UserCheck, Eye } from 'lucide-react';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

interface RoleBadgeProps {
  role: Role;
  showIcon?: boolean;
}

export function RoleBadge({ role, showIcon = true }: RoleBadgeProps) {
  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'OWNER':
        return <Shield className="h-4 w-4 text-amber-500" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'MEMBER':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'VIEWER':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'OWNER':
        return 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20';
      case 'ADMIN':
        return 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20';
      case 'MEMBER':
        return 'bg-green-500/10 text-green-700 hover:bg-green-500/20';
      case 'VIEWER':
        return 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20';
      default:
        return '';
    }
  };

  return (
    <Badge variant="outline" className={getRoleBadgeColor(role)}>
      {showIcon && <span className="mr-1">{getRoleIcon(role)}</span>}
      {role}
    </Badge>
  );
}
