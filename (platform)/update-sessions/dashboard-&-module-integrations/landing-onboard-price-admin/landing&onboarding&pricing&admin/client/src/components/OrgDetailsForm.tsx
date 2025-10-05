import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OrgDetailsFormProps {
  onNext: (data: { name: string; website: string; description: string }) => void;
}

export function OrgDetailsForm({ onNext }: OrgDetailsFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-semibold mb-2">Organization Details</h2>
      <p className="text-muted-foreground mb-6">Tell us about your organization</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="org-name">Organization Name *</Label>
          <Input
            id="org-name"
            placeholder="Acme Inc."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            data-testid="input-org-name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://acme.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            data-testid="input-website"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of your organization"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            data-testid="input-description"
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" data-testid="button-next">
            Next
          </Button>
        </div>
      </form>
    </Card>
  );
}
