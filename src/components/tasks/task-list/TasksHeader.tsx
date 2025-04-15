
import { MoveDown, MoveUp } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SortField = "due_date" | "priority" | "title" | "status" | "type";
type SortDirection = "asc" | "desc";

interface TasksHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function TasksHeader({ sortField, sortDirection, onSort }: TasksHeaderProps) {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" ? (
      <MoveUp className="h-4 w-4 ml-1" />
    ) : (
      <MoveDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]"></TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("title")}
        >
          <div className="flex items-center">
            כותרת {renderSortIcon("title")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("type")}
        >
          <div className="flex items-center">
            סוג {renderSortIcon("type")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("priority")}
        >
          <div className="flex items-center">
            עדיפות {renderSortIcon("priority")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("due_date")}
        >
          <div className="flex items-center">
            תאריך {renderSortIcon("due_date")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("status")}
        >
          <div className="flex items-center">
            סטטוס {renderSortIcon("status")}
          </div>
        </TableHead>
        <TableHead>קשור ל</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
  );
}
