import { useParams } from "react-router-dom";
import { ArrowRight, User, Edit, CreditCard, MessageSquare, Car, FileText, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCustomer } from "@/hooks/customers";
import { CustomerBasicInfo } from "@/components/customers/CustomerBasicInfo";
import { CustomerNotes } from "@/components/customers/CustomerNotes";
import { CustomerCredit } from "@/components/customers/CustomerCredit";
import { CustomerPaymentsHistory } from "@/components/customers/CustomerPaymentsHistory";
import { CustomerVehicles } from "@/components/customers/CustomerVehicles";
import { CustomerDocuments } from "@/components/customers/CustomerDocuments";
import { EditCustomerDialog } from "@/components/customers/EditCustomerDialog";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/30" dir="rtl">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header with Premium Styling */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <Link to="/customers">
              <Button variant="ghost" size="lg" className="rounded-2xl bg-white/70 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                <ArrowRight className="h-5 w-5 ml-2" />
                <span className="text-lg font-medium">חזור לרשימת הלקוחות</span>
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-10 bg-gradient-to-b from-slate-300 to-slate-400" />
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-sm"></div>
                <div className="relative bg-gradient-to-br from-primary/15 to-secondary/15 p-4 rounded-3xl shadow-lg">
                  <User className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {customer.full_name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge 
                    variant={customer.status === 'active' ? 'default' : 'secondary'}
                    className="text-base px-5 py-2 rounded-full shadow-md"
                  >
                    {customer.status === 'active' ? 'פעיל' : 'לא פעיל'}
                  </Badge>
                  <span className="text-slate-600 text-xl font-medium">לקוח #{customer.customer_number}</span>
                </div>
              </div>
            </div>
            <div className="mr-auto">
              <EditCustomerDialog customer={customer} />
            </div>
          </div>
        </div>

        {/* Enhanced Customer Overview Card */}
        <Card className="mb-10 shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md hover:shadow-3xl transition-all duration-500">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl blur-sm"></div>
                <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-2xl">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
                  מידע בסיסי על הלקוח
                </CardTitle>
                <CardDescription className="text-xl text-slate-600 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  הצטרף ב-{new Date(customer.join_date || customer.created_at).toLocaleDateString('he-IL')} • לקוח מאז {Math.ceil((Date.now() - new Date(customer.join_date || customer.created_at).getTime()) / (1000 * 60 * 60 * 24))} ימים
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CustomerBasicInfo customer={customer} />
          </CardContent>
        </Card>

        {/* Premium Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-10">
          {/* Enhanced Left Column - Wider */}
          <div className="xl:col-span-5 space-y-8">
            {/* Customer Notes with Enhanced Icon */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <CustomerNotes customerId={customer.id} />
              </div>
            </div>

            {/* Customer Credit with Enhanced Styling */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <CustomerCredit customerId={customer.id} />
              </div>
            </div>
          </div>

          {/* Enhanced Right Column */}
          <div className="xl:col-span-7">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <CustomerVehicles customerId={customer.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="mb-10 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <CustomerPaymentsHistory customerId={customer.id} />
          </div>
        </div>

        {/* Enhanced Documents Section - Full Width Premium */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-gray-100/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <CustomerDocuments customerId={customer.id} />
          </div>
        </div>
      </div>
    </div>
  );
}