import { useParams } from "react-router-dom";
import { ArrowRight, User, Edit, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCustomer } from "@/hooks/customers";
import { CustomerBasicInfo } from "@/components/customers/CustomerBasicInfo";
import { CustomerNotes } from "@/components/customers/CustomerNotes";
import { CustomerCredit } from "@/components/customers/CustomerCredit";
import { CustomerVehicles } from "@/components/customers/CustomerVehicles";
import { CustomerDocuments } from "@/components/customers/CustomerDocuments";
import { Link } from "react-router-dom";

export default function CustomerProfile() {
  const { customerId } = useParams<{ customerId: string }>();
  const { data: customer, isLoading, error } = useCustomer(customerId!);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">שגיאה בטעינת פרטי הלקוח או שהלקוח לא נמצא</p>
            <Link to="/customers">
              <Button variant="outline" className="mt-4">
                <ArrowRight className="h-4 w-4 ml-2" />
                חזור לרשימת הלקוחות
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <Link to="/customers">
            <Button variant="ghost" size="lg" className="rounded-2xl bg-white/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200">
              <ArrowRight className="h-5 w-5 ml-2" />
              <span className="text-lg font-medium">חזור לרשימת הלקוחות</span>
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{customer.full_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={customer.status === 'active' ? 'default' : 'secondary'}
                  className="text-base px-4 py-1 rounded-full"
                >
                  {customer.status === 'active' ? 'פעיל' : 'לא פעיל'}
                </Badge>
                <span className="text-slate-600 text-lg">לקוח #{customer.customer_number}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Overview */}
        <Card className="mb-8 shadow-lg rounded-3xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-2xl">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    פרטי לקוח
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-600 mt-1">
                    הצטרף ב-{new Date(customer.join_date || customer.created_at).toLocaleDateString('he-IL')}
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="lg" className="rounded-2xl border-2 hover:shadow-md transition-all">
                <Edit className="h-5 w-5 ml-2" />
                <span className="text-lg font-medium">ערוך פרטים</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <CustomerBasicInfo customer={customer} />
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Customer Notes */}
            <CustomerNotes customerId={customer.id} />

            {/* Customer Credit */}
            <CustomerCredit customer={customer} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Vehicle Sales & Purchases */}
            <CustomerVehicles customerId={customer.id} />
          </div>
        </div>

        {/* Documents Section - Full Width */}
        <div className="mt-8">
          <CustomerDocuments customerId={customer.id} />
        </div>
      </div>
    </div>
  );
}