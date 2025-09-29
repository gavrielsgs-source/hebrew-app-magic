import { FileText, Plus, Filter, Eye, Send, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerDocumentsProps {
  customerId: string;
}

export function CustomerDocuments({ customerId }: CustomerDocumentsProps) {
  // TODO: Implement customer documents hooks
  const documents: any[] = [];
  const documentReturns: any[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">טיוטה</Badge>;
      case 'sent':
        return <Badge variant="default">נשלח</Badge>;
      case 'signed':
        return <Badge variant="default" className="bg-green-600">חתום</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">בוטל</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          מסמכים דיגיטליים
        </CardTitle>
        <CardDescription>
          ניהול מסמכים דיגיטליים של הלקוח
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">מסמכים</TabsTrigger>
            <TabsTrigger value="returns">מסמכים שהוחזרו</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="סוג מסמך" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסוגים</SelectItem>
                    <SelectItem value="invoice">חשבונית</SelectItem>
                    <SelectItem value="contract">הסכם</SelectItem>
                    <SelectItem value="receipt">קבלה</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 ml-2" />
                  סינון
                </Button>
              </div>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                יצור מסמך חדש
              </Button>
            </div>
            
            {documents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">אין מסמכים עדיין</h3>
                <p className="mb-4">צור מסמך ראשון עבור הלקוח</p>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  יצור מסמך ראשון
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          מס' {doc.document_number} • {doc.type}
                        </p>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                      <div>
                        <span className="font-medium">סכום: </span>
                        ₪{doc.amount?.toLocaleString() || 'לא צוין'}
                      </div>
                      <div>
                        <span className="font-medium">תאריך: </span>
                        {new Date(doc.date).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 ml-2" />
                          תצוגה מקדימה
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 ml-2" />
                          שלח חזרה
                        </Button>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 ml-2" />
                          העלה חתום
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-destructive">
                          <X className="h-4 w-4 ml-2" />
                          בטל
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="returns" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">מסמכים שהלקוח שלח חזרה ({documentReturns.length})</h3>
            </div>
            
            {documentReturns.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">אין מסמכים שהוחזרו</h3>
                <p>מסמכים שהלקוח יעלה יופיעו כאן</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documentReturns.map((docReturn) => (
                  <div key={docReturn.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">מסמך שהוחזר</h4>
                      <Badge variant="default" className="bg-green-600">הועלה</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      הועלה ב-{new Date(docReturn.uploaded_at).toLocaleDateString('he-IL')}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 ml-2" />
                        צפה במסמך
                      </Button>
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