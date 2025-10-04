import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Home, Calendar, Plus } from "lucide-react";

interface QuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickActions = [
  {
    title: "New Lead",
    description: "Add a new lead to the system",
    icon: Users,
    color: "text-chart-1",
    action: "lead",
  },
  {
    title: "New Deal",
    description: "Create a new deal in pipeline",
    icon: Briefcase,
    color: "text-chart-2",
    action: "deal",
  },
  {
    title: "New Listing",
    description: "Add a property listing",
    icon: Home,
    color: "text-chart-3",
    action: "listing",
  },
  {
    title: "Schedule Event",
    description: "Create a calendar event",
    icon: Calendar,
    color: "text-chart-4",
    action: "event",
  },
];

export function QuickCreateModal({ open, onOpenChange }: QuickCreateModalProps) {
  const handleAction = (action: string) => {
    console.log(`Quick create: ${action}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-quick-create">
        <DialogHeader>
          <DialogTitle>Quick Create</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.action}
                onClick={() => handleAction(action.action)}
                className="flex items-center gap-3 p-4 rounded-lg border hover-elevate text-left"
                data-testid={`button-quick-${action.action}`}
              >
                <div className={`${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QuickCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl"
        onClick={() => setOpen(true)}
        data-testid="button-quick-create"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <QuickCreateModal open={open} onOpenChange={setOpen} />
    </>
  );
}
