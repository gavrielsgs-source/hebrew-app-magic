import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Calendar, UserCheck, CreditCard, Building, DollarSign, TrendingUp, Target } from "lucide-react";
import type { Customer } from "@/types/customer";

interface CustomerBasicInfoProps {
  customer: Customer;
}

export function CustomerBasicInfo({ customer }: CustomerBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Contact Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl">
            <Phone className="h-4 w-4 text-blue-600" />
          </div>
          פרטי התקשרות
        </h3>
        
        {customer.phone && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Phone className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{customer.phone}</p>
              <p className="text-xs text-slate-600">טלפון</p>
            </div>
          </div>
        )}
        
        {customer.email && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Mail className="h-3.5 w-3.5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 break-all">{customer.email}</p>
              <p className="text-xs text-slate-600">אימייל</p>
            </div>
          </div>
        )}
        
        {customer.address && (
          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <MapPin className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{customer.address}</p>
              {customer.city && customer.country && (
                <p className="text-xs text-slate-600">{customer.city}, {customer.country}</p>
              )}
              <p className="text-xs text-slate-600">כתובת</p>
            </div>
          </div>
        )}

        {customer.fax && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <Phone className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{customer.fax}</p>
              <p className="text-xs text-slate-600">פקס</p>
            </div>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl">
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          פרטים אישיים
        </h3>
        
        {customer.id_number && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{customer.id_number}</p>
              <p className="text-xs text-slate-600">מספר זהות</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="p-1.5 bg-orange-100 rounded-lg">
            <Building className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <div>
            <Badge variant={customer.customer_type === 'private' ? 'default' : 'secondary'} className="text-xs px-2 py-0.5 rounded-full">
              {customer.customer_type === 'private' ? 'לקוח פרטי' : 'לקוח עסקי'}
            </Badge>
            <p className="text-xs text-slate-600 mt-0.5">סוג לקוח</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              {new Date(customer.join_date || customer.created_at).toLocaleDateString('he-IL')}
            </p>
            <p className="text-xs text-slate-600">תאריך הצטרפות</p>
          </div>
        </div>

        {customer.source && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <Target className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{customer.source}</p>
              <p className="text-xs text-slate-600">מקור הליד</p>
            </div>
          </div>
        )}
      </div>

      {/* Financial Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl">
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </div>
          מידע פיננסי
        </h3>
        
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="p-1.5 bg-yellow-100 rounded-lg">
            <TrendingUp className="h-3.5 w-3.5 text-yellow-600" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">₪{customer.credit_amount.toLocaleString()}</p>
            <p className="text-xs text-slate-600">יתרת קרדיט</p>
          </div>
        </div>
      </div>
    </div>
  );
}
