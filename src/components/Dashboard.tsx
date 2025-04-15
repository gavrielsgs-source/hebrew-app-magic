
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Car, Calendar, AlertCircle } from "lucide-react";
import { LeadsTable } from "@/components/LeadsTable";
import { CarsTable } from "@/components/CarsTable";
import { TaskList } from "@/components/TaskList";
import { ActivityChart } from "@/components/ActivityChart";
import { UserNav } from "@/components/auth/UserNav";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">CarsLead</h1>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <UserNav />
        </div>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לידים חדשים</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              +12% מהשבוע שעבר
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">רכבים במלאי</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 רכבים מהחודש שעבר
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פגישות היום</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 פגישות חדשות
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משימות לביצוע</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              5 משימות דחופות
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">סיכום</TabsTrigger>
          <TabsTrigger value="leads">לידים</TabsTrigger>
          <TabsTrigger value="cars">רכבים</TabsTrigger>
          <TabsTrigger value="tasks">משימות</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>פעילות</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ActivityChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>משימות להיום</CardTitle>
                <CardDescription>סה"כ 7 משימות מתוכננות</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>לידים</CardTitle>
              <CardDescription>רשימת כל הלידים במערכת</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cars" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>רכבים במלאי</CardTitle>
              <CardDescription>רשימת הרכבים הזמינים למכירה</CardDescription>
            </CardHeader>
            <CardContent>
              <CarsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>משימות</CardTitle>
              <CardDescription>רשימת המשימות והתזכורות שלך</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList extended={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
