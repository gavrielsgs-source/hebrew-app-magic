
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskFiltersProps {
  statusFilter: string[];
  typeFilter: string[];
  allStatuses: string[];
  allTypes: string[];
  onStatusFilterChange: (statuses: string[]) => void;
  onTypeFilterChange: (types: string[]) => void;
}

export function TaskFilters({
  statusFilter,
  typeFilter,
  allStatuses,
  allTypes,
  onStatusFilterChange,
  onTypeFilterChange,
}: TaskFiltersProps) {
  const getTaskTypeLabel = (taskType: string) => {
    switch(taskType.toLowerCase()) {
      case 'call': return 'שיחת טלפון';
      case 'meeting': return 'פגישה';
      case 'follow_up': return 'מעקב';
      case 'test': return 'טסט';
      case 'task': 
      default: return 'משימה';
    }
  };

  return (
    <div className="flex space-x-2 rtl:space-x-reverse">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            סטטוס
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allStatuses.map(status => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={statusFilter.includes(status)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onStatusFilterChange([...statusFilter, status]);
                } else {
                  onStatusFilterChange(statusFilter.filter(s => s !== status));
                }
              }}
            >
              {status === 'pending' ? 'ממתין' : 
               status === 'in_progress' ? 'בביצוע' : 
               status === 'completed' ? 'הושלם' : 
               status === 'cancelled' ? 'בוטל' : status}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            סוג
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allTypes.map(type => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={typeFilter.includes(type)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onTypeFilterChange([...typeFilter, type]);
                } else {
                  onTypeFilterChange(typeFilter.filter(t => t !== type));
                }
              }}
            >
              {getTaskTypeLabel(type)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
