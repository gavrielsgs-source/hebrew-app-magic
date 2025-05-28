
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isToday, isSameMonth, addMonths, subMonths } from "date-fns";
import { he } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  onTaskClick?: (task: Task) => void;
}

export function CalendarView({ tasks, selectedDate, onSelectedDateChange, onTaskClick }: CalendarViewProps) {
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
    const baseColors = {
      call: "bg-blue-100 border-blue-300 text-blue-800",
      meeting: "bg-green-100 border-green-300 text-green-800", 
      follow_up: "bg-purple-100 border-purple-300 text-purple-800",
      task: "bg-gray-100 border-gray-300 text-gray-800"
    };

    const priorityColors = {
      high: "bg-red-100 border-red-400 text-red-900",
      medium: "bg-yellow-100 border-yellow-400 text-yellow-900",
      low: "bg-green-100 border-green-400 text-green-900"
    };

    // Priority overrides type for visual importance
    if (task.priority === 'high') return priorityColors.high;
    if (task.priority === 'medium') return priorityColors.medium;
    if (task.priority === 'low') return priorityColors.low;

    return baseColors[task.type as keyof typeof baseColors] || baseColors.task;
  };

  const renderDay = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    const isSelectedDate = isSameDay(date, selectedDate);
    const isTodayDate = isToday(date);
    const isCurrentMonth = isSameMonth(date, selectedDate);

    return (
      <div
        key={date.toString()}
        className={cn(
          "min-h-[120px] p-1 border border-gray-200 cursor-pointer transition-all duration-200",
          isSelectedDate && "bg-blue-50 border-blue-300",
          isTodayDate && "bg-yellow-50 border-yellow-300",
          !isCurrentMonth && "bg-gray-50 text-gray-400",
          "hover:bg-gray-50"
        )}
        onClick={() => onSelectedDateChange(date)}
      >
        {/* Day number */}
        <div className={cn(
          "text-sm font-medium mb-1",
          isTodayDate && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs",
          !isCurrentMonth && "text-gray-400"
        )}>
          {format(date, 'd')}
        </div>

        {/* Tasks for this day */}
        <div className="space-y-1">
          {dayTasks.slice(0, 3).map(task => (
            <div
              key={task.id}
              className={cn(
                "p-1 rounded border text-xs cursor-pointer hover:shadow-sm transition-all truncate",
                getTaskTypeColor(task),
                task.status === 'completed' && "line-through opacity-60"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick?.(task);
              }}
              title={task.title}
            >
              <div className="font-medium truncate">{task.title}</div>
              {task.due_date && (
                <div className="flex items-center gap-1 text-xs opacity-75">
                  <Clock className="h-2 w-2" />
                  {format(new Date(task.due_date), 'HH:mm')}
                </div>
              )}
            </div>
          ))}
          
          {dayTasks.length > 3 && (
            <div className="text-xs text-center text-gray-500 py-1 bg-gray-100 rounded">
              +{dayTasks.length - 3}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekDays = () => {
    const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50 rounded">
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
      <div className="grid grid-cols-7 gap-1">
        {days.map(renderDay)}
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        {/* Month header with navigation */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-bold text-[#2F3C7E] min-w-[200px] text-center">
              {format(selectedDate, 'MMMM yyyy', { locale: he })}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentMonth}
            className="flex items-center gap-1 text-[#2F3C7E] border-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white"
          >
            <CalendarDays className="h-4 w-4" />
            החודש
          </Button>
        </div>

        {/* Week days header */}
        {renderWeekDays()}

        {/* Calendar grid */}
        {renderCalendarGrid()}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-400 rounded"></div>
            <span>עדיפות גבוהה</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-400 rounded"></div>
            <span>עדיפות בינונית</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>שיחת טלפון</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>פגישה</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span>מעקב</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
