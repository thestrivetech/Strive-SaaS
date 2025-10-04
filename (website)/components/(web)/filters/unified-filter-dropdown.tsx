"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface FilterSelection {
  type: "all" | "industry" | "solution";
  value: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface UnifiedFilterDropdownProps {
  selectedFilter: FilterSelection;
  onFilterChange: (filter: FilterSelection) => void;
  industryOptions?: FilterOption[];
  solutionTypeOptions?: FilterOption[];
}

export function UnifiedFilterDropdown({
  selectedFilter,
  onFilterChange,
  industryOptions = [],
  solutionTypeOptions = [],
}: UnifiedFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterSelect = (type: FilterSelection["type"], value: string) => {
    onFilterChange({ type, value });
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    if (selectedFilter.type === "all") return "All Solutions";
    return selectedFilter.value;
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto flex items-center justify-between gap-2"
      >
        <span>{getDisplayLabel()}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Solutions</DialogTitle>
            <DialogDescription>
              Choose how you'd like to filter the solutions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* All Solutions */}
            <button
              onClick={() => handleFilterSelect("all", "All")}
              className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                selectedFilter.type === "all"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:bg-gray-50"
              } transition-colors`}
            >
              <span className="font-medium">All Solutions</span>
              {selectedFilter.type === "all" && <Check className="h-5 w-5 text-primary" />}
            </button>

            {/* Industry Filters */}
            {industryOptions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">By Industry</h4>
                <div className="space-y-2">
                  {industryOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterSelect("industry", option.value)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border ${
                        selectedFilter.type === "industry" &&
                        selectedFilter.value === option.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:bg-gray-50"
                      } transition-colors`}
                    >
                      <span className="text-sm">{option.label}</span>
                      {selectedFilter.type === "industry" &&
                        selectedFilter.value === option.value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Solution Type Filters */}
            {solutionTypeOptions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">By Solution Type</h4>
                <div className="space-y-2">
                  {solutionTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterSelect("solution", option.value)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border ${
                        selectedFilter.type === "solution" &&
                        selectedFilter.value === option.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:bg-gray-50"
                      } transition-colors`}
                    >
                      <span className="text-sm">{option.label}</span>
                      {selectedFilter.type === "solution" &&
                        selectedFilter.value === option.value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
