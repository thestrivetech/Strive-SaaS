import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getIcon } from "@/lib/icon-map";
import { formatPrice } from "@/lib/format";
import ToolBadge from "./ToolBadge";
import type { MarketplaceItem } from "@/data/marketplace-items";

interface ToolDetailsModalProps {
  item: MarketplaceItem | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export default function ToolDetailsModal({
  item,
  isOpen,
  onClose,
  isSelected,
  onToggle,
}: ToolDetailsModalProps) {
  if (!item) return null;

  const Icon = getIcon(item.icon);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" data-testid="modal-tool-details">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-4">
            <div className="rounded-lg bg-primary/10 p-4 flex items-center justify-center">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{item.title}</DialogTitle>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <ToolBadge key={tag} tag={tag} />
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription className="text-base leading-relaxed text-foreground">
          {item.description}
        </DialogDescription>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <span className="text-sm font-medium">Price</span>
            <span className="text-2xl font-bold font-mono">{formatPrice(item.price)}</span>
          </div>

          <div className="flex gap-3">
            <Button
              variant={isSelected ? "secondary" : "default"}
              className="flex-1"
              size="lg"
              onClick={() => {
                onToggle(item.id);
                onClose();
              }}
              data-testid="button-modal-toggle"
            >
              {isSelected ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Added to Plan
                </>
              ) : (
                "Add to Plan"
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              data-testid="button-modal-close"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
