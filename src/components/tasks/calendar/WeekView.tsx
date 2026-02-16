
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, isPast } from "date-fns";
import { he } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, ChevronRight, CalendarDays, GripVertical } from "lucide-react";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface WeekViewProps {
  tasks: Task[];
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onTaskDateChange?: (taskId: string, newDate: Date) => void;
  onCreateTask?: (date: Date) => void;
}

export function WeekView({ 
  tasks, 
  selectedDate, 
  onSelectedDateChange, 
  onTaskClick, 
  onTaskDateChange,
  onCreateTask
}: WeekViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1);
    onSelectedDateChange(newDate);
  };

  const goToCurrentWeek = () => {
    onSelectedDateChange(new Date());
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), date);
    });
  };

  const getTaskTypeColor = (task: Task) => {
    const priorityColors = {
      high: "bg-red-50 border-red-300 text-red-800",
      medium: "bg-amber-50 border-amber-300 text-amber-800",
      low: "bg-emerald-50 border-emerald-300 text-emerald-800"
    };

    const baseColors = {
      call: "bg-blue-50 border-blue-300 text-blue-800",
      meeting: "bg-emerald-50 border-emerald-300 text-emerald-800", 
      follow_up: "bg-violet-50 border-violet-300 text-violet-800",
      task: "bg-slate-50 border-slate-300 text-slate-800"
    };

    // Priority overrides type for visual importance
    if (task.priority === 'high') return priorityColors.high;
    if (task.priority === 'medium') return priorityColors.medium;
    if (task.priority === 'low') return priorityColors.low;

    return baseColors[task.type as keyof typeof baseColors] || baseColors.task;
  };

  const getTaskStatusIndicator = (task: Task) => {
    if (task.status === 'completed') return "line-through opacity-60";
    if (!task.due_date) return "";
    
    const taskDate = new Date(task.due_date);
    if (isPast(taskDate) && !isSameDay(taskDate, new Date())) return "border-r-4 border-r-red-400";
    if (isToday(taskDate)) return "border-r-4 border-r-amber-400";
    
    return "";
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverDate(null);
    }
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(null);
    
    if (draggedTask && onTaskDateChange) {
      const originalDate = new Date(draggedTask.due_date || new Date());
      const newDateTime = new Date(date);
      newDateTime.setHours(originalDate.getHours());
      newDateTime.setMinutes(originalDate.getMinutes());
      
      onTaskDateChange(draggedTask.id, newDateTime);
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverDate(null);
  };

  const renderDay = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    const isSelectedDate = isSameDay(date, selectedDate);
    const isTodayDate = isToday(date);
    const isDragOver = dragOverDate && isSameDay(dragOverDate, date);

    return (
      <div key={date.toString()} className="flex-1 min-h-[220px]">
        <div 
          className={cn(
            "p-3 border-2 h-full cursor-pointer transition-all duration-200 rounded-xl",
            isSelectedDate && "bg-primary/5 border-primary/50",
            isTodayDate && !isSelectedDate && "bg-amber-50/50 border-amber-300/50",
            isDragOver && "bg-emerald-50 border-emerald-400 border-dashed",
            !isSelectedDate && !isTodayDate && !isDragOver && "border-border/50 hover:border-border hover:bg-muted/30"
          )}
          onClick={() => onSelectedDateChange(date)}
          onDoubleClick={() => onCreateTask?.(date)}
          onDragOver={(e) => handleDragOver(e, date)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, date)}
        >
          {/* Day header */}
          <div className="flex items-center justify-between mb-3">
            <div className={cn(
              "text-sm font-semibold",
              isTodayDate && "text-primary"
            )}>
              {format(date, 'EEEE', { locale: he })}
            </div>
            <div className={cn(
              "text-lg font-bold w-9 h-9 flex items-center justify-center rounded-xl transition-all",
              isTodayDate && "bg-primary text-primary-foreground shadow-md",
              isSelectedDate && !isTodayDate && "bg-primary/10 text-primary"
            )}>
              {format(date, 'd')}
            </div>
          </div>

          {/* Tasks for this day */}
          <div className="space-y-2">
            {dayTasks.length === 0 ? (
              <div className={cn(
                "text-xs text-center py-6 rounded-lg",
                isDragOver ? "text-emerald-600 bg-emerald-50 font-medium" : "text-muted-foreground"
              )}>
                {isDragOver ? "שחרר כאן" : onCreateTask ? "לחץ פעמיים להוספה" : "אין משימות"}
              </div>
            ) : (
              dayTasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  draggable={onTaskDateChange ? true : false}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "p-2.5 rounded-lg border-2 text-xs cursor-pointer hover:shadow-md transition-all duration-200 group",
                    getTaskTypeColor(task),
                    getTaskStatusIndicator(task),
                    onTaskDateChange && "cursor-move",
                    draggedTask?.id === task.id && "opacity-50 scale-95"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                >
                  <div className="flex items-start gap-1.5">
                    {onTaskDateChange && (
                      <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate mb-1">{task.title}</div>
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs opacity-75">
                          <Clock className="h-3 w-3" />
                          {format(new Date(task.due_date), 'HH:mm')}
                        </div>
                      )}
                      <div className="mt-1.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md border">
                          {task.type === 'call' ? 'שיחה' : 
                           task.type === 'meeting' ? 'פגישה' : 
                           task.type === 'follow_up' ? 'מעקב' : 'משימה'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {dayTasks.length > 4 && (
              <div className="text-xs text-center py-1.5 bg-muted/50 rounded-lg font-medium text-muted-foreground">
                +{dayTasks.length - 4} עוד
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Enhanced week header with navigation */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border-2 border-border/30">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek('prev')}
            className="h-9 w-9 rounded-xl border-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-bold text-foreground min-w-[280px] text-center">
            {format(weekStart, 'd MMMM', { locale: he })} - {format(weekEnd, 'd MMMM yyyy', { locale: he })}
          </h3>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek('next')}
            className="h-9 w-9 rounded-xl border-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToCurrentWeek}
          className="flex items-center gap-2 rounded-xl border-2 font-semibold h-9 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
        >
          <CalendarDays className="h-4 w-4" />
          השבוע
        </Button>
      </div>

      {/* Week grid */}
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(renderDay)}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs p-4 bg-muted/20 rounded-xl border border-border/30">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-red-50 border-2 border-red-300 rounded-md"></div>
          <span className="text-muted-foreground">עדיפות גבוהה</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-amber-50 border-2 border-amber-300 rounded-md"></div>
          <span className="text-muted-foreground">עדיפות בינונית</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-blue-50 border-2 border-blue-300 rounded-md"></div>
          <span className="text-muted-foreground">שיחת טלפון</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-md"></div>
          <span className="text-muted-foreground">פגישה</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-violet-50 border-2 border-violet-300 rounded-md"></div>
          <span className="text-muted-foreground">מעקב</span>
        </div>
        {onTaskDateChange && (
          <div className="flex items-center gap-1.5 text-primary font-medium">
            <span>💡</span>
            <span>ניתן לגרור משימות בין תאריכים</span>
          </div>
        )}
      </div>
    </div>
  );
}
