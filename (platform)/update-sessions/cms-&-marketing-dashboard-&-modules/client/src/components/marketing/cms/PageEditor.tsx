import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Eye, Settings as SettingsIcon, Layout, Smartphone, Monitor } from "lucide-react";
import { useState } from "react";

export default function PageEditor() {
  const [title, setTitle] = useState("New Landing Page");
  const [slug, setSlug] = useState("new-landing-page");
  const [metaDescription, setMetaDescription] = useState("");
  const [content, setContent] = useState("");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="space-y-4" data-testid="section-page-editor">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Page Editor</CardTitle>
              <CardDescription>Create and customize your landing pages</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" data-testid="button-preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button data-testid="button-save-page">
                <Save className="h-4 w-4 mr-2" />
                Save Page
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Content</CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant={viewMode === "desktop" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("desktop")}
                    data-testid="button-view-desktop"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "mobile" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("mobile")}
                    data-testid="button-view-mobile"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md min-h-[400px] p-4 bg-muted/30">
                <div className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed rounded-md">
                    <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop blocks here to build your page
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Add Block
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Page Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="page-title">Page Title</Label>
                    <Input
                      id="page-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      data-testid="input-page-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="page-slug">URL Slug</Label>
                    <Input
                      id="page-slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      data-testid="input-page-slug"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="seo" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <Textarea
                      id="meta-description"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Brief description for search engines..."
                      rows={3}
                      data-testid="input-meta-description"
                    />
                    <p className="text-xs text-muted-foreground">
                      {metaDescription.length}/160 characters
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Block Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Hero Section", "Featured Listings", "Agent Bio", "Call to Action", "Testimonials"].map(
                  (block) => (
                    <Button
                      key={block}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => console.log("Add block:", block)}
                      data-testid={`button-add-${block.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Layout className="h-4 w-4 mr-2" />
                      {block}
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
