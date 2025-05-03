
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Car, Calendar, AlertCircle } from "lucide-react";
import { LeadsTable } from "@/components/LeadsTable";
import { CarsTable } from "@/components/CarsTable";
import { TaskList } from "@/components/TaskList";
import { UserNav } from "@/components/auth/UserNav";
import { SalesAnalytics } from "@/components/analytics/SalesAnalytics";
import { SmartInsights } from "@/components/analytics/SmartInsights";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSalesAnalytics } from "@/hooks/use-sales-analytics";

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
  const isMobile = useIsMobile();
  const { data: salesData } = useSalesAnalytics();
  
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-2 md:p-8">
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl rounded-2xl p-3 md:p-5 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3">
          <CarSleadLogoSVG />
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-4xl'} font-extrabold tracking-tight font-rubik text-gray-900`}>
            CarsLead
          </h1>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <UserNav />
        </div>
      </div>

      <div className={`grid gap-4 md:gap-6 grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
        <Card className="glass-card premium-card shadow-2xl border-0 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-bold font-rubik text-gray-900 text-right w-full">לידים חדשים</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shadow">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold font-rubik text-gray-900 text-right">18</div>
            <p className="text-sm text-blue-600 font-rubik leading-tight text-right">
              +12% מהשבוע שעבר
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card premium-card shadow-2xl border-0 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-bold font-rubik text-gray-900">רכבים במלאי</CardTitle>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shadow">
              <Car className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold font-rubik text-gray-900">24</div>
            <p className="text-sm text-indigo-600 font-rubik leading-tight">
              +2 רכבים מהחודש שעבר
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card premium-card shadow-2xl border-0 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-bold font-rubik text-gray-900">פגישות היום</CardTitle>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shadow">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold font-rubik text-gray-900">3</div>
            <p className="text-sm text-amber-600 font-rubik leading-tight">
              2 פגישות חדשות
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card premium-card shadow-2xl border-0 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-bold font-rubik text-gray-900">משימות לביצוע</CardTitle>
            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center shadow">
              <AlertCircle className="h-5 w-5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold font-rubik text-gray-900">7</div>
            <p className="text-sm text-rose-600 font-rubik leading-tight">
              5 משימות דחופות
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className={`font-rubik bg-white border border-gray-200 p-1 rounded-lg shadow-sm w-full ${isMobile ? 'flex flex-wrap grid-cols-2' : 'flex flex-nowrap'} overflow-x-auto`}>
          <TabsTrigger value="overview" className="font-rubik data-[state=active]:bg-gray-900 data-[state=active]:text-white flex-1">סיכום</TabsTrigger>
          <TabsTrigger value="leads" className="font-rubik data-[state=active]:bg-gray-900 data-[state=active]:text-white flex-1">לידים</TabsTrigger>
          <TabsTrigger value="cars" className="font-rubik data-[state=active]:bg-gray-900 data-[state=active]:text-white flex-1">רכבים</TabsTrigger>
          <TabsTrigger value="tasks" className="font-rubik data-[state=active]:bg-gray-900 data-[state=active]:text-white flex-1">משימות</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-8">
          <div className={`grid gap-6 grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'}`}>
            <div className="min-h-[340px] flex flex-col">
              <SalesAnalytics />
            </div>
            {!isMobile ? (
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 min-h-[340px] flex flex-col">
                <CardHeader>
                  <CardTitle className="font-rubik text-gray-900 text-right">משימות להיום</CardTitle>
                  <CardDescription className="font-rubik text-right">סה"כ 7 משימות מתוכננות</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <TaskList />
                </CardContent>
              </Card>
            ) : null}
          </div>
          
          {/* תובנות חכמות - נוספו כאן */}
          <SmartInsights data={salesData} />
          
          {isMobile ? (
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 min-h-[340px] flex flex-col">
              <CardHeader>
                <CardTitle className="font-rubik text-gray-900 text-right">משימות להיום</CardTitle>
                <CardDescription className="font-rubik text-right">סה"כ 7 משימות מתוכננות</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <TaskList />
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
        <TabsContent value="leads" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="font-rubik text-gray-900 text-right">לידים</CardTitle>
              <CardDescription className="font-rubik text-right">רשימת כל הלידים במערכת</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cars" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="font-rubik text-gray-900 text-right">רכבים במלאי</CardTitle>
              <CardDescription className="font-rubik text-right">רשימת הרכבים הזמינים למכירה</CardDescription>
            </CardHeader>
            <CardContent>
              <CarsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="font-rubik text-gray-900 text-right">משימות</CardTitle>
              <CardDescription className="font-rubik text-right">רשימת המשימות והתזכורות שלך</CardDescription>
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
