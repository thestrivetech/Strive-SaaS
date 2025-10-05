import { useState, useMemo } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import ToolCard from "@/components/ToolCard";
import PlanBuilder from "@/components/PlanBuilder";
import ToolDetailsModal from "@/components/ToolDetailsModal";
import ThemeToggle from "@/components/ThemeToggle";
import { marketplaceItems, type MarketplaceItem } from "@/data/marketplace-items";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [detailsItem, setDetailsItem] = useState<MarketplaceItem | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(marketplaceItems.map((item) => item.category));
    return ["All", ...Array.from(cats)];
  }, []);

  const filteredItems = useMemo(() => {
    return marketplaceItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const selectedItems = useMemo(() => {
    return marketplaceItems.filter((item) => selectedItemIds.has(item.id));
  }, [selectedItemIds]);

  const handleToggleItem = (id: string) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItemIds(newSelected);
  };

  const handleRemoveItem = (id: string) => {
    const newSelected = new Set(selectedItemIds);
    newSelected.delete(id);
    setSelectedItemIds(newSelected);
  };

  const CategorySidebar = () => (
    <aside className="w-64 shrink-0 bg-sidebar border-r p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sidebar-foreground mb-1">
          Tool Marketplace
        </h1>
        <p className="text-sm text-muted-foreground">
          Build your perfect toolkit
        </p>
      </div>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <CategorySidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  data-testid="button-menu-toggle"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">Tool Marketplace</h1>
                    <p className="text-sm text-muted-foreground">
                      Build your perfect toolkit
                    </p>
                  </div>
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          <main className="flex-1 p-6 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  No tools found matching your criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <ToolCard
                    key={item.id}
                    item={item}
                    isSelected={selectedItemIds.has(item.id)}
                    onToggle={handleToggleItem}
                    onViewDetails={setDetailsItem}
                  />
                ))}
              </div>
            )}
          </main>

          <aside className="w-80 shrink-0 p-6 border-l overflow-y-auto hidden xl:block">
            <PlanBuilder
              selectedItems={selectedItems}
              onRemove={handleRemoveItem}
            />
          </aside>
        </div>
      </div>

      <div className="xl:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full" size="lg" data-testid="button-view-plan">
              View Plan ({selectedItems.length})
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <div className="overflow-y-auto h-full">
              <PlanBuilder
                selectedItems={selectedItems}
                onRemove={handleRemoveItem}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <ToolDetailsModal
        item={detailsItem}
        isOpen={detailsItem !== null}
        onClose={() => setDetailsItem(null)}
        isSelected={detailsItem ? selectedItemIds.has(detailsItem.id) : false}
        onToggle={handleToggleItem}
      />
    </div>
  );
}
