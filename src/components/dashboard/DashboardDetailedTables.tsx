
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Users, Car, CheckSquare } from "lucide-react";
import { LeadsTable } from "@/components/LeadsTable";
import { CarsTable } from "@/components/CarsTable";
import { TaskList } from "@/components/TaskList";

export function DashboardDetailedTables() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 text-right">נתונים מפורטים</CardTitle>
        <CardDescription className="text-right">גש לכל המידע על הלידים, רכבים ומשימות</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              <Eye className="h-4 w-4 ml-2" />
              סקירה
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-white">
              <Users className="h-4 w-4 ml-2" />
              לידים
            </TabsTrigger>
            <TabsTrigger value="cars" className="data-[state=active]:bg-white">
              <Car className="h-4 w-4 ml-2" />
              רכבים
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-white">
              <CheckSquare className="h-4 w-4 ml-2" />
              משימות
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">תצוגה כללית</h3>
              <p className="text-gray-600 max-w-md mx-auto">בחר באחת הלשוניות למעלה כדי לראות פרטים מלאים על הלידים, הרכבים או המשימות שלך</p>
            </div>
          </TabsContent>
          
          <TabsContent value="leads" className="space-y-4">
            <LeadsTable />
          </TabsContent>
          
          <TabsContent value="cars" className="space-y-4">
            <CarsTable />
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <TaskList extended={true} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
