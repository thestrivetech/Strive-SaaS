import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingCart } from "lucide-react";
import { getIcon } from "@/lib/icon-map";
import { formatPrice } from "@/lib/format";
import type { MarketplaceItem } from "@/data/marketplace-items";

interface PlanBuilderProps {
  selectedItems: MarketplaceItem[];
  onRemove: (id: string) => void;
}

export default function PlanBuilder({ selectedItems, onRemove }: PlanBuilderProps) {
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <Card className="p-6 sticky top-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-card-foreground">Your Plan</h2>
          <Badge variant="secondary" data-testid="badge-item-count">
            {selectedItems.length} {selectedItems.length === 1 ? "item" : "items"}
          </Badge>
        </div>

        {selectedItems.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              No tools selected yet
            </p>
            <p className="text-xs text-muted-foreground">
              Add tools to build your custom plan
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedItems.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover-elevate transition-all"
                    data-testid={`plan-item-${item.id}`}
                  >
                    <div className="rounded-md bg-background p-2 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground leading-tight">
                        {item.title}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => onRemove(item.id)}
                      data-testid={`button-remove-${item.id}`}
                      aria-label={`Remove ${item.title}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">Total</span>
                <span className="text-2xl font-bold font-mono text-card-foreground" data-testid="text-total-price">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <Button className="w-full" size="lg" data-testid="button-checkout">
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
