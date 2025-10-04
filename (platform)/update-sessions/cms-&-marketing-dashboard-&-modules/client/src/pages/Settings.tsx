import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";

export default function Settings() {
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
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
                    <Input id="name" defaultValue="Sarah Johnson" data-testid="input-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="sarah@realestate.com"
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" defaultValue="Elite Realty Group" data-testid="input-company" />
                  </div>
                  <Button data-testid="button-save-profile">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
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
                  {[
                    { name: "Mailchimp", connected: true },
                    { name: "Facebook", connected: true },
                    { name: "Instagram", connected: false },
                    { name: "LinkedIn", connected: true },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <span className="font-medium">{integration.name}</span>
                      {integration.connected ? (
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      ) : (
                        <Button size="sm">Connect</Button>
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
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure your notification preferences for campaigns and analytics
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
