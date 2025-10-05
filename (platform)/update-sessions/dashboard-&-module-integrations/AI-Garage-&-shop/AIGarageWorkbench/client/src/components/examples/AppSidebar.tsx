import { AppSidebar } from "../AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Sidebar Navigation</h2>
          <p className="text-muted-foreground">Click the menu items to navigate</p>
        </div>
      </div>
    </SidebarProvider>
  );
}
