
import { LeadsFilters } from "../LeadsFilters";
import { LeadsMobileView } from "../LeadsMobileView";
import { useLeadsFilters } from "@/hooks/use-leads-filters";

interface LeadsMobileContentProps {
  leads: any[];
  isLoading: boolean;
  error?: Error | null;
}

export function LeadsMobileContent({ leads, isLoading, error }: LeadsMobileContentProps) {
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

      <div className="text-sm text-muted-foreground mb-4 text-center">
        {filteredLeads.length} מתוך {leads.length} לקוחות
      </div>

      <LeadsMobileView leads={filteredLeads} isLoading={isLoading} error={error} />
    </>
  );
}
