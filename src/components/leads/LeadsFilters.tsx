
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Search, SortAsc, SortDesc } from "lucide-react";

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
    <div className="flex flex-col gap-4 mb-6" role="search" aria-label="סינון לידים">
      {/* Search Bar - Modern design */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" aria-hidden="true" />
        <Input
          placeholder="חיפוש לקוחות לפי שם, טלפון או אימייל..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-4 pr-12 py-3 h-12 text-base rounded-xl border-2 focus:border-primary transition-all shadow-sm hover:shadow-md"
          dir="rtl"
          aria-label="חיפוש לקוחות"
          type="search"
        />
      </div>

      {/* Filters and Sort - Modern cards */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Status Filter */}
        <div className="flex flex-col gap-1">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger 
              className="w-[160px]" 
              dir="rtl"
              aria-label="סינון לפי סטטוס"
            >
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent align="end" className="text-right">
              <SelectItem value="all" className="justify-end text-right">כל הסטטוסים</SelectItem>
              <SelectItem value="new" className="justify-end text-right">חדש</SelectItem>
              <SelectItem value="in_treatment" className="justify-end text-right">בטיפול</SelectItem>
              <SelectItem value="waiting" className="justify-end text-right">בהמתנה</SelectItem>
              <SelectItem value="closed" className="justify-end text-right">סגור</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div className="flex flex-col gap-1">
          <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
            <SelectTrigger 
              className="w-[160px]" 
              dir="rtl"
              aria-label="סינון לפי מקור"
            >
              <SelectValue placeholder="מקור" />
            </SelectTrigger>
            <SelectContent align="end" className="text-right">
              <SelectItem value="all" className="justify-end text-right">כל המקורות</SelectItem>
              <SelectItem value="ידני" className="justify-end text-right">ידני</SelectItem>
              <SelectItem value="פייסבוק" className="justify-end text-right">פייסבוק</SelectItem>
              <SelectItem value="אתר" className="justify-end text-right">אתר</SelectItem>
              <SelectItem value="המלצה" className="justify-end text-right">המלצה</SelectItem>
              <SelectItem value="טלפון" className="justify-end text-right">טלפון</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="flex flex-col gap-1">
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger 
              className="w-[160px]" 
              dir="rtl"
              aria-label="מיון לפי"
            >
              <SelectValue placeholder="מיון לפי" />
            </SelectTrigger>
            <SelectContent align="end" className="text-right">
              <SelectItem value="created_at" className="justify-end text-right">תאריך יצירה</SelectItem>
              <SelectItem value="name" className="justify-end text-right">שם</SelectItem>
              <SelectItem value="status" className="justify-end text-right">סטטוס</SelectItem>
              <SelectItem value="source" className="justify-end text-right">מקור</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order Button - Modern design */}
        <Button
          variant="outline"
          size="default"
          onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 h-11 px-4 rounded-xl border-2 hover:border-primary/50 hover:bg-accent/50 transition-all shadow-sm hover:shadow-md"
          aria-label={sortOrder === "asc" ? "סדר יורד" : "סדר עולה"}
        >
          {sortOrder === "asc" ? (
            <SortAsc className="h-4 w-4" aria-hidden="true" />
          ) : (
            <SortDesc className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="font-medium">{sortOrder === "asc" ? "עולה" : "יורד"}</span>
        </Button>

        {/* Active Filters Badge - Modern style */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-3 mr-auto">
            <Badge 
              variant="secondary" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-primary/10 text-primary border-0"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              {activeFiltersCount} פילטרים פעילים
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-xl gap-1.5 font-medium"
              aria-label="נקה את כל הפילטרים"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              נקה הכל
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
