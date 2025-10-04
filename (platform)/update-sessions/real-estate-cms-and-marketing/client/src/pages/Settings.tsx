import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    name: "Sarah Johnson",
    email: "sarah@realestate.com",
    company: "Elite Realty Group",
  });

  const [notifications, setNotifications] = useState({
    emailCampaigns: true,
    campaignUpdates: true,
    analyticsReports: false,
    systemAlerts: true,
  });

  const handleSaveProfile = () => {
    toast({
      title: "Success",
      description: "Profile settings saved successfully",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Success",
      description: "Notification preferences saved",
    });
  };

  const integrations = [
    { name: "Mailchimp", connected: true, testId: "mailchimp" },
    { name: "Facebook", connected: true, testId: "facebook" },
    { name: "Instagram", connected: false, testId: "instagram" },
    { name: "LinkedIn", connected: true, testId: "linkedin" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and platform preferences
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="profile" data-testid="tabs-settings">
            <TabsList>
              <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences" data-testid="tab-preferences">Preferences</TabsTrigger>
              <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
              <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      data-testid="input-company"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} data-testid="button-save-profile">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how the platform looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark mode
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleTheme}
                      data-testid="button-toggle-theme"
                    >
                      {theme === "light" ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current theme: <span className="font-medium capitalize" data-testid="text-current-theme">{theme}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Integrations</CardTitle>
                  <CardDescription>Connect your marketing tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {integrations.map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center justify-between p-3 border rounded-md"
                      data-testid={`integration-${integration.testId}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{integration.name}</span>
                        {integration.connected && (
                          <span className="text-xs text-muted-foreground" data-testid={`status-${integration.testId}`}>
                            Connected
                          </span>
                        )}
                      </div>
                      {integration.connected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast({
                            title: "Disconnected",
                            description: `${integration.name} has been disconnected`,
                          })}
                          data-testid={`button-disconnect-${integration.testId}`}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => toast({
                            title: "Connected",
                            description: `${integration.name} has been connected`,
                          })}
                          data-testid={`button-connect-${integration.testId}`}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-campaigns">Email Campaign Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when campaigns are sent
                      </p>
                    </div>
                    <Switch
                      id="email-campaigns"
                      checked={notifications.emailCampaigns}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailCampaigns: checked })
                      }
                      data-testid="switch-email-campaigns"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="campaign-updates">Campaign Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates on campaign performance
                      </p>
                    </div>
                    <Switch
                      id="campaign-updates"
                      checked={notifications.campaignUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, campaignUpdates: checked })
                      }
                      data-testid="switch-campaign-updates"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics-reports">Weekly Analytics Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Get weekly performance summaries
                      </p>
                    </div>
                    <Switch
                      id="analytics-reports"
                      checked={notifications.analyticsReports}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, analyticsReports: checked })
                      }
                      data-testid="switch-analytics-reports"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="system-alerts">System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Important platform notifications
                      </p>
                    </div>
                    <Switch
                      id="system-alerts"
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, systemAlerts: checked })
                      }
                      data-testid="switch-system-alerts"
                    />
                  </div>

                  <Button onClick={handleSaveNotifications} data-testid="button-save-notifications">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
