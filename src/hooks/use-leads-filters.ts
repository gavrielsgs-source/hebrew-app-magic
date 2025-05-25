
import { useState, useMemo } from "react";

export interface LeadFilters {
  searchTerm: string;
  statusFilter: string;
  sourceFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export function useLeadsFilters() {
  const [filters, setFilters] = useState<LeadFilters>({
    searchTerm: "",
    statusFilter: "all",
    sourceFilter: "all",
    sortBy: "created_at",
    sortOrder: "desc"
  });

  const updateFilter = (key: keyof LeadFilters, value: string | "asc" | "desc") => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      statusFilter: "all",
      sourceFilter: "all",
      sortBy: "created_at",
      sortOrder: "desc"
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.statusFilter !== "all") count++;
    if (filters.sourceFilter !== "all") count++;
    return count;
  };

  const filterAndSortLeads = (leads: any[]) => {
    return useMemo(() => {
      let filteredLeads = [...leads];

      // Apply search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredLeads = filteredLeads.filter(lead =>
          lead.name?.toLowerCase().includes(searchLower) ||
          lead.phone?.includes(filters.searchTerm) ||
          lead.email?.toLowerCase().includes(searchLower)
        );
      }

      // Apply status filter
      if (filters.statusFilter !== "all") {
        filteredLeads = filteredLeads.filter(lead => lead.status === filters.statusFilter);
      }

      // Apply source filter
      if (filters.sourceFilter !== "all") {
        filteredLeads = filteredLeads.filter(lead => lead.source === filters.sourceFilter);
      }

      // Apply sorting
      filteredLeads.sort((a, b) => {
        let aValue, bValue;

        switch (filters.sortBy) {
          case "name":
            aValue = a.name?.toLowerCase() || "";
            bValue = b.name?.toLowerCase() || "";
            break;
          case "status":
            aValue = a.status || "";
            bValue = b.status || "";
            break;
          case "source":
            aValue = a.source || "";
            bValue = b.source || "";
            break;
          case "created_at":
          default:
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
            break;
        }

        if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      return filteredLeads;
    }, [leads, filters]);
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    getActiveFiltersCount,
    filterAndSortLeads
  };
}
