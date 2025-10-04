import { DashboardHeader } from '../DashboardHeader';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardHeaderExample() {
  return (
    <SidebarProvider>
      <DashboardHeader 
        onSearch={(q) => console.log('Search:', q)}
        onDateRangeChange={(from, to) => console.log('Date range:', from, to)}
        onExport={() => console.log('Export triggered')}
      />
    </SidebarProvider>
  );
}
