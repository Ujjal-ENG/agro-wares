import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FacetValue } from "@/types/ecommerce";

interface FilterSidebarProps {
  facets: FacetValue[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (key: string, value: string, checked: boolean) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  facets,
  activeFilters,
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  const hasActiveFilters = Object.values(activeFilters).some((v) => v.length > 0);

  return (
    <aside className="w-full space-y-6 lg:w-64">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Clear all
          </button>
        )}
      </div>

      {facets.map((facet) => (
        <div key={facet.k} className="space-y-3">
          <h3 className="font-medium capitalize">{facet.k}</h3>
          <div className="space-y-2">
            {facet.v.map((value) => {
              const isChecked = activeFilters[facet.k]?.includes(value) || false;
              const count = facet.counts[value] || 0;

              return (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${facet.k}-${value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      onFilterChange(facet.k, value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`${facet.k}-${value}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {value}
                  </Label>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
