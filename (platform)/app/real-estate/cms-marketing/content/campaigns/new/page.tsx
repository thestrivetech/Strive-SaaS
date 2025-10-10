'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { createCampaign } from '@/lib/modules/content/campaigns';
import { useToast } from '@/hooks/use-toast';

const CAMPAIGN_TYPES = [
  { value: 'CONTENT_MARKETING', label: 'Content Marketing' },
  { value: 'EMAIL_MARKETING', label: 'Email Marketing' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'PAID_ADVERTISING', label: 'Paid Advertising' },
  { value: 'SEO_CAMPAIGN', label: 'SEO Campaign' },
  { value: 'LEAD_GENERATION', label: 'Lead Generation' },
  { value: 'BRAND_AWARENESS', label: 'Brand Awareness' },
  { value: 'PRODUCT_LAUNCH', label: 'Product Launch' },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      type: 'CONTENT_MARKETING',
      status: 'DRAFT',
      timezone: 'UTC',
    },
  });

  async function onSubmit(data: any) {
    setIsSaving(true);
    try {
      // Get organizationId from user session (should be available in client context)
      const organizationId = ''; // This will be set from session context

      const campaign = await createCampaign({
        ...data,
        startDate,
        endDate,
        organizationId,
      });

      toast({
        title: 'Campaign created',
        description: 'Your campaign has been created successfully',
      });

      router.push(`/real-estate/cms-marketing/content/campaigns`);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create campaign',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">New Campaign</h1>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Creating...' : 'Create Campaign'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Q4 Product Launch Campaign"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {String(form.formState.errors.name.message)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Describe your campaign goals and strategy..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="type">Campaign Type *</Label>
            <Select
              defaultValue="CONTENT_MARKETING"
              onValueChange={(value) => form.setValue('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start mt-2">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start mt-2">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="budget">Budget (Optional)</Label>
            <Input
              id="budget"
              type="number"
              {...form.register('budget', { valueAsNumber: true })}
              placeholder="5000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goalType">Goal Type (Optional)</Label>
              <Input
                id="goalType"
                {...form.register('goalType')}
                placeholder="e.g., Leads, Sales, Engagement"
              />
            </div>

            <div>
              <Label htmlFor="goalValue">Goal Value (Optional)</Label>
              <Input
                id="goalValue"
                type="number"
                {...form.register('goalValue', { valueAsNumber: true })}
                placeholder="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
