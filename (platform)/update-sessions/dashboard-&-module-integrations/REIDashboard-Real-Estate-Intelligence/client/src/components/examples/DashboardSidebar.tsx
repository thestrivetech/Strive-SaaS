import { DashboardSidebar } from '../DashboardSidebar';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardSidebarExample() {
  return (
    <SidebarProvider>
      <DashboardSidebar 
        activeModule="heatmap" 
        onModuleChange={(id) => console.log('Module changed:', id)} 
      />
    </SidebarProvider>
  );
}
