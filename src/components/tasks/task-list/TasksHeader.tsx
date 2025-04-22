
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
      <MoveUp className="h-4 w-4 mr-1" />
    ) : (
      <MoveDown className="h-4 w-4 mr-1" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]"></TableHead>
        <TableHead 
          className="cursor-pointer text-right"
          onClick={() => onSort("title")}
        >
          <div className="flex items-center justify-end">
            {renderSortIcon("title")} כותרת
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer text-right"
          onClick={() => onSort("type")}
        >
          <div className="flex items-center justify-end">
            {renderSortIcon("type")} סוג
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer text-right"
          onClick={() => onSort("priority")}
        >
          <div className="flex items-center justify-end">
            {renderSortIcon("priority")} עדיפות
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer text-right"
          onClick={() => onSort("due_date")}
        >
          <div className="flex items-center justify-end">
            {renderSortIcon("due_date")} תאריך
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer text-right"
          onClick={() => onSort("status")}
        >
          <div className="flex items-center justify-end">
            {renderSortIcon("status")} סטטוס
          </div>
        </TableHead>
        <TableHead className="text-right">קשור ל</TableHead>
        <TableHead className="text-left"></TableHead>
      </TableRow>
    </TableHeader>
  );
}
