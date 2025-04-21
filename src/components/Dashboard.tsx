
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Car, Calendar, AlertCircle } from "lucide-react";
import { LeadsTable } from "@/components/LeadsTable";
import { CarsTable } from "@/components/CarsTable";
import { TaskList } from "@/components/TaskList";
import { UserNav } from "@/components/auth/UserNav";
import { SalesAnalytics } from "@/components/analytics/SalesAnalytics";

// Inline SVG logo for guaranteed display
const CarSleadLogoSVG = () => (
  <svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="10" fill="#1A1F2C"/>
    <path d="M20 40C20 28.9543 28.9543 20 40 20C51.0457 20 60 28.9543 60 40C60 51.0457 51.0457 60 40 60C28.9543 60 20 51.0457 20 40Z" fill="#33C3F0"/>
    <path d="M25 40H55" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M35 30L40 35L45 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M35 50L40 45L45 50" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-100">
        <div className="flex items-center gap-3">
          <CarSleadLogoSVG />
          <h1 className="text-3xl font-extrabold tracking-tight font-rubik text-gray-900">
            CarsLead
          </h1>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <UserNav />
        </div>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">לידים חדשים</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">18</div>
            <p className="text-xs text-blue-600">
              +12% מהשבוע שעבר
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">רכבים במלאי</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Car className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">24</div>
            <p className="text-xs text-indigo-600">
              +2 רכבים מהחודש שעבר
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">פגישות היום</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">3</div>
            <p className="text-xs text-amber-600">
              2 פגישות חדשות
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">משימות לביצוע</CardTitle>
            <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">7</div>
            <p className="text-xs text-rose-600">
              5 משימות דחופות
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="font-rubik bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
          <TabsTrigger value="overview" className="font-rubik data-[state=active]:bg-gray-900 data-[state=active]:text-white">סיכום</TabsTrigger>
          <TabsTrigger value="leads" className="font-rubik data-[state=active]:bg-gray-900 data-[state=active]:text-white">לידים</TabsTrigger>
          <TabsTrigger value="cars" className="font-rubik data-[state=active]:bg-gray-900 data-[state=active]:text-white">רכבים</TabsTrigger>
          <TabsTrigger value="tasks" className="font-rubik data-[state=active]:bg-gray-900 data-[state=active]:text-white">משימות</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <SalesAnalytics />
            <Card className="col-span-3 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100">
              <CardHeader>
                <CardTitle className="font-rubik text-gray-900">משימות להיום</CardTitle>
                <CardDescription className="font-rubik">סה"כ 7 משימות מתוכננות</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="leads" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="font-rubik text-gray-900">לידים</CardTitle>
              <CardDescription className="font-rubik">רשימת כל הלידים במערכת</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cars" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="font-rubik text-gray-900">רכבים במלאי</CardTitle>
              <CardDescription className="font-rubik">רשימת הרכבים הזמינים למכירה</CardDescription>
            </CardHeader>
            <CardContent>
              <CarsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="font-rubik text-gray-900">משימות</CardTitle>
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
