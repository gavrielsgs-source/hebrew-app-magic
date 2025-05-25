
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TaskCalendar({ tasks, onTaskClick }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "agenda">("calendar");

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), date);
    });
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

  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar View */}
      <div className="lg:col-span-2">
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-[#2F3C7E] flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                יומן משימות
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="text-sm"
                >
                  לוח שנה
                </Button>
                <Button
                  variant={viewMode === "agenda" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("agenda")}
                  className="text-sm"
                >
                  סדר יום
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "calendar" ? (
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border-0"
                  modifiers={{
                    hasTask: (date) => getTasksForDate(date).length > 0
                  }}
                  modifiersStyles={{
                    hasTask: {
                      backgroundColor: "#EBF8FF",
                      color: "#2B6CB0",
                      fontWeight: "bold"
                    }
                  }}
                />
                <div className="flex gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div>
                    היום
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-200 border border-red-300"></div>
                    עבר
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></div>
                    עתידי
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks
                  .filter(task => task.due_date)
                  .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                  .map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                        getTaskTypeColor(task)
                      )}
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(task.due_date!), "dd/MM/yyyy")}
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(task.due_date!), "HH:mm")}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {task.type === 'call' ? 'שיחה' : 
                           task.type === 'meeting' ? 'פגישה' : 
                           task.type === 'follow_up' ? 'מעקב' : 'משימה'}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Tasks */}
      <div>
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-[#2F3C7E]">
              משימות ליום {format(selectedDate, "dd/MM/yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">אין משימות ליום זה</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                      getTaskTypeColor(task)
                    )}
                    onClick={() => onTaskClick(task)}
                  >
                    <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(task.due_date!), "HH:mm")}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.priority === 'high' ? 'גבוהה' : 
                         task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
