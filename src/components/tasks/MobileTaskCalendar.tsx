
import { useState } from "react";
import { format, isSameDay, isToday, isPast } from "date-fns";
import { MobileCard } from "@/components/mobile/MobileCard";
import { MobileButton } from "@/components/mobile/MobileButton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface MobileTaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function MobileTaskCalendar({ tasks, onTaskClick }: MobileTaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"today" | "upcoming">("today");

  const getTasksForToday = () => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), new Date());
    });
  };

  const getUpcomingTasks = () => {
    return tasks
      .filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate > new Date() && !isSameDay(taskDate, new Date());
      })
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 10); // Show next 10 upcoming tasks
  };

  const getTaskTypeColor = (task: Task) => {
    const now = new Date();
    const taskDate = task.due_date ? new Date(task.due_date) : null;
    
    if (!taskDate) return "bg-gray-100 border-gray-300";
    
    if (isSameDay(taskDate, now)) {
      return "bg-yellow-100 border-yellow-300 text-yellow-800";
    } else if (taskDate < now) {
      return "bg-red-100 border-red-300 text-red-800";
    } else {
      return "bg-blue-100 border-blue-300 text-blue-800";
    }
  };

  const todayTasks = getTasksForToday();
  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex gap-3">
        <MobileButton
          variant={viewMode === "today" ? "primary" : "outline"}
          size="sm"
          onClick={() => setViewMode("today")}
          className="flex-1"
        >
          היום ({todayTasks.length})
        </MobileButton>
        <MobileButton
          variant={viewMode === "upcoming" ? "primary" : "outline"}
          size="sm"
          onClick={() => setViewMode("upcoming")}
          className="flex-1"
        >
          קרובים ({upcomingTasks.length})
        </MobileButton>
      </div>

      {/* Today's Tasks */}
      {viewMode === "today" && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <h3 className="text-xl font-bold text-[#2F3C7E] mb-1">
              משימות להיום
            </h3>
            <p className="text-sm text-gray-600">
              {format(new Date(), "dd/MM/yyyy")} - {todayTasks.length} משימות
            </p>
          </div>
          
          {todayTasks.length === 0 ? (
            <MobileCard className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1 text-gray-600">אין משימות להיום</p>
              <p className="text-sm text-gray-500">תיהנה מיום פנוי! 🎉</p>
            </MobileCard>
          ) : (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <MobileCard
                  key={task.id}
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all",
                    getTaskTypeColor(task)
                  )}
                  onClick={() => onTaskClick(task)}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-base flex-1">{task.title}</h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0 mr-3">
                        <Clock className="h-4 w-4" />
                        {format(new Date(task.due_date!), "HH:mm")}
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {task.type === 'call' ? 'שיחה' : 
                         task.type === 'meeting' ? 'פגישה' : 
                         task.type === 'follow_up' ? 'מעקב' : 'משימה'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          task.priority === 'high' ? 'border-red-300 text-red-700' :
                          task.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        )}
                      >
                        {task.priority === 'high' ? 'עדיפות גבוהה' : 
                         task.priority === 'medium' ? 'עדיפות בינונית' : 'עדיפות נמוכה'}
                      </Badge>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Tasks */}
      {viewMode === "upcoming" && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <h3 className="text-xl font-bold text-[#2F3C7E] mb-1">
              משימות קרובות
            </h3>
            <p className="text-sm text-gray-600">
              {upcomingTasks.length} משימות עתידיות
            </p>
          </div>
          
          {upcomingTasks.length === 0 ? (
            <MobileCard className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1 text-gray-600">אין משימות עתידיות</p>
              <p className="text-sm text-gray-500">הכל נראה שקט לעת עתה</p>
            </MobileCard>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map(task => (
                <MobileCard
                  key={task.id}
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all",
                    getTaskTypeColor(task)
                  )}
                  onClick={() => onTaskClick(task)}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-base flex-1">{task.title}</h4>
                      <div className="text-sm text-gray-600 flex-shrink-0 mr-3">
                        <div className="text-xs text-gray-500">
                          {format(new Date(task.due_date!), "dd/MM")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(task.due_date!), "HH:mm")}
                        </div>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {task.type === 'call' ? 'שיחה' : 
                         task.type === 'meeting' ? 'פגישה' : 
                         task.type === 'follow_up' ? 'מעקב' : 'משימה'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          task.priority === 'high' ? 'border-red-300 text-red-700' :
                          task.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        )}
                      >
                        {task.priority === 'high' ? 'עדיפות גבוהה' : 
                         task.priority === 'medium' ? 'עדיפות בינונית' : 'עדיפות נמוכה'}
                      </Badge>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
