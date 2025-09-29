import { useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCustomers } from "@/hooks/customers";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { Link } from "react-router-dom";
import type { Customer } from "@/types/customer";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: customers = [], isLoading, error } = useCustomers();

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">ניהול לקוחות</h1>
            <p className="text-muted-foreground">נהל את כל הלקוחות שלך במקום אחד</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-xl px-6 h-11 font-medium transition-all hover:shadow-lg"
        >
          <Plus className="h-4 w-4 ml-2" />
          הוסף לקוח חדש
        </Button>
      </div>

      {/* Search Section */}
      <Card className="rounded-xl shadow-sm border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חפש לפי שם, טלפון, אימייל או מספר לקוח..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 h-11 rounded-lg border-muted bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {filteredCustomers.length === 0 && searchTerm ? (
        <Card className="rounded-xl shadow-sm border">
          <CardContent className="p-12 text-center">
            <div className="bg-muted/50 p-4 rounded-full w-fit mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">לא נמצאו תוצאות</h3>
            <p className="text-muted-foreground">נסה לשנות את מונחי החיפוש או לנקות את השדה</p>
          </CardContent>
        </Card>
      ) : (
        <CustomersTable customers={filteredCustomers} />
      )}

      <CreateCustomerDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}