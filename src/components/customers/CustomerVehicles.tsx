import { Car, Plus, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomerVehiclesProps {
  customerId: string;
}

export function CustomerVehicles({ customerId }: CustomerVehiclesProps) {
  // TODO: Implement vehicle purchases and sales hooks
  const purchases: any[] = [];
  const sales: any[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          רכבים
        </CardTitle>
        <CardDescription>
          רכבים שנמכרו ללקוח ורכבים שנרכשו מהלקוח
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="purchases">נמכרו ללקוח</TabsTrigger>
            <TabsTrigger value="sales">נרכשו מהלקוח</TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchases" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">רכבים שנמכרו ללקוח ({purchases.length})</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 ml-2" />
                הוסף רכב
              </Button>
            </div>
            
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>לא נמכרו רכבים ללקוח עדיין</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף רכב ראשון
                </Button>
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
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 ml-2" />
                הוסף רכב
              </Button>
            </div>
            
            {sales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>לא נרכשו רכבים מהלקוח עדיין</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף רכב ראשון
                </Button>
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