import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
        Categories
      </h3>
      <div className="space-y-1">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <Button
              key={category}
              variant={isSelected ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectCategory(category)}
              data-testid={`button-category-${category.toLowerCase()}`}
            >
              <span className={isSelected ? "font-semibold" : ""}>{category}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
