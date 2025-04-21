
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Car, Calendar, AlertCircle } from "lucide-react";
import { LeadsTable } from "@/components/LeadsTable";
import { CarsTable } from "@/components/CarsTable";
import { TaskList } from "@/components/TaskList";
import { UserNav } from "@/components/auth/UserNav";
import { SalesAnalytics } from "@/components/analytics/SalesAnalytics";

// יצירת גלוף של תמונת הלוגו בתוך Base64 במידה והלוגו מהנתיב לא ייטען
const fallbackLogoBase64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9IiM2MDUxQTAiLz4KPHBhdGggZD0iTTIwIDQwQzIwIDI4Ljk1NDMgMjguOTU0MyAyMCA0MCAyMEM1MS4wNDU3IDIwIDYwIDI4Ljk1NDMgNjAgNDBDNjAgNTEuMDQ1NyA1MS4wNDU3IDYwIDQwIDYwQzI4Ljk1NDMgNjAgMjAgNTEuMDQ1NyAyMCA0MFoiIGZpbGw9IiMzM0MzRjAiLz4KPHBhdGggZD0iTTI1IDQwSDU1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMzUgMzBMNDAgMzVMNDUgMzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0zNSA1MEw0MCA0NUw0NSA1MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==`;

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo-carslead.svg"
            alt="CarsLead Logo"
            className="w-12 h-12 object-contain"
            onError={(e) => {
              // אם הלוגו לא נטען, נשתמש בגלוף שיצרנו
              const img = e.target as HTMLImageElement;
              img.src = fallbackLogoBase64;
            }}
          />
          <h1 className="text-3xl font-extrabold tracking-tight font-rubik gradient-text">
            CarsLead
          </h1>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <UserNav />
        </div>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="carslead-card border-carslead-purple/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">לידים חדשים</CardTitle>
            <UserPlus className="h-4 w-4 text-carslead-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">18</div>
            <p className="text-xs text-carslead-purple">
              +12% מהשבוע שעבר
            </p>
          </CardContent>
        </Card>
        <Card className="carslead-card border-carslead-blue/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">רכבים במלאי</CardTitle>
            <Car className="h-4 w-4 text-carslead-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">24</div>
            <p className="text-xs text-carslead-blue">
              +2 רכבים מהחודש שעבר
            </p>
          </CardContent>
        </Card>
        <Card className="carslead-card border-carslead-purple/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">פגישות היום</CardTitle>
            <Calendar className="h-4 w-4 text-carslead-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">3</div>
            <p className="text-xs text-carslead-purple">
              2 פגישות חדשות
            </p>
          </CardContent>
        </Card>
        <Card className="carslead-card border-carslead-blue/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-rubik">משימות לביצוע</CardTitle>
            <AlertCircle className="h-4 w-4 text-carslead-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-rubik">7</div>
            <p className="text-xs text-carslead-blue">
              5 משימות דחופות
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="font-rubik bg-white border border-gray-200 p-1">
          <TabsTrigger value="overview" className="font-rubik data-[state=active]:bg-carslead-purple data-[state=active]:text-white">סיכום</TabsTrigger>
          <TabsTrigger value="leads" className="font-rubik data-[state=active]:bg-carslead-purple data-[state=active]:text-white">לידים</TabsTrigger>
          <TabsTrigger value="cars" className="font-rubik data-[state=active]:bg-carslead-purple data-[state=active]:text-white">רכבים</TabsTrigger>
          <TabsTrigger value="tasks" className="font-rubik data-[state=active]:bg-carslead-purple data-[state=active]:text-white">משימות</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <SalesAnalytics />
            <Card className="col-span-3 carslead-card">
              <CardHeader>
                <CardTitle className="font-rubik text-carslead-purple">משימות להיום</CardTitle>
                <CardDescription className="font-rubik">סה"כ 7 משימות מתוכננות</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="leads" className="space-y-4">
          <Card className="carslead-card">
            <CardHeader>
              <CardTitle className="font-rubik text-carslead-purple">לידים</CardTitle>
              <CardDescription className="font-rubik">רשימת כל הלידים במערכת</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cars" className="space-y-4">
          <Card className="carslead-card">
            <CardHeader>
              <CardTitle className="font-rubik text-carslead-purple">רכבים במלאי</CardTitle>
              <CardDescription className="font-rubik">רשימת הרכבים הזמינים למכירה</CardDescription>
            </CardHeader>
            <CardContent>
              <CarsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <Card className="carslead-card">
            <CardHeader>
              <CardTitle className="font-rubik text-carslead-purple">משימות</CardTitle>
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
