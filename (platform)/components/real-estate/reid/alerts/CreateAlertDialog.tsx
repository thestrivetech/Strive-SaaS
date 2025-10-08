'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertType, AlertFrequency } from '@prisma/client';
import { createPropertyAlert } from '@/lib/modules/reid/alerts/actions';

interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAlertDialog({ open, onOpenChange }: CreateAlertDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    alertType: 'PRICE_DROP' as AlertType,
    areaCodes: [] as string[],
    frequency: 'DAILY' as AlertFrequency,
    emailEnabled: true,
    smsEnabled: false,
    criteria: { threshold: 0 }
  });

  const { data: insights } = useQuery({
    queryKey: ['neighborhood-insights'],
    queryFn: async () => {
      const response = await fetch('/api/v1/reid/insights');
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: createPropertyAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-alerts'] });
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        alertType: 'PRICE_DROP' as AlertType,
        areaCodes: [],
        frequency: 'DAILY' as AlertFrequency,
        emailEnabled: true,
        smsEnabled: false,
        criteria: { threshold: 0 }
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      organizationId: '', // Required by schema but set by server action
      isActive: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Property Alert</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Alert Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-900 border-slate-600"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-900 border-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alert Type</Label>
              <Select
                value={formData.alertType}
                onValueChange={(value: AlertType) => setFormData({ ...formData, alertType: value })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="PRICE_DROP">Price Drop</SelectItem>
                  <SelectItem value="PRICE_INCREASE">Price Increase</SelectItem>
                  <SelectItem value="NEW_LISTING">New Listing</SelectItem>
                  <SelectItem value="INVENTORY_CHANGE">Inventory Change</SelectItem>
                  <SelectItem value="MARKET_TREND">Market Trend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: AlertFrequency) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Monitor Areas</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-900 rounded border border-slate-600">
              {insights?.insights?.map((insight: any) => (
                <div key={insight.area_code} className="flex items-center space-x-2">
                  <Checkbox
                    id={insight.area_code}
                    checked={formData.areaCodes.includes(insight.area_code)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          areaCodes: [...formData.areaCodes, insight.area_code]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          areaCodes: formData.areaCodes.filter(code => code !== insight.area_code)
                        });
                      }
                    }}
                  />
                  <label htmlFor={insight.area_code} className="text-sm">
                    {insight.area_name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notification Preferences</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={formData.emailEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, emailEnabled: !!checked })}
                />
                <label htmlFor="email" className="text-sm">Email Alerts</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={formData.smsEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, smsEnabled: !!checked })}
                />
                <label htmlFor="sms" className="text-sm">SMS Alerts</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="reid-button-primary"
              disabled={createMutation.isPending || formData.areaCodes.length === 0}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
