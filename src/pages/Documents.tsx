
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentsManager } from "@/components/documents/DocumentsManager";
import { useEffect, useState } from "react";
import { useLeads } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Documents() {
  // הגדרת כיוון ה-RTL לתמיכה בעברית
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "he";
  }, []);
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const { leads, isLoading: isLeadsLoading } = useLeads();
  const { cars, isLoading: isCarsLoading } = useCars();
  
  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-4">
        <div className="text-right">
          <h1 className="text-3xl font-bold">ניהול מסמכים</h1>
          <p className="text-muted-foreground">ניהול חוזים, מסמכים משפטיים ותיעוד עסקאות</p>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="flex justify-start">
            <TabsTrigger value="all">כל המסמכים</TabsTrigger>
            <TabsTrigger value="leads">לפי לקוחות</TabsTrigger>
            <TabsTrigger value="cars">לפי רכבים</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">כל המסמכים</CardTitle>
                <CardDescription className="text-right">צפייה בכל המסמכים שנשמרו במערכת</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentsManager />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">מסמכים לפי לקוחות</CardTitle>
                <CardDescription className="text-right">מסמכים המקושרים ללקוחות</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="w-full md:w-1/2">
                    <Select 
                      value={selectedLeadId || ""} 
                      onValueChange={setSelectedLeadId}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="בחר לקוח" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {isLeadsLoading ? (
                          <SelectItem value="loading" disabled>טוען לקוחות...</SelectItem>
                        ) : leads?.length === 0 ? (
                          <SelectItem value="empty" disabled>אין לקוחות</SelectItem>
                        ) : (
                          leads?.map(lead => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.name} {lead.phone ? `(${lead.phone})` : ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!selectedLeadId ? (
                    <div className="text-center p-4 text-muted-foreground">
                      בחר לקוח מהרשימה כדי לצפות במסמכים המקושרים אליו
                    </div>
                  ) : (
                    <DocumentsManager entityId={selectedLeadId} entityType="lead" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cars" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">מסמכים לפי רכבים</CardTitle>
                <CardDescription className="text-right">מסמכים המקושרים לרכבים</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="w-full md:w-1/2">
                    <Select 
                      value={selectedCarId || ""} 
                      onValueChange={setSelectedCarId}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="בחר רכב" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {isCarsLoading ? (
                          <SelectItem value="loading" disabled>טוען רכבים...</SelectItem>
                        ) : cars?.length === 0 ? (
                          <SelectItem value="empty" disabled>אין רכבים</SelectItem>
                        ) : (
                          cars?.map(car => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.make} {car.model} {car.year}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!selectedCarId ? (
                    <div className="text-center p-4 text-muted-foreground">
                      בחר רכב מהרשימה כדי לצפות במסמכים המקושרים אליו
                    </div>
                  ) : (
                    <DocumentsManager entityId={selectedCarId} entityType="car" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
