import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-[600px] w-full">
        <AppSidebar />
        <div className="flex-1 p-4 bg-background">
          <h2 className="text-lg font-semibold">Main Content Area</h2>
          <p className="text-sm text-muted-foreground mt-2">
            The sidebar shows navigation for the marketing dashboard.
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}
