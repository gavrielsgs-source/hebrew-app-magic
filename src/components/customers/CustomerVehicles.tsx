import { Car, Plus, Calendar, DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddVehicleDialog } from "./AddVehicleDialog";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { useCustomerVehiclePurchases, useCustomerVehicleSales } from "@/hooks/customers";

interface CustomerVehiclesProps {
  customerId: string;
}

export function CustomerVehicles({ customerId }: CustomerVehiclesProps) {
  const { data: purchases = [], isLoading: purchasesLoading } = useCustomerVehiclePurchases(customerId);
  const { data: sales = [], isLoading: salesLoading } = useCustomerVehicleSales(customerId);

  return (
    <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-white/95 to-orange-50/95 backdrop-blur-md hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl blur-sm"></div>
            <div className="relative bg-gradient-to-br from-orange-500/10 to-red-500/10 p-3 rounded-xl">
              <Car className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              רכבים ועסקאות
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              מעקב אחר כל רכישות ומכירות הרכבים
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 rounded-xl p-1 shadow-inner">
            <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 flex items-center gap-1.5 text-sm">
              <TrendingDown className="h-3.5 w-3.5" />
              נרכשו מהלקוח
            </TabsTrigger>
            <TabsTrigger value="purchases" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 flex items-center gap-1.5 text-sm">
              <TrendingUp className="h-3.5 w-3.5" />
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
            ) : purchasesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => {
                  const purchasePrice = purchase.purchase_price || 0;
                  const amountPaid = purchase.amount_paid || 0;
                  const remaining = purchasePrice - amountPaid;
                  const paymentPercentage = purchasePrice > 0 ? Math.min(100, (amountPaid / purchasePrice) * 100) : 0;
                  const isFullyPaid = remaining <= 0;

                  return (
                    <div key={purchase.id} className="border rounded-lg p-3 bg-gradient-to-r from-white to-slate-50/50 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">
                          {purchase.car?.make} {purchase.car?.model} {purchase.car?.year}
                        </h4>
                        <Badge variant={isFullyPaid ? "default" : "secondary"} className={isFullyPaid ? "bg-green-600 shadow-sm" : "bg-amber-500 shadow-sm"}>
                          {isFullyPaid ? 'שולם במלואו' : 'בתשלום'}
                        </Badge>
                      </div>
                      {purchase.car?.license_number && (
                        <p className="text-xs text-slate-600 mb-2">
                          מספר רישוי: {purchase.car.license_number}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>מחיר: ₪{purchasePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(purchase.purchase_date || purchase.created_at).toLocaleDateString('he-IL')}</span>
                        </div>
                      </div>
                      
                      {/* Payment Progress */}
                      {purchasePrice > 0 && (
                        <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Wallet className="h-3.5 w-3.5 text-slate-500" />
                              <span className="text-slate-600">שולם: ₪{amountPaid.toLocaleString()}</span>
                            </div>
                            <span className={`font-medium ${isFullyPaid ? 'text-green-600' : 'text-amber-600'}`}>
                              {Math.round(paymentPercentage)}%
                            </span>
                          </div>
                          <Progress value={paymentPercentage} className="h-1.5 mb-1.5" />
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${isFullyPaid ? 'text-green-600' : 'text-amber-600'}`}>
                              {isFullyPaid ? '✓ שולם במלואו' : `נותר: ₪${remaining.toLocaleString()}`}
                            </span>
                            {!isFullyPaid && (
                              <AddPaymentDialog 
                                customerId={customerId}
                                preselectedPurchaseId={purchase.id}
                                trigger={
                                  <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                                    <Plus className="h-3 w-3 ml-1" />
                                    הוסף תשלום
                                  </Button>
                                }
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
            ) : salesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div key={sale.id} className="border rounded-lg p-3 bg-gradient-to-r from-white to-slate-50/50 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">
                        {sale.car?.make} {sale.car?.model} {sale.car?.year}
                      </h4>
                      <Badge variant="secondary" className="shadow-sm text-xs">נרכש</Badge>
                    </div>
                    {sale.car?.license_number && (
                      <p className="text-xs text-slate-600 mb-2">
                        מספר רישוי: {sale.car.license_number}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>₪{sale.sale_price?.toLocaleString() || 'לא צוין'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(sale.sale_date || sale.created_at).toLocaleDateString('he-IL')}</span>
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