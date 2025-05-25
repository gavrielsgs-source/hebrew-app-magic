
import { MoveDown, MoveUp } from "lucide-react";

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
      <MoveUp className="h-4 w-4" />
    ) : (
      <MoveDown className="h-4 w-4" />
    );
  };

  return (
    <div className="bg-gradient-to-l from-slate-50 via-blue-50 to-white border-b border-blue-100 p-4">
      <div className="grid grid-cols-8 gap-4 items-center text-right">
        {/* Checkbox Column */}
        <div className="flex justify-center">
          {/* Empty for checkbox alignment */}
        </div>
        
        {/* Title Column */}
        <div 
          className="cursor-pointer font-semibold text-[#2F3C7E] hover:text-[#1F2C5E] transition-colors"
          onClick={() => onSort("title")}
        >
          <div className="flex items-center justify-end gap-1">
            {renderSortIcon("title")}
            <span>כותרת</span>
          </div>
        </div>
        
        {/* Type Column */}
        <div 
          className="cursor-pointer font-semibold text-[#2F3C7E] hover:text-[#1F2C5E] transition-colors"
          onClick={() => onSort("type")}
        >
          <div className="flex items-center justify-end gap-1">
            {renderSortIcon("type")}
            <span>סוג</span>
          </div>
        </div>
        
        {/* Priority Column */}
        <div 
          className="cursor-pointer font-semibold text-[#2F3C7E] hover:text-[#1F2C5E] transition-colors"
          onClick={() => onSort("priority")}
        >
          <div className="flex items-center justify-end gap-1">
            {renderSortIcon("priority")}
            <span>עדיפות</span>
          </div>
        </div>
        
        {/* Date Column */}
        <div 
          className="cursor-pointer font-semibold text-[#2F3C7E] hover:text-[#1F2C5E] transition-colors"
          onClick={() => onSort("due_date")}
        >
          <div className="flex items-center justify-end gap-1">
            {renderSortIcon("due_date")}
            <span>תאריך</span>
          </div>
        </div>
        
        {/* Status Column */}
        <div 
          className="cursor-pointer font-semibold text-[#2F3C7E] hover:text-[#1F2C5E] transition-colors"
          onClick={() => onSort("status")}
        >
          <div className="flex items-center justify-end gap-1">
            {renderSortIcon("status")}
            <span>סטטוס</span>
          </div>
        </div>
        
        {/* Related To Column */}
        <div className="font-semibold text-[#2F3C7E]">
          <div className="flex justify-end">
            <span>קשור ל</span>
          </div>
        </div>
        
        {/* Actions Column */}
        <div className="flex justify-center">
          {/* Empty for actions */}
        </div>
      </div>
    </div>
  );
}
