
import { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, subWeeks, addMonths, subMonths, isSameDay, isToday, isSameMonth } from "date-fns";
import { he } from "date-fns/locale";
import { type Task } from "@/types/task";
import { EditTaskDialog } from "./EditTaskDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Calendar, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileTaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, isCompleted: boolean) => void;
}

export function MobileTaskCalendar({ tasks, onTaskClick, onTaskStatusChange }: MobileTaskCalendarProps) {
  const [calendarMode, setCalendarMode] = useState<"week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const getTasksForDate = (date: Date) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (!task || !task.due_date) return false;
      try {
        return isSameDay(new Date(task.due_date), date);
      } catch { return false; }
    });
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  const navigateTime = (direction: 'prev' | 'next') => {
    if (calendarMode === 'week') {
      setSelectedDate(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
    }
  };

  const getTaskTypeColor = (task: Task) => {
    if (task.priority === 'high') return "bg-red-100 border-red-300";
    if (task.priority === 'medium') return "bg-amber-100 border-amber-300";
    if (task.priority === 'low') return "bg-emerald-100 border-emerald-300";
    return "bg-muted border-border";
  };

  const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  const renderWeekView = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="space-y-3">
        {/* Week navigation */}
        <div className="flex items-center justify-between px-1">
          <Button variant="ghost" size="icon" onClick={() => navigateTime('prev')} className="h-8 w-8 rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold text-foreground">
            {format(weekStart, 'd MMM', { locale: he })} - {format(endOfWeek(selectedDate, { weekStartsOn: 0 }), 'd MMM yyyy', { locale: he })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigateTime('next')} className="h-8 w-8 rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Week days grid */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-1">
              {day}
            </div>
          ))}
          {days.map(date => {
            const dayTasks = getTasksForDate(date);
            const isSelected = isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);
            
            return (
              <button
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center py-2 rounded-xl transition-all min-h-[56px] relative",
                  isSelected && "bg-primary text-primary-foreground shadow-md",
                  isTodayDate && !isSelected && "bg-primary/10 border border-primary/30",
                  !isSelected && !isTodayDate && "hover:bg-muted/50"
                )}
              >
                <span className={cn(
                  "text-sm font-bold",
                  isSelected && "text-primary-foreground",
                  !isSelected && isTodayDate && "text-primary"
                )}>
                  {format(date, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dayTasks.slice(0, 3).map((_, i) => (
                      <div key={i} className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground/70" : "bg-primary"
                      )} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const days: Date[] = [];
    let currentDate = calendarStart;
    while (currentDate <= calendarEnd) {
      days.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    return (
      <div className="space-y-3">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-1">
          <Button variant="ghost" size="icon" onClick={() => navigateTime('prev')} className="h-8 w-8 rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold text-foreground">
            {format(selectedDate, 'MMMM yyyy', { locale: he })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigateTime('next')} className="h-8 w-8 rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-1">
              {day}
            </div>
          ))}
          {days.map(date => {
            const dayTasks = getTasksForDate(date);
            const isSelected = isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);
            const isCurrentMonth = isSameMonth(date, selectedDate);

            return (
              <button
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center py-1.5 rounded-lg transition-all min-h-[40px] relative",
                  isSelected && "bg-primary text-primary-foreground shadow-md",
                  isTodayDate && !isSelected && "bg-primary/10 border border-primary/30",
                  !isCurrentMonth && "opacity-40",
                  !isSelected && !isTodayDate && isCurrentMonth && "hover:bg-muted/50"
                )}
              >
                <span className={cn(
                  "text-xs font-bold",
                  isSelected && "text-primary-foreground",
                  !isSelected && isTodayDate && "text-primary"
                )}>
                  {format(date, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayTasks.slice(0, 3).map((_, i) => (
                      <div key={i} className={cn(
                        "w-1 h-1 rounded-full",
                        isSelected ? "bg-primary-foreground/70" : "bg-primary"
                      )} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Calendar mode toggle */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border border-border/30">
        <button
          onClick={() => setCalendarMode("week")}
          className={cn(
            "flex-1 h-9 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all",
            calendarMode === "week"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Grid3X3 className="h-3.5 w-3.5" />
          שבוע
        </button>
        <button
          onClick={() => setCalendarMode("month")}
          className={cn(
            "flex-1 h-9 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all",
            calendarMode === "month"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          חודש
        </button>
      </div>

      {/* Today button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(new Date())}
          className="rounded-xl border text-xs font-semibold h-8"
        >
          <CalendarDays className="h-3.5 w-3.5 ml-1.5" />
          היום
        </Button>
      </div>

      {/* Calendar view */}
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
        {calendarMode === "week" ? renderWeekView() : renderMonthView()}
      </div>

      {/* Selected date tasks */}
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          משימות ליום {format(selectedDate, "dd/MM/yyyy")}
          <Badge variant="secondary" className="text-xs mr-auto">{selectedDateTasks.length}</Badge>
        </h3>

        {selectedDateTasks.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            אין משימות ליום זה
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={cn(
                  "p-3 rounded-xl border-2 cursor-pointer hover:shadow-md transition-all",
                  getTaskTypeColor(task),
                  task.status === 'completed' && "opacity-60"
                )}
              >
                <div className={cn(
                  "font-semibold text-sm",
                  task.status === 'completed' && "line-through"
                )}>
                  {task.title}
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.due_date), 'HH:mm')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <EditTaskDialog 
          task={editingTask}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </div>
  );
}
