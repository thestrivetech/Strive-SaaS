import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { SubscriptionChart } from "@/components/SubscriptionChart";
import { RevenueChart } from "@/components/RevenueChart";
import { DataTable } from "@/components/DataTable";
import { TierBadge } from "@/components/TierBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Building2, Users, DollarSign, Activity, LayoutDashboard, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Organizations", url: "/admin/organizations", icon: Building2 },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: DollarSign },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export default function AdminDashboard() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  const orgColumns = [
    { header: "Organization", accessor: "name" as const },
    { 
      header: "Tier", 
      accessor: "tier" as const,
      cell: (value: any) => <TierBadge tier={value} />
    },
    { header: "Users", accessor: "users" as const },
    { 
      header: "Status", 
      accessor: "status" as const,
      cell: (value: any) => <StatusBadge status={value} />
    },
  ];

  const orgData = [
    { id: "1", name: "Acme Corporation", tier: "ENTERPRISE", users: 150, status: "ACTIVE" },
    { id: "2", name: "Tech Innovators Inc", tier: "GROWTH", users: 45, status: "ACTIVE" },
    { id: "3", name: "Startup Hub", tier: "STARTER", users: 8, status: "TRIALING" },
    { id: "4", name: "Global Solutions Ltd", tier: "ELITE", users: 75, status: "ACTIVE" },
    { id: "5", name: "Digital Ventures", tier: "GROWTH", users: 32, status: "PAST_DUE" },
  ];

  const subscriptionData = [
    { name: "STARTER", value: 45 },
    { name: "GROWTH", value: 30 },
    { name: "ELITE", value: 15 },
    { name: "ENTERPRISE", value: 10 }
  ];

  const revenueData = [
    { month: "Jan", revenue: 32000 },
    { month: "Feb", revenue: 35000 },
    { month: "Mar", revenue: 38000 },
    { month: "Apr", revenue: 42000 },
    { month: "May", revenue: 45000 },
    { month: "Jun", revenue: 48000 }
  ];

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.title.toLowerCase())}
                        isActive={activeTab === item.title.toLowerCase()}
                        data-testid={`link-${item.title.toLowerCase()}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <h1 className="text-2xl font-bold">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Organizations"
                    value="1,234"
                    icon={Building2}
                    trend={{ value: 12, isPositive: true }}
                  />
                  <StatCard
                    title="Active Users"
                    value="5,678"
                    icon={Users}
                    trend={{ value: 8, isPositive: true }}
                  />
                  <StatCard
                    title="Monthly Revenue"
                    value="$48,000"
                    icon={DollarSign}
                    trend={{ value: 15, isPositive: true }}
                  />
                  <StatCard
                    title="System Health"
                    value="99.8%"
                    icon={Activity}
                    trend={{ value: 0.2, isPositive: true }}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SubscriptionChart data={subscriptionData} />
                  <RevenueChart data={revenueData} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Recent Organizations</h2>
                  <DataTable
                    columns={orgColumns}
                    data={orgData}
                    actions={(row) => [
                      { label: "View Details", onClick: () => console.log("View", row.id) },
                      { label: "Edit", onClick: () => console.log("Edit", row.id) },
                      { label: "Suspend", onClick: () => console.log("Suspend", row.id) },
                    ]}
                  />
                </div>
              </div>
            )}

            {activeTab === "organizations" && (
              <DataTable
                columns={orgColumns}
                data={orgData}
                actions={(row) => [
                  { label: "View Details", onClick: () => console.log("View", row.id) },
                  { label: "Edit", onClick: () => console.log("Edit", row.id) },
                  { label: "Suspend", onClick: () => console.log("Suspend", row.id) },
                ]}
              />
            )}

            {activeTab !== "dashboard" && activeTab !== "organizations" && (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content coming soon
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
