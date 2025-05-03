
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentsManager } from "@/components/documents/DocumentsManager";
import { useEffect } from "react";

export default function Documents() {
  // הגדרת כיוון ה-RTL לתמיכה בעברית
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "he";
  }, []);
  
  return (
    <div className="container py-6 text-right">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-right">ניהול מסמכים</h1>
          <p className="text-muted-foreground text-right">ניהול חוזים, מסמכים משפטיים ותיעוד עסקאות</p>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="flex justify-start">
            <TabsTrigger value="all">כל המסמכים</TabsTrigger>
            <TabsTrigger value="leads">לפי לקוחות</TabsTrigger>
            <TabsTrigger value="cars">לפי רכבים</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader className="text-right">
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
              <CardHeader className="text-right">
                <CardTitle className="text-right">מסמכים לפי לקוחות</CardTitle>
                <CardDescription className="text-right">מסמכים המקושרים ללקוחות</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 text-muted-foreground">
                  בחר לקוח מרשימת הלקוחות כדי לצפות במסמכים המקושרים אליו
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cars" className="space-y-4">
            <Card>
              <CardHeader className="text-right">
                <CardTitle className="text-right">מסמכים לפי רכבים</CardTitle>
                <CardDescription className="text-right">מסמכים המקושרים לרכבים</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 text-muted-foreground">
                  בחר רכב מרשימת הרכבים כדי לצפות במסמכים המקושרים אליו
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
