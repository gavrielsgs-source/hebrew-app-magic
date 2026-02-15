
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { he } from "date-fns/locale";
import { useTasks } from "@/hooks/use-tasks";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const { tasks, updateTask } = useTasks();
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), day);
    });
  };

  const handleTaskClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    navigate(`/tasks?taskId=${taskId}`);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDay: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newDueDate = format(targetDay, "yyyy-MM-dd'T'HH:mm:ss");
    updateTask.mutate({ id: taskId, data: { due_date: newDueDate } });
    setDraggedTaskId(null);
  };

  const renderCalendarDays = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const cloneDay = day;
      const dayTasks = getTasksForDay(cloneDay);
      const isCurrentMonth = isSameMonth(cloneDay, monthStart);
      const isToday = isSameDay(cloneDay, new Date());

      days.push(
        <div
          key={day.toString()}
          className={`
            min-h-[60px] p-1 border border-border text-sm
            ${isCurrentMonth ? 'bg-card' : 'bg-muted text-muted-foreground'}
            ${isToday ? 'bg-primary/5 border-primary/30' : ''}
            hover:bg-muted/50 cursor-pointer transition-colors
          `}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, cloneDay)}
        >
          <div className={`
            font-medium mb-1 text-right
            ${isToday ? 'text-primary font-bold' : ''}
          `}>
            {format(cloneDay, 'd')}
          </div>
          
          <div className="space-y-1">
            {dayTasks.slice(0, 2).map((task, index) => (
              <div
                key={`${task.id}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={(e) => handleTaskClick(e, task.id)}
                className={`
                  text-xs p-1 rounded text-primary-foreground truncate cursor-grab active:cursor-grabbing
                  ${task.type === 'meeting' ? 'bg-green-600' : 'bg-primary'}
                  ${draggedTaskId === task.id ? 'opacity-50' : ''}
                  hover:brightness-110 transition-all
                `}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dayTasks.length - 2} עוד
              </div>
            )}
          </div>
        </div>
      );

      day = addDays(day, 1);
    }

    return days;
  };

  const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            יומן משימות
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={prevMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: he })}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={nextMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0 border">
          {renderCalendarDays()}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>משימה</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>פגישה</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
