import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadsTable } from "@/components/LeadsTable";
import { CarsTable } from "@/components/CarsTable";
import { TaskList } from "@/components/TaskList";
import { Table2 } from "lucide-react";

export function DashboardDetailedTables() {
  return (
    <Card className="bg-card shadow-lg rounded-2xl border-2 overflow-hidden">
      <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Table2 className="h-5 w-5 text-primary" />
          </div>
          <div className="text-right">
            <CardTitle className="text-foreground">טבלת נתונים מפורטים</CardTitle>
            <CardDescription>צפייה מפורטת בכל הנתונים</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs defaultValue="tasks" dir="rtl" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 h-12 bg-muted/50 rounded-xl p-1">
            <TabsTrigger 
              value="tasks" 
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
            >
              משימות
            </TabsTrigger>
            <TabsTrigger 
              value="overview"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
            >
              סקירה
            </TabsTrigger>
            <TabsTrigger 
              value="leads"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
            >
              לידים
            </TabsTrigger>
            <TabsTrigger 
              value="cars"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
            >
              רכבים
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="min-h-[400px]">
            <TaskList />
          </TabsContent>
          
          <TabsContent value="overview" className="min-h-[400px]">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <Table2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">סקירה כללית של הפעילות - בחר לשונית ספציפית לצפייה מפורטת</p>
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
