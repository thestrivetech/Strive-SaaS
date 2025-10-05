'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, ListChecks } from 'lucide-react';
import { getWorkflowTemplates, applyWorkflowToLoop } from '@/lib/modules/transactions/workflows';
import type { workflows } from '@prisma/client';
import type { WorkflowStep } from '@/lib/modules/transactions/workflows/schemas';

interface ApplyWorkflowDialogProps {
  loopId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ApplyWorkflowDialog({
  loopId,
  open,
  onOpenChange,
  onSuccess,
}: ApplyWorkflowDialogProps) {
  const [templates, setTemplates] = useState<workflows[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const { toast } = useToast();

  async function loadTemplates() {
    try {
      setLoadingTemplates(true);
      const response = await getWorkflowTemplates();
      if (response.success) {
        setTemplates(response.templates);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load templates',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setLoadingTemplates(false);
    }
  }

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedTemplateId) {
      toast({
        variant: 'destructive',
        title: 'Template required',
        description: 'Please select a workflow template to apply',
      });
      return;
    }

    try {
      setLoading(true);

      const response = await applyWorkflowToLoop({
        loopId,
        templateId: selectedTemplateId,
      });

      if (response.success) {
        toast({
          title: 'Workflow applied',
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Created {response.tasks?.length || 0} tasks from workflow</span>
            </div>
          ),
        });

        onOpenChange(false);
        setSelectedTemplateId('');
        onSuccess?.();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to apply workflow',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const steps = (selectedTemplate?.steps as WorkflowStep[]) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply Workflow Template</DialogTitle>
          <DialogDescription>
            Select a workflow template to automatically generate tasks for this transaction loop.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Workflow Template</Label>
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => {
                    const templateSteps = (template.steps as WorkflowStep[]) || [];
                    return (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <span>{template.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({templateSteps.length} steps)
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Template preview */}
          {selectedTemplate && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ListChecks className="h-4 w-4" />
                <span>Template Preview</span>
              </div>

              {selectedTemplate.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Tasks to be created ({steps.length}):
                </p>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {steps
                    .sort((a, b) => a.order - b.order)
                    .map((step) => (
                      <li
                        key={step.id}
                        className="text-sm bg-muted/50 rounded p-2 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{step.title}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Step {step.order + 1}
                          </span>
                        </div>
                        {step.description && (
                          <p className="text-xs text-muted-foreground">
                            {step.description}
                          </p>
                        )}
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          {step.autoAssignRole && (
                            <span>• Assigned to {step.autoAssignRole}</span>
                          )}
                          {step.estimatedDays && (
                            <span>• Due in {step.estimatedDays} days</span>
                          )}
                          {step.requiresDocument && <span>• Requires document</span>}
                          {step.requiresSignature && <span>• Requires signature</span>}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedTemplateId}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply Workflow'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
