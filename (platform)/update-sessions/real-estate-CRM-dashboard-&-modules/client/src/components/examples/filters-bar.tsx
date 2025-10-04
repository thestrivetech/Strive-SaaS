import { useState } from "react";
import { FiltersBar } from "../crm/shared/filters-bar";

export default function FiltersBarExample() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const filters = [
    {
      name: "score",
      placeholder: "Lead Score",
      options: [
        { label: "Hot", value: "hot" },
        { label: "Warm", value: "warm" },
        { label: "Cold", value: "cold" },
      ],
    },
    {
      name: "source",
      placeholder: "Source",
      options: [
        { label: "Website", value: "website" },
        { label: "Referral", value: "referral" },
        { label: "Google Ads", value: "google" },
        { label: "Social Media", value: "social" },
      ],
    },
    {
      name: "agent",
      placeholder: "Assigned Agent",
      options: [
        { label: "Sarah Johnson", value: "sarah" },
        { label: "Mike Chen", value: "mike" },
        { label: "Lisa Wang", value: "lisa" },
      ],
    },
  ];

  const handleFilterChange = (name: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [name]: value }));
    console.log(`Filter ${name} changed to:`, value);
  };

  const handleClearAll = () => {
    setActiveFilters({});
    console.log("All filters cleared");
  };

  return (
    <div className="p-6">
      <FiltersBar
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
