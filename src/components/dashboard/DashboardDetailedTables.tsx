
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadsTable } from "@/components/LeadsTable";
import { CarsTable } from "@/components/CarsTable";
import { TaskList } from "@/components/TaskList";

export function DashboardDetailedTables() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 text-right">טבלת נתונים מפורטים</CardTitle>
        <CardDescription className="text-right">צפייה מפורטת בכל הנתונים</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tasks" dir="rtl" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="tasks">משימות</TabsTrigger>
            <TabsTrigger value="overview">סקירה</TabsTrigger>
            <TabsTrigger value="leads">לידים</TabsTrigger>
            <TabsTrigger value="cars">רכבים</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="min-h-[400px]">
            <TaskList />
          </TabsContent>
          
          <TabsContent value="overview" className="min-h-[400px]">
            <div className="text-center py-8 text-muted-foreground">
              <p>סקירה כללית של הפעילות - בחר לשונית ספציפית לצפייה מפורטת</p>
            </div>
          </TabsContent>
          
          <TabsContent value="leads" className="min-h-[400px]">
            <LeadsTable />
          </TabsContent>
          
          <TabsContent value="cars" className="min-h-[400px]">
            <CarsTable />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}