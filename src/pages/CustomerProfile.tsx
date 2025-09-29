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
    <div className="container mx-auto p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/customers">
          <Button variant="ghost" size="sm">
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור לרשימת הלקוחות
          </Button>
        </Link>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <User className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{customer.full_name}</h1>
          <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
            {customer.status === 'active' ? 'פעיל' : 'לא פעיל'}
          </Badge>
        </div>
      </div>

      {/* Customer Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                פרטי לקוח
              </CardTitle>
              <CardDescription>
                לקוח #{customer.customer_number} • הצטרף ב-{new Date(customer.join_date || customer.created_at).toLocaleDateString('he-IL')}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 ml-2" />
              ערוך פרטים
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CustomerBasicInfo customer={customer} />
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Customer Notes */}
          <CustomerNotes customerId={customer.id} />

          {/* Customer Credit */}
          <CustomerCredit customer={customer} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Vehicle Sales & Purchases */}
          <CustomerVehicles customerId={customer.id} />
        </div>
      </div>

      {/* Documents Section - Full Width */}
      <div className="mt-6">
        <CustomerDocuments customerId={customer.id} />
      </div>
    </div>
  );
}