import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isToday, isSameMonth, addMonths, subMonths } from "date-fns";
import { he } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Plus } from "lucide-react";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DetailedDayView } from "./DetailedDayView";

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  onTaskClick?: (task: Task) => void;
  onTaskDateChange?: (taskId: string, newDate: Date) => void;
  onCreateTask?: (date: Date) => void;
}

export function CalendarView({ 
  tasks, 
  selectedDate, 
  onSelectedDateChange, 
  onTaskClick, 
  onTaskDateChange,
  onCreateTask
}: CalendarViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showDetailedDay, setShowDetailedDay] = useState(false);
  const [detailedDayDate, setDetailedDayDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1);
    onSelectedDateChange(newDate);
  };

  const goToCurrentMonth = () => {
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

    if (task.priority === 'high') return priorityColors.high;
    if (task.priority === 'medium') return priorityColors.medium;
    if (task.priority === 'low') return priorityColors.low;

    return baseColors[task.type as keyof typeof baseColors] || baseColors.task;
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

  const handleDateDoubleClick = (date: Date) => {
    if (onCreateTask) {
      onCreateTask(date);
    }
  };

  const handleDateClick = (date: Date) => {
    onSelectedDateChange(date);
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length > 0) {
      setDetailedDayDate(date);
      setShowDetailedDay(true);
    }
  };

  const handleShowDetailedDay = (date: Date) => {
    setDetailedDayDate(date);
    setShowDetailedDay(true);
  };

  const renderDay = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    const isSelectedDate = isSameDay(date, selectedDate);
    const isTodayDate = isToday(date);
    const isCurrentMonth = isSameMonth(date, selectedDate);
    const isDragOver = dragOverDate && isSameDay(dragOverDate, date);
    const isHovered = hoveredDate && isSameDay(hoveredDate, date);

    return (
      <div
        key={date.toString()}
        className={cn(
          "min-h-[110px] p-2 border-2 cursor-pointer transition-all duration-200 relative group rounded-xl",
          isSelectedDate && "bg-primary/5 border-primary/50",
          isTodayDate && !isSelectedDate && "bg-amber-50/50 border-amber-300/50",
          !isCurrentMonth && "bg-muted/30 opacity-60",
          isDragOver && "bg-emerald-50 border-emerald-400 border-dashed",
          !isSelectedDate && !isTodayDate && !isDragOver && isCurrentMonth && "border-border/50 hover:border-border hover:bg-muted/20"
        )}
        onClick={() => handleDateClick(date)}
        onDoubleClick={() => handleDateDoubleClick(date)}
        onMouseEnter={() => setHoveredDate(date)}
        onMouseLeave={() => setHoveredDate(null)}
        onDragOver={(e) => handleDragOver(e, date)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, date)}
      >
        {/* Day number */}
        <div className="flex items-center justify-between mb-1.5">
          <div className={cn(
            "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all",
            isTodayDate && "bg-primary text-primary-foreground shadow-md",
            !isCurrentMonth && "text-muted-foreground",
            isSelectedDate && !isTodayDate && "bg-primary/10 text-primary"
          )}>
            {format(date, 'd')}
          </div>
          
          {/* Add task button - appears on hover */}
          {isHovered && onCreateTask && isCurrentMonth && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDateDoubleClick(date);
              }}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-primary text-primary-foreground rounded-lg w-6 h-6 flex items-center justify-center hover:bg-primary/80 shadow-sm"
              title="הוסף משימה"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Tasks for this day */}
        <div className="space-y-1">
          {dayTasks.length === 0 && isDragOver ? (
            <div className="text-xs text-emerald-600 text-center py-4 font-medium bg-emerald-50/50 rounded-lg">
              שחרר כאן
            </div>
          ) : dayTasks.length === 0 && isHovered && onCreateTask && isCurrentMonth ? (
            <div className="text-[10px] text-muted-foreground text-center py-4 opacity-0 group-hover:opacity-100 transition-opacity">
              לחץ פעמיים להוספה
            </div>
          ) : (
            <>
              {dayTasks.slice(0, 2).map(task => (
                <div
                  key={task.id}
                  draggable={onTaskDateChange ? true : false}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "p-1.5 rounded-lg border text-[11px] cursor-pointer hover:shadow-sm transition-all truncate",
                    getTaskTypeColor(task),
                    task.status === 'completed' && "line-through opacity-60",
                    onTaskDateChange && "cursor-move",
                    draggedTask?.id === task.id && "opacity-50 scale-95"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick?.(task);
                  }}
                  title={task.title}
                >
                  <div className="font-semibold truncate">{task.title}</div>
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-[10px] opacity-75 mt-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {format(new Date(task.due_date), 'HH:mm')}
                    </div>
                  )}
                </div>
              ))}
              
              {dayTasks.length > 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowDetailedDay(date);
                  }}
                  className="text-[10px] text-center text-primary py-1 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors w-full font-semibold"
                >
                  +{dayTasks.length - 2} עוד
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderWeekDays = () => {
    const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return (
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-2.5 text-center text-sm font-semibold text-muted-foreground bg-muted/40 rounded-lg">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const days = [];
    let currentDate = calendarStart;
    
    while (currentDate <= calendarEnd) {
      days.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(renderDay)}
      </div>
    );
  };

  // Show detailed day view if requested
  if (showDetailedDay && detailedDayDate) {
    return (
      <DetailedDayView
        selectedDate={detailedDayDate}
        tasks={tasks}
        onClose={() => setShowDetailedDay(false)}
        onTaskClick={onTaskClick}
        onTaskUpdate={async (taskId, updates) => {
          console.log('Update task:', taskId, updates);
        }}
        onTaskDelete={(taskId) => {
          console.log('Delete task:', taskId);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Month header with navigation */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border-2 border-border/30">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="h-9 w-9 rounded-xl border-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-bold text-foreground min-w-[180px] text-center">
            {format(selectedDate, 'MMMM yyyy', { locale: he })}
          </h3>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="h-9 w-9 rounded-xl border-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToCurrentMonth}
          className="flex items-center gap-2 rounded-xl border-2 font-semibold h-9 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
        >
          <CalendarDays className="h-4 w-4" />
          החודש
        </Button>
      </div>

      {/* Week days header */}
      {renderWeekDays()}

      {/* Calendar grid */}
      {renderCalendarGrid()}

      {/* Enhanced Legend */}
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
        {onCreateTask && (
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span>✨</span>
            <span>לחץ פעמיים להוספת משימה</span>
          </div>
        )}
      </div>
    </div>
  );
}
