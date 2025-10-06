'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Workflow,
  Loader2,
  Plus,
  Users,
  ListChecks,
  Trash2
} from 'lucide-react';
import { getWorkflowTemplates } from '@/lib/modules/transactions/workflows';
import type { workflows } from '@prisma/client';
import type { WorkflowStep } from '@/lib/modules/transactions/workflows/schemas';

interface WorkflowTemplatesProps {
  onApplyTemplate?: (templateId: string) => void;
  showApplyButton?: boolean;
}

export function WorkflowTemplates({
  onApplyTemplate,
  showApplyButton = true,
}: WorkflowTemplatesProps) {
  const [templates, setTemplates] = useState<workflows[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  async function loadTemplates() {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No workflow templates found. Create one to automate task generation.
            </p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Workflow Templates
        </h3>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const steps = (template.steps as WorkflowStep[]) || [];
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-semibold">
                    {template.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {steps.length} {steps.length === 1 ? 'step' : 'steps'}
                  </Badge>
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {template.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Step summary */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ListChecks className="h-3.5 w-3.5" />
                    <span>Steps:</span>
                  </div>
                  <ul className="text-sm space-y-1 ml-5">
                    {steps.slice(0, 3).map((step) => (
                      <li key={step.id} className="text-muted-foreground truncate">
                        • {step.title}
                      </li>
                    ))}
                    {steps.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        + {steps.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                {/* Auto-assign roles */}
                {steps.some(s => s.autoAssignRole) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>Auto-assigns to party roles</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {showApplyButton && onApplyTemplate && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => onApplyTemplate(template.id)}
                    >
                      Apply Template
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
