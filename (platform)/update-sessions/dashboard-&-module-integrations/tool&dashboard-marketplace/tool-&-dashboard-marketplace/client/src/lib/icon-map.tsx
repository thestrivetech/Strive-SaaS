import {
  MessageSquare,
  Calendar,
  Phone,
  Video,
  Mic,
  Bot,
  CheckCircle,
  FileText,
  Percent,
  TrendingUp,
  DollarSign,
  Flag,
  Share2,
  Users,
  Edit,
  Repeat,
  BarChart2,
  PieChart,
  Activity,
  Sliders,
  Shield,
  LineChart,
  LucideIcon
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  MessageSquare,
  Calendar,
  Phone,
  Video,
  Mic,
  Bot,
  CheckCircle,
  FileText,
  Percent,
  TrendingUp,
  DollarSign,
  Flag,
  Share2,
  Users,
  Edit,
  Repeat,
  BarChart2,
  PieChart,
  Activity,
  Sliders,
  Shield,
  LineChart
};

export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || MessageSquare;
}
