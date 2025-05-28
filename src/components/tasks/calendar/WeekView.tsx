
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday, isPast } from "date-fns";
import { he } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  tasks: Task[];
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

export function WeekView({ tasks, selectedDate, onSelectedDateChange, onTaskClick }: WeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });

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

  const getTaskStatusIndicator = (task: Task) => {
    if (task.status === 'completed') return "line-through opacity-60";
    if (!task.due_date) return "";
    
    const taskDate = new Date(task.due_date);
    if (isPast(taskDate) && !isSameDay(taskDate, new Date())) return "border-r-4 border-r-red-500";
    if (isToday(taskDate)) return "border-r-4 border-r-yellow-500";
    
    return "";
  };

  const renderDay = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    const isSelectedDate = isSameDay(date, selectedDate);
    const isTodayDate = isToday(date);

    return (
      <div key={date.toString()} className="flex-1 min-h-[200px]">
        <div 
          className={cn(
            "p-3 border border-gray-200 h-full cursor-pointer transition-colors",
            isSelectedDate && "bg-blue-50 border-blue-300",
            isTodayDate && "bg-yellow-50 border-yellow-300",
            "hover:bg-gray-50"
          )}
          onClick={() => onSelectedDateChange(date)}
        >
          {/* Day header */}
          <div className="flex items-center justify-between mb-2">
            <div className={cn(
              "text-sm font-medium",
              isTodayDate && "text-blue-600 font-bold"
            )}>
              {format(date, 'EEEE', { locale: he })}
            </div>
            <div className={cn(
              "text-lg font-bold",
              isTodayDate && "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
            )}>
              {format(date, 'd')}
            </div>
          </div>

          {/* Tasks for this day */}
          <div className="space-y-1">
            {dayTasks.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4">
                אין משימות
              </div>
            ) : (
              dayTasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  className={cn(
                    "p-2 rounded border text-xs cursor-pointer hover:shadow-sm transition-all",
                    getTaskTypeColor(task),
                    getTaskStatusIndicator(task)
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                >
                  <div className="font-medium truncate mb-1">{task.title}</div>
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-xs opacity-75">
                      <Clock className="h-3 w-3" />
                      {format(new Date(task.due_date), 'HH:mm')}
                    </div>
                  )}
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {task.type === 'call' ? 'שיחה' : 
                       task.type === 'meeting' ? 'פגישה' : 
                       task.type === 'follow_up' ? 'מעקב' : 'משימה'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
            
            {dayTasks.length > 4 && (
              <div className="text-xs text-center text-gray-500 py-1 bg-gray-100 rounded">
                +{dayTasks.length - 4} עוד
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        {/* Week header */}
        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold text-[#2F3C7E]">
            {format(weekStart, 'd MMMM', { locale: he })} - {format(weekEnd, 'd MMMM yyyy', { locale: he })}
          </h3>
        </div>

        {/* Week grid */}
        <div className="flex gap-1 overflow-x-auto">
          {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(renderDay)}
        </div>

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
