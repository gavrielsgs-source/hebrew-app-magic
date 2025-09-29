import { FileText, Plus, Filter, Eye, Send, Upload, X, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateCustomerDocumentDialog } from "./CreateCustomerDocumentDialog";

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
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm">
            <Clock className="h-3 w-3 ml-1" />
            טיוטה
          </Badge>
        );
      case 'sent':
        return (
          <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <Send className="h-3 w-3 ml-1" />
            נשלח
          </Badge>
        );
      case 'signed':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700 shadow-md">
            <CheckCircle className="h-3 w-3 ml-1" />
            חתום
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="shadow-md">
            <XCircle className="h-3 w-3 ml-1" />
            בוטל
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="shadow-sm">
            <AlertCircle className="h-3 w-3 ml-1" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-md hover:shadow-3xl transition-all duration-500">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-sm"></div>
            <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 rounded-2xl">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
              📄 מסמכים דיגיטליים
            </CardTitle>
            <CardDescription className="text-xl text-slate-600">
              ניהול חכם ומתקדם של כל המסמכים והחוזים
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 rounded-2xl p-1 shadow-inner">
            <TabsTrigger value="returns" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 text-lg">
              מסמכים שהוחזרו
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 text-lg">
              מסמכים
            </TabsTrigger>
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
              <CreateCustomerDocumentDialog customerId={customerId} />
            </div>
            
            {documents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">אין מסמכים עדיין</h3>
                <p className="mb-4">צור מסמך ראשון עבור הלקוח</p>
                <CreateCustomerDocumentDialog 
                  customerId={customerId}
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 ml-2" />
                      יצור מסמך ראשון
                    </Button>
                  }
                />
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