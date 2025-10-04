import { db } from "./db";
import { users, dashboardSettings, kpiMetrics, activities, notifications } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Create default user
  const [defaultUser] = await db.insert(users).values({
    username: "alex.morgan",
    password: "password",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@realestate.com",
    role: "admin",
  }).returning();

  console.log("Created default user:", defaultUser.username);

  // Create dashboard settings
  await db.insert(dashboardSettings).values({
    userId: defaultUser.id,
    layout: null,
    theme: "dark",
    accentColor: "#00D2FF",
    favorites: ["crm", "analytics", "calendar"],
  });

  console.log("Created dashboard settings");

  // Create sample KPI metrics
  await db.insert(kpiMetrics).values([
    {
      name: "Revenue MTD",
      value: "$847K",
      change: 23,
      changeType: "percentage",
      icon: "trending-up",
      color: "#00D2FF",
    },
    {
      name: "New Leads Today",
      value: "47",
      change: 12,
      changeType: "absolute",
      icon: "users",
      color: "#39FF14",
    },
    {
      name: "Deals Closed",
      value: "12",
      change: 2.3,
      changeType: "absolute",
      icon: "check-circle",
      color: "#8B5CF6",
    },
    {
      name: "Expense Saved",
      value: "$34K",
      change: 15,
      changeType: "percentage",
      icon: "dollar-sign",
      color: "#00D2FF",
    },
  ]);

  console.log("Created KPI metrics");

  // Create sample activities
  await db.insert(activities).values([
    {
      userId: defaultUser.id,
      type: "deal_closed",
      title: "Deal closed",
      description: "Sarah Chen closed a deal worth $450K",
      icon: "user",
      color: "#00D2FF",
      amount: "$450K",
    },
    {
      userId: defaultUser.id,
      type: "lead_added",
      title: "New lead added",
      description: "New lead Marcus Rivera added to pipeline",
      icon: "user-plus",
      color: "#39FF14",
      amount: null,
    },
    {
      userId: defaultUser.id,
      type: "payment_received",
      title: "Payment received",
      description: "Payment of $125K received from Acme Corp",
      icon: "dollar-sign",
      color: "#8B5CF6",
      amount: "$125K",
    },
  ]);

  console.log("Created activities");

  // Create sample notifications
  await db.insert(notifications).values([
    {
      userId: defaultUser.id,
      title: "New Lead",
      message: "High-value lead from LinkedIn campaign",
      type: "success",
      read: false,
    },
    {
      userId: defaultUser.id,
      title: "Deal Update",
      message: "TechStart Inc deal moved to negotiation stage",
      type: "info",
      read: false,
    },
    {
      userId: defaultUser.id,
      title: "Payment Reminder",
      message: "Follow up on pending payment from Global Corp",
      type: "warning",
      read: false,
    },
  ]);

  console.log("Created notifications");
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
