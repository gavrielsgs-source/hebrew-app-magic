import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Calendar, User, CreditCard } from "lucide-react";
import type { Customer } from "@/types/customer";

interface CustomerBasicInfoProps {
  customer: Customer;
}

export function CustomerBasicInfo({ customer }: CustomerBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg text-slate-800 border-b-2 border-primary/20 pb-2">
          פרטי יצירת קשר
        </h3>
        <div className="space-y-4">
          {customer.phone && (
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
              <Phone className="h-5 w-5 text-primary" />
              <span className="text-lg font-medium">{customer.phone}</span>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
              <Mail className="h-5 w-5 text-primary" />
              <span className="break-all text-lg font-medium">{customer.email}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div>{customer.address}</div>
                {customer.city && customer.country && (
                  <div className="text-sm text-muted-foreground">
                    {customer.city}, {customer.country}
                  </div>
                )}
              </div>
            </div>
          )}
          {customer.fax && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">פקס:</span>
              <span>{customer.fax}</span>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg text-slate-800 border-b-2 border-primary/20 pb-2">
          פרטים אישיים
        </h3>
        <div className="space-y-3">
          {customer.id_number && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>ת.ז: {customer.id_number}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">סוג לקוח:</span>
            <Badge variant="outline">
              {customer.customer_type === 'private' ? 'פרטי' : 'עסקי'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              הצטרף ב-{new Date(customer.join_date || customer.created_at).toLocaleDateString('he-IL')}
            </span>
          </div>
          {customer.source && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">מקור:</span>
              <Badge variant="secondary">{customer.source}</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg text-slate-800 border-b-2 border-primary/20 pb-2">
          מידע כספי
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                ₪{customer.credit_amount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">יתרת קרדיט</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}