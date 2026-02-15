import { useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCustomers, useDeleteCustomer } from "@/hooks/customers";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { Link } from "react-router-dom";
import type { Customer } from "@/types/customer";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: customers = [], isLoading, error } = useCustomers();
  const deleteCustomer = useDeleteCustomer();

  const filteredCustomers = customers.filter((customer: Customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.customer_number.toString().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6" dir="rtl">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-xl w-10 h-10"></div>
              <div>
                <div className="h-8 bg-muted rounded w-40 mb-2"></div>
                <div className="h-4 bg-muted rounded w-60"></div>
              </div>
            </div>
            <div className="h-11 bg-muted rounded-xl w-40"></div>
          </div>
          
          {/* Search Skeleton */}
          <Card className="rounded-xl shadow-sm border mb-6">
            <CardContent className="p-4">
              <div className="h-11 bg-muted rounded-lg"></div>
            </CardContent>
          </Card>
          
          {/* Table Skeleton */}
          <Card className="rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
              
              {/* Table Rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-7 gap-4">
                  {[...Array(7)].map((_, j) => (
                    <div key={j} className="h-6 bg-muted/50 rounded"></div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">שגיאה בטעינת הלקוחות</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/5 via-background to-primary/5 rounded-2xl p-6 border border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-2xl shadow-md border border-primary/20">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary">
                ניהול לקוחות מתקדם
              </h1>
              <p className="text-muted-foreground text-lg font-medium">
                מערכת ניהול מקצועית לכל הלקוחות שלך • בקרה מלאה ונתונים בזמן אמת
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>מערכת פעילה</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>נתונים מסונכרנים</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-xl px-8 h-12 font-bold text-base transition-all duration-300 hover:shadow-xl hover:scale-105 border-0"
            >
              <Plus className="h-5 w-5 ml-2" />
              הוסף לקוח חדש
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-r from-background via-muted/10 to-background">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">חיפוש מתקדם</h3>
            </div>
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="הקלד שם לקוח, מספר טלפון, כתובת אימייל או מספר לקוח..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 h-12 rounded-xl border-2 border-muted bg-background hover:border-primary/30 focus:border-primary transition-all duration-300 text-base shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {filteredCustomers.length === 0 && searchTerm ? (
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-background via-muted/10 to-background">
          <CardContent className="p-16 text-center">
            <div className="space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-100 to-red-50 rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="h-12 w-12 text-orange-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">לא נמצאו תוצאות התואמות</h3>
                <p className="text-muted-foreground text-lg mb-4">
                  חיפשנו עבור: <strong className="text-primary">"{searchTerm}"</strong>
                </p>
                <div className="bg-muted/30 rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground">
                    טיפים לחיפוש טוב יותר:
                    <br />• נסה מילים קצרות יותר
                    <br />• בדוק איות
                    <br />• השתמש במספר לקוח במקום שם
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="mt-4 rounded-xl border-primary/20 hover:bg-primary/5"
                >
                  נקה חיפוש
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CustomersTable 
          customers={filteredCustomers}
          onDeleteCustomer={(customerId) => deleteCustomer.mutate(customerId)}
        />
      )}

      <CreateCustomerDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}