import { Map, BarChart3, Users, GraduationCap, TrendingUp, Calculator, FileText, Bell, Download } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const modules = [
  { title: "Heatmap", icon: Map, id: "heatmap" },
  { title: "Demographics", icon: Users, id: "demographics" },
  { title: "Schools & Amenities", icon: GraduationCap, id: "amenities" },
  { title: "Comparative Trends", icon: TrendingUp, id: "trends" },
  { title: "ROI Simulator", icon: Calculator, id: "roi" },
  { title: "AI Profiles", icon: FileText, id: "ai-profiles" },
  { title: "Alerts", icon: Bell, id: "alerts" },
  { title: "Export", icon: Download, id: "export" },
];

interface DashboardSidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
}

export function DashboardSidebar({ activeModule, onModuleChange }: DashboardSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">
            Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((module) => (
                <SidebarMenuItem key={module.id}>
                  <SidebarMenuButton
                    onClick={() => onModuleChange(module.id)}
                    isActive={activeModule === module.id}
                    data-testid={`sidebar-module-${module.id}`}
                  >
                    <module.icon className="w-5 h-5" />
                    <span>{module.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
