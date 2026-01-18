
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { MobileButton } from "@/components/mobile/MobileButton";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { type Task } from "@/types/task";

interface TaskFiltersAndSearchProps {
  tasks: Task[];
  onTasksFilter: (filteredTasks: Task[]) => void;
}

export function TaskFiltersAndSearch({ tasks, onTasksFilter }: TaskFiltersAndSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const isMobile = useIsMobile();

  // Available filter options
  const statusOptions = [
    { value: "pending", label: "ממתין" },
    { value: "in_progress", label: "בביצוע" },
    { value: "completed", label: "הושלם" },
    { value: "cancelled", label: "בוטל" }
  ];

  const priorityOptions = [
    { value: "high", label: "גבוהה" },
    { value: "medium", label: "בינונית" },
    { value: "low", label: "נמוכה" }
  ];

  const typeOptions = [
    { value: "call", label: "שיחת טלפון" },
    { value: "meeting", label: "פגישה" },
    { value: "follow_up", label: "מעקב" },
    { value: "task", label: "משימה" }
  ];

  // Filter tasks based on search term and filters
  useEffect(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.leads?.name?.toLowerCase().includes(searchLower) ||
        task.cars?.make?.toLowerCase().includes(searchLower) ||
        task.cars?.model?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filters
    if (statusFilters.length > 0) {
      filtered = filtered.filter(task => statusFilters.includes(task.status));
    }

    // Apply priority filters
    if (priorityFilters.length > 0) {
      filtered = filtered.filter(task => priorityFilters.includes(task.priority));
    }

    // Apply type filters
    if (typeFilters.length > 0) {
      filtered = filtered.filter(task => typeFilters.includes(task.type));
    }

    onTasksFilter(filtered);
  }, [tasks, searchTerm, statusFilters, priorityFilters, typeFilters, onTasksFilter]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilters([]);
    setPriorityFilters([]);
    setTypeFilters([]);
  };

  const activeFiltersCount = statusFilters.length + priorityFilters.length + typeFilters.length;

  const handleFilterChange = (value: string, filters: string[], setFilters: (filters: string[]) => void) => {
    if (filters.includes(value)) {
      setFilters(filters.filter(f => f !== value));
    } else {
      setFilters([...filters, value]);
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4 mb-6">
        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="חיפוש משימות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-11 text-right rounded-xl h-12 border-2 text-base bg-card"
            dir="rtl"
          />
        </div>

        {/* Mobile Filters Row */}
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MobileButton variant="outline" size="sm" className="relative rounded-xl border-2 font-medium">
                <Filter className="h-4 w-4 ml-1" />
                סטטוס
                {statusFilters.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary">
                    {statusFilters.length}
                  </Badge>
                )}
              </MobileButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg"
            >
              <DropdownMenuLabel className="text-right font-medium text-muted-foreground">סינון לפי סטטוס</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              {statusOptions.map(option => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={statusFilters.includes(option.value)}
                  onCheckedChange={() => handleFilterChange(option.value, statusFilters, setStatusFilters)}
                  className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MobileButton variant="outline" size="sm" className="relative rounded-xl border-2 font-medium">
                <Filter className="h-4 w-4 ml-1" />
                עדיפות
                {priorityFilters.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary">
                    {priorityFilters.length}
                  </Badge>
                )}
              </MobileButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg"
            >
              <DropdownMenuLabel className="text-right font-medium text-muted-foreground">סינון לפי עדיפות</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              {priorityOptions.map(option => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={priorityFilters.includes(option.value)}
                  onCheckedChange={() => handleFilterChange(option.value, priorityFilters, setPriorityFilters)}
                  className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MobileButton variant="outline" size="sm" className="relative rounded-xl border-2 font-medium">
                <Filter className="h-4 w-4 ml-1" />
                סוג
                {typeFilters.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary">
                    {typeFilters.length}
                  </Badge>
                )}
              </MobileButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg"
            >
              <DropdownMenuLabel className="text-right font-medium text-muted-foreground">סינון לפי סוג</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              {typeOptions.map(option => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={typeFilters.includes(option.value)}
                  onCheckedChange={() => handleFilterChange(option.value, typeFilters, setTypeFilters)}
                  className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFiltersCount > 0 && (
            <MobileButton 
              variant="outline" 
              size="sm"
              onClick={clearAllFilters}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl border-2 font-medium"
            >
              <X className="h-4 w-4 ml-1" />
              נקה
            </MobileButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Desktop Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="חיפוש משימות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-11 text-right rounded-xl h-11 border-2 bg-card"
            dir="rtl"
          />
        </div>

        {/* Desktop Filters */}
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative rounded-xl border-2 font-medium h-10">
                <Filter className="h-4 w-4 ml-1.5" />
                סטטוס
                {statusFilters.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary">
                    {statusFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg"
            >
              <DropdownMenuLabel className="text-right font-medium text-muted-foreground">סינון לפי סטטוס</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              {statusOptions.map(option => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={statusFilters.includes(option.value)}
                  onCheckedChange={() => handleFilterChange(option.value, statusFilters, setStatusFilters)}
                  className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative rounded-xl border-2 font-medium h-10">
                <Filter className="h-4 w-4 ml-1.5" />
                עדיפות
                {priorityFilters.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary">
                    {priorityFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg"
            >
              <DropdownMenuLabel className="text-right font-medium text-muted-foreground">סינון לפי עדיפות</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              {priorityOptions.map(option => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={priorityFilters.includes(option.value)}
                  onCheckedChange={() => handleFilterChange(option.value, priorityFilters, setPriorityFilters)}
                  className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative rounded-xl border-2 font-medium h-10">
                <Filter className="h-4 w-4 ml-1.5" />
                סוג
                {typeFilters.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary">
                    {typeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg"
            >
              <DropdownMenuLabel className="text-right font-medium text-muted-foreground">סינון לפי סוג</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              {typeOptions.map(option => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={typeFilters.includes(option.value)}
                  onCheckedChange={() => handleFilterChange(option.value, typeFilters, setTypeFilters)}
                  className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFiltersCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllFilters}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl border-2 font-medium h-10"
            >
              <X className="h-4 w-4 ml-1.5" />
              נקה סינון ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
