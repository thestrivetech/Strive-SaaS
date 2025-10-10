import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, FileText, CheckSquare, Users, BarChart3, Settings, HelpCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

const navigationItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Transactions", icon: FileText, path: "/transactions" },
  { title: "Documents", icon: FileText, path: "/documents" },
  { title: "Tasks", icon: CheckSquare, path: "/tasks" },
  { title: "Parties", icon: Users, path: "/parties" },
  { title: "Analytics", icon: BarChart3, path: "/analytics" },
];

const bottomItems = [
  { title: "Settings", icon: Settings, path: "/settings" },
  { title: "Help", icon: HelpCircle, path: "/help" },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">RealtyFlow</span>
            <span className="text-xs text-muted-foreground">Transaction Platform</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location === item.path} data-testid={`nav-${item.title.toLowerCase()}`}>
                    <Link href={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location === item.path}>
                    <Link href={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Real Estate Agent</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
