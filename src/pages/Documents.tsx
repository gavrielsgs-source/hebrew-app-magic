
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentsManager } from "@/components/documents/DocumentsManager";
import { useEffect, useState } from "react";
import { useLeads } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Feature flag for quotes functionality
const ENABLE_QUOTES_FEATURE = true;

export default function Documents() {
  const isMobile = useIsMobile();
  
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
    <div className={`container py-6 ${isMobile ? 'px-2 pb-24' : ''}`}>
      <div className="flex flex-col space-y-4">
        <div className="text-right">
          <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>ניהול מסמכים</h1>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            ניהול חוזים, מסמכים משפטיים ותיעוד עסקאות
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className={`flex ${isMobile ? 'grid grid-cols-2' : 'justify-end'}`}>
            <TabsTrigger value="all" className={isMobile ? 'text-sm' : ''}>כל המסמכים</TabsTrigger>
            <TabsTrigger value="templates" className={isMobile ? 'text-sm' : ''}>תבניות</TabsTrigger>
            {ENABLE_QUOTES_FEATURE && (
              <TabsTrigger value="quotes" className={isMobile ? 'text-sm' : ''}>הצעות ומכירות</TabsTrigger>
            )}
            {!isMobile && (
              <>
                <TabsTrigger value="leads">לפי לקוחות</TabsTrigger>
                <TabsTrigger value="cars">לפי רכבים</TabsTrigger>
              </>
            )}
          </TabsList>
          
          {isMobile && (
            <TabsList className={`grid ${ENABLE_QUOTES_FEATURE ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {ENABLE_QUOTES_FEATURE && (
                <TabsTrigger value="quotes" className="text-sm">הצעות</TabsTrigger>
              )}
              <TabsTrigger value="leads" className="text-sm">לקוחות</TabsTrigger>
              <TabsTrigger value="cars" className="text-sm">רכבים</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className={`text-right ${isMobile ? 'text-lg' : ''}`}>כל המסמכים</CardTitle>
                <CardDescription className={`text-right ${isMobile ? 'text-sm' : ''}`}>
                  צפייה בכל המסמכים שנשמרו במערכת
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className={`text-right ${isMobile ? 'text-lg' : ''}`}>תבניות מסמכים</CardTitle>
                <CardDescription className={`text-right ${isMobile ? 'text-sm' : ''}`}>
                  מסמכים שנשמרו כתבניות לשליחה אוטומטית
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentsManager filterTemplates={true} />
              </CardContent>
            </Card>
          </TabsContent>

          {ENABLE_QUOTES_FEATURE && (
            <TabsContent value="quotes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className={`text-right ${isMobile ? 'text-lg' : ''}`}>הצעות ומכירות</CardTitle>
                  <CardDescription className={`text-right ${isMobile ? 'text-sm' : ''}`}>
                    יצירת הצעות מחיר, הסכמי מכר ומסמכים עסקיים
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 text-muted-foreground">
                    <div className={`mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>🏷️</div>
                    <h3 className={`font-semibold mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                      הצעות ומכירות
                    </h3>
                    <p className={isMobile ? 'text-sm' : ''}>
                      כאן תוכל ליצור הצעות מחיר, הסכמי מכר והסכמי רכש בקלות
                    </p>
                    <div className={`mt-4 text-primary font-medium ${isMobile ? 'text-sm' : ''}`}>
                      בקרוב - בונה הצעות מחיר חכם!
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className={`text-right ${isMobile ? 'text-lg' : ''}`}>מסמכים לפי לקוחות</CardTitle>
                <CardDescription className={`text-right ${isMobile ? 'text-sm' : ''}`}>
                  מסמכים המקושרים ללקוחות
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={isMobile ? 'w-full' : 'w-full md:w-1/2'}>
                    <Select 
                      value={selectedLeadId || ""} 
                      onValueChange={setSelectedLeadId}
                    >
                       <SelectTrigger className="text-right">
                         <SelectValue placeholder="בחר לקוח" />
                       </SelectTrigger>
                       <SelectContent align="end" className="rtl:text-right">
                        {isLeadsLoading ? (
                          <SelectItem value="loading" disabled>טוען לקוחות...</SelectItem>
                        ) : leads?.length === 0 ? (
                          <SelectItem value="empty" disabled>אין לקוחות</SelectItem>
                        ) : (
                          leads?.map(lead => (
                            <SelectItem key={lead.id as string} value={lead.id as string}>
                              {(lead.name as string)} {lead.phone ? `(${lead.phone as string})` : ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!selectedLeadId ? (
                    <div className={`text-center p-4 text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
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
                <CardTitle className={`text-right ${isMobile ? 'text-lg' : ''}`}>מסמכים לפי רכבים</CardTitle>
                <CardDescription className={`text-right ${isMobile ? 'text-sm' : ''}`}>
                  מסמכים המקושרים לרכבים
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={isMobile ? 'w-full' : 'w-full md:w-1/2'}>
                    <Select 
                      value={selectedCarId || ""} 
                      onValueChange={setSelectedCarId}
                    >
                       <SelectTrigger className="text-right">
                         <SelectValue placeholder="בחר רכב" />
                       </SelectTrigger>
                       <SelectContent align="end" className="rtl:text-right">
                        {isCarsLoading ? (
                          <SelectItem value="loading" disabled>טוען רכבים...</SelectItem>
                        ) : cars?.length === 0 ? (
                          <SelectItem value="empty" disabled>אין רכבים</SelectItem>
                        ) : (
                          cars?.map(car => (
                            <SelectItem key={car.id as string} value={car.id as string}>
                              {(car.make as string)} {(car.model as string)} {(car.year as number)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!selectedCarId ? (
                    <div className={`text-center p-4 text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
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
