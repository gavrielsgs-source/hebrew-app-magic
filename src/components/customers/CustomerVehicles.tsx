import { Car, Plus, Calendar, DollarSign, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddVehicleDialog } from "./AddVehicleDialog";

interface CustomerVehiclesProps {
  customerId: string;
}

export function CustomerVehicles({ customerId }: CustomerVehiclesProps) {
  // TODO: Implement vehicle purchases and sales hooks
  const purchases: any[] = [];
  const sales: any[] = [];

  return (
    <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/95 to-orange-50/95 backdrop-blur-md hover:shadow-3xl transition-all duration-500">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-sm"></div>
            <div className="relative bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4 rounded-2xl">
              <Car className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
              🚗 רכבים ועסקאות
            </CardTitle>
            <CardDescription className="text-xl text-slate-600">
              מעקב אחר כל רכישות ומכירות הרכבים
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 rounded-2xl p-1 shadow-inner">
            <TabsTrigger value="sales" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 flex items-center gap-2 text-lg">
              <TrendingDown className="h-4 w-4" />
              נרכשו מהלקוח
            </TabsTrigger>
            <TabsTrigger value="purchases" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 flex items-center gap-2 text-lg">
              <TrendingUp className="h-4 w-4" />
              נמכרו ללקוח
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchases" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">רכבים שנמכרו ללקוח ({purchases.length})</h3>
              <AddVehicleDialog 
                customerId={customerId} 
                type="purchase"
              />
            </div>
            
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>לא נמכרו רכבים ללקוח עדיין</p>
                <AddVehicleDialog 
                  customerId={customerId} 
                  type="purchase"
                  trigger={
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 ml-2" />
                      הוסף רכב ראשון
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {purchase.car?.make} {purchase.car?.model} {purchase.car?.year}
                      </h4>
                      <Badge variant="outline">נמכר</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ₪{purchase.purchase_price?.toLocaleString() || 'לא צוין'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(purchase.purchase_date).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sales" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">רכבים שנרכשו מהלקוח ({sales.length})</h3>
              <AddVehicleDialog 
                customerId={customerId} 
                type="sale"
              />
            </div>
            
            {sales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>לא נרכשו רכבים מהלקוח עדיין</p>
                <AddVehicleDialog 
                  customerId={customerId} 
                  type="sale"
                  trigger={
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 ml-2" />
                      הוסף רכב ראשון
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div key={sale.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {sale.car?.make} {sale.car?.model} {sale.car?.year}
                      </h4>
                      <Badge variant="secondary">נרכש</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ₪{sale.sale_price?.toLocaleString() || 'לא צוין'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(sale.sale_date).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}