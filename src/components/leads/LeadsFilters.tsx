
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Search, SortAsc, SortDesc } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface LeadsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function LeadsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sourceFilter,
  onSourceFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  activeFiltersCount
}: LeadsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="חיפוש לקוחות לפי שם, טלפון או אימייל..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-4 pr-10 text-right"
          dir="rtl"
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]" dir="rtl">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="new">חדש</SelectItem>
            <SelectItem value="in_progress">בטיפול</SelectItem>
            <SelectItem value="waiting">בהמתנה</SelectItem>
            <SelectItem value="closed">סגור</SelectItem>
          </SelectContent>
        </Select>

        {/* Source Filter */}
        <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
          <SelectTrigger className="w-[140px]" dir="rtl">
            <SelectValue placeholder="מקור" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">כל המקורות</SelectItem>
            <SelectItem value="ידני">ידני</SelectItem>
            <SelectItem value="פייסבוק">פייסבוק</SelectItem>
            <SelectItem value="אתר">אתר</SelectItem>
            <SelectItem value="המלצה">המלצה</SelectItem>
            <SelectItem value="טלפון">טלפון</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[140px]" dir="rtl">
            <SelectValue placeholder="מיון לפי" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="created_at">תאריך יצירה</SelectItem>
            <SelectItem value="name">שם</SelectItem>
            <SelectItem value="status">סטטוס</SelectItem>
            <SelectItem value="source">מקור</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-1"
        >
          {sortOrder === "asc" ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
          {sortOrder === "asc" ? "עולה" : "יורד"}
        </Button>

        {/* Active Filters Badge */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {activeFiltersCount} פילטרים פעילים
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              נקה הכל
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
