
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Car, Calendar, AlertCircle } from "lucide-react";
import { LeadsTable } from "@/components/LeadsTable";
import { CarsTable } from "@/components/CarsTable";
import { TaskList } from "@/components/TaskList";
import { ActivityChart } from "@/components/ActivityChart";
import { UserNav } from "@/components/auth/UserNav";
import { SalesAnalytics } from "@/components/analytics/SalesAnalytics";
import LogoCarslead from "@/assets/logo-carslead.svg" // הנח שהקובץ קיים

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={LogoCarslead}
            alt="CarsLead Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-3xl font-extrabold tracking-tight font-rubik">
            CarsLead
          </h1>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <UserNav />
        </div>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">לידים חדשים</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">18</div>
            <p className="text-xs text-muted-foreground">
              +12% מהשבוע שעבר
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">רכבים במלאי</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">24</div>
            <p className="text-xs text-muted-foreground">
              +2 רכבים מהחודש שעבר
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">פגישות היום</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">3</div>
            <p className="text-xs text-muted-foreground">
              2 פגישות חדשות
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">משימות לביצוע</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">7</div>
            <p className="text-xs text-muted-foreground">
              5 משימות דחופות
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="font-rubik">
          <TabsTrigger value="overview">סיכום</TabsTrigger>
          <TabsTrigger value="leads">לידים</TabsTrigger>
          <TabsTrigger value="cars">רכבים</TabsTrigger>
          <TabsTrigger value="tasks">משימות</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <SalesAnalytics />
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="font-rubik">משימות להיום</CardTitle>
                <CardDescription className="font-rubik">סה"כ 7 משימות מתוכננות</CardDescription>
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
              <CardTitle className="font-rubik">לידים</CardTitle>
              <CardDescription className="font-rubik">רשימת כל הלידים במערכת</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cars" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-rubik">רכבים במלאי</CardTitle>
              <CardDescription className="font-rubik">רשימת הרכבים הזמינים למכירה</CardDescription>
            </CardHeader>
            <CardContent>
              <CarsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-rubik">משימות</CardTitle>
              <CardDescription className="font-rubik">רשימת המשימות והתזכורות שלך</CardDescription>
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
