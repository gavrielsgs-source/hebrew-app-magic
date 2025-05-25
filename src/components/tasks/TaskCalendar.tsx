
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
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Calendar View - Now takes more space */}
      <div className="xl:col-span-3">
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
              <div className="space-y-6">
                {/* Larger calendar with better spacing */}
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border-0 scale-110"
                    modifiers={{
                      hasTask: (date) => getTasksForDate(date).length > 0
                    }}
                    modifiersStyles={{
                      hasTask: {
                        backgroundColor: "#EBF8FF",
                        color: "#2B6CB0",
                        fontWeight: "bold",
                        border: "2px solid #3182CE"
                      }
                    }}
                  />
                </div>
                <div className="flex justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-200 border-2 border-yellow-300"></div>
                    משימות להיום
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-200 border-2 border-red-300"></div>
                    משימות שעברו
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-200 border-2 border-blue-300"></div>
                    משימות עתידיות
                  </div>
                </div>
              </div>
            ) : (
              // Enhanced agenda view - shows only today's tasks and reminders
              <div className="space-y-4">
                <div className="text-center py-4 border-b">
                  <h3 className="text-xl font-bold text-[#2F3C7E]">
                    סדר יום ליום {format(new Date(), "dd/MM/yyyy")}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    המשימות והתזכורות שלך להיום
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {tasks
                    .filter(task => {
                      if (!task.due_date) return false;
                      return isSameDay(new Date(task.due_date), new Date());
                    })
                    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                    .map(task => (
                      <div
                        key={task.id}
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                          getTaskTypeColor(task)
                        )}
                        onClick={() => onTaskClick(task)}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-base mb-2">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(task.due_date!), "HH:mm")}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {task.type === 'call' ? 'שיחה' : 
                                 task.type === 'meeting' ? 'פגישה' : 
                                 task.type === 'follow_up' ? 'מעקב' : 'משימה'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.priority === 'high' ? 'עדיפות גבוהה' : 
                                 task.priority === 'medium' ? 'עדיפות בינונית' : 'עדיפות נמוכה'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {tasks.filter(task => task.due_date && isSameDay(new Date(task.due_date), new Date())).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium mb-1">אין משימות להיום</p>
                      <p className="text-sm">תיהנה מיום פנוי! 🎉</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Tasks - Now takes less space */}
      <div className="xl:col-span-1">
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
