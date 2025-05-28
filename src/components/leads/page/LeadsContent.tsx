
import { useState } from "react";
import { LeadsFilters } from "../LeadsFilters";
import { LeadsGrid } from "../LeadsGrid";
import { LeadsTable } from "../../LeadsTable";
import { Button } from "@/components/ui/button";
import { Grid, Table as TableIcon } from "lucide-react";
import { useLeadsFilters } from "@/hooks/use-leads-filters";

interface LeadsContentProps {
  leads: any[];
  isLoading: boolean;
  error?: Error | null;
}

export function LeadsContent({ leads, isLoading, error }: LeadsContentProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const {
    filters,
    updateFilter,
    clearFilters,
    getActiveFiltersCount,
    filterAndSortLeads
  } = useLeadsFilters();

  const filteredLeads = filterAndSortLeads(leads);

  return (
    <>
      <LeadsFilters
        searchTerm={filters.searchTerm}
        onSearchChange={(value) => updateFilter("searchTerm", value)}
        statusFilter={filters.statusFilter}
        onStatusFilterChange={(value) => updateFilter("statusFilter", value)}
        sourceFilter={filters.sourceFilter}
        onSourceFilterChange={(value) => updateFilter("sourceFilter", value)}
        sortBy={filters.sortBy}
        onSortByChange={(value) => updateFilter("sortBy", value)}
        sortOrder={filters.sortOrder}
        onSortOrderChange={(value) => updateFilter("sortOrder", value)}
        onClearFilters={clearFilters}
        activeFiltersCount={getActiveFiltersCount()}
      />

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === "table" ? "default" : "outline"} 
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredLeads.length} מתוך {leads.length} לקוחות
        </div>
      </div>

      {viewMode === "grid" ? (
        <LeadsGrid leads={filteredLeads} isLoading={isLoading} error={error} />
      ) : (
        <LeadsTable searchTerm={filters.searchTerm} filteredLeads={filteredLeads} />
      )}
    </>
  );
}
