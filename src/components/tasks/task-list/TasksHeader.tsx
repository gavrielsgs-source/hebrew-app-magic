
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
      <TableRow className="bg-gradient-to-l from-slate-50 via-blue-50 to-white border-b border-blue-100 hover:bg-gradient-to-l hover:from-slate-50 hover:via-blue-50 hover:to-white">
        {/* Checkbox Column */}
        <TableHead className="w-[50px] text-center">
          <div className="flex justify-center">
            {/* Empty for checkbox alignment */}
          </div>
        </TableHead>
        
        {/* Title Column */}
        <TableHead 
          className="cursor-pointer font-semibold text-[#2F3C7E] hover:text-[#1F2C5E] transition-colors w-[200px]"
          onClick={() => onSort("title")}
        >
          <div className="flex items-center justify-end gap-1">
            {renderSortIcon("title")}
            <span>כותרת</span>
          </div>
        </TableHead>
        
        {/* Type Column */}
        <TableHead 
          className="cursor-pointer font-semibold text-[#2F3C7E] hover:text-[#1F2C5E] transition-colors w-[120px]"
          onClick={() => onSort("type")}
        >
          <div className="flex items-center justify-end gap-1">
            {renderSortIcon("type")}
            <span>סוג</span>
          </div>
        </TableHead>
        
        {/* Priority Column */}
        <TableHead 
          className="cursor-pointer font-semibold text-[#2F3C7E] hover:text-[#1F2C5E] transition-colors w-[100px]"
          onClick={() => onSort("priority")}
        >
          <div className="flex items-center justify-end gap-1">
            {renderSortIcon("priority")}
            <span>עדיפות</span>
          </div>
        </TableHead>
        
        {/* Date Column */}
        <TableHead 
          className="cursor-pointer font-semibold text-[#2F3C7E] hover:text-[#1F2C5E] transition-colors w-[120px]"
          onClick={() => onSort("due_date")}
        >
          <div className="flex items-center justify-end gap-1">
            {renderSortIcon("due_date")}
            <span>תאריך</span>
          </div>
        </TableHead>
        
        {/* Status Column */}
        <TableHead 
          className="cursor-pointer font-semibold text-[#2F3C7E] hover:text-[#1F2C5E] transition-colors w-[100px]"
          onClick={() => onSort("status")}
        >
          <div className="flex items-center justify-end gap-1">
            {renderSortIcon("status")}
            <span>סטטוס</span>
          </div>
        </TableHead>
        
        {/* Related To Column */}
        <TableHead className="font-semibold text-[#2F3C7E] w-[150px]">
          <div className="flex justify-end">
            <span>קשור ל</span>
          </div>
        </TableHead>
        
        {/* Actions Column */}
        <TableHead className="w-[60px]">
          <div className="flex justify-center">
            {/* Empty for actions */}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
