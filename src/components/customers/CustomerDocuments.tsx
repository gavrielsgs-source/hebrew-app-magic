import { FileText, Plus, Filter, Eye, Send, Upload, X, Clock, CheckCircle, AlertCircle, XCircle, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateCustomerDocumentDialog } from "./CreateCustomerDocumentDialog";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { DocumentPreviewDialog } from "./DocumentPreviewDialog";
import { useCustomerDocuments, useCustomerDocumentReturns, useUpdateCustomerDocumentStatus, useCustomerRelatedDocuments } from "@/hooks/customers";
import { useCustomer } from "@/hooks/customers/use-customer";
import type { Document as AppDocument } from "@/hooks/documents/types";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import html2pdf from 'html2pdf.js';
interface CustomerDocumentsProps {
  customerId: string;
}

export function CustomerDocuments({ customerId }: CustomerDocumentsProps) {
  const { data: documents = [], isLoading: documentsLoading } = useCustomerDocuments(customerId);
  const { data: documentReturns = [], isLoading: returnsLoading } = useCustomerDocumentReturns(customerId);
  const { data: attachedDocs = [], isLoading: attachedLoading } = useCustomerRelatedDocuments(customerId);
  const { data: customer } = useCustomer(customerId);
  const updateDocumentStatus = useUpdateCustomerDocumentStatus();
  const isMobile = useIsMobile();
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

  const handleStatusUpdate = (documentId: string, status: 'draft' | 'sent' | 'signed' | 'cancelled') => {
    updateDocumentStatus.mutate({ documentId, customerId, status });
  };

  const handleSendToWhatsApp = (doc: any) => {
    if (!customer?.phone) {
      toast.error('לא נמצא מספר טלפון ללקוח');
      return;
    }

    const message = `שלום ${customer.full_name},\nמצורף המסמך "${doc.title}" (מס' ${doc.document_number}).\nסכום: ${doc.amount ? `₪${doc.amount.toLocaleString()}` : 'לא צוין'}`;
    const phoneNumber = customer.phone.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Update status to sent
    handleStatusUpdate(doc.id, 'sent');
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadPDF = async (doc: any) => {
    try {
      toast.loading('מכין את המסמך להורדה...');

      // For attached documents that already have a URL, download directly
      if (doc.status === 'attached' && doc.url) {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = `${doc.title}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.dismiss();
        toast.success('המסמך הורד בהצלחה');
        return;
      }

      // Check if PDF already exists in storage for customer documents
      if (doc.file_path && doc.status !== 'attached') {
        const { data, error } = await supabase.storage
          .from('customer-documents')
          .download(doc.file_path);

        if (!error && data) {
          const url = URL.createObjectURL(data);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${doc.title}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.dismiss();
          toast.success('המסמך הורד בהצלחה');
          return;
        }
      }

      // Generate PDF from HTML content for customer documents
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; direction: rtl;">
          <h1 style="text-align: center; margin-bottom: 30px;">${doc.title}</h1>
          <div style="margin-bottom: 20px;">
            <strong>מספר מסמך:</strong> ${doc.document_number}
          </div>
          <div style="margin-bottom: 20px;">
            <strong>סוג:</strong> ${doc.type}
          </div>
          <div style="margin-bottom: 20px;">
            <strong>סכום:</strong> ${doc.amount ? `₪${doc.amount.toLocaleString()}` : 'לא צוין'}
          </div>
          <div style="margin-bottom: 20px;">
            <strong>תאריך:</strong> ${new Date(doc.date || doc.created_at).toLocaleDateString('he-IL')}
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `${doc.title}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
      
      // Upload to Supabase storage
      const fileName = `${doc.id}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('customer-documents')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Update document record with file path
      await supabase
        .from('customer_documents')
        .update({ file_path: fileName })
        .eq('id', doc.id);

      // Download the file
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('המסמך הורד בהצלחה');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.dismiss();
      toast.error('שגיאה בהורדת המסמך');
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
            <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
              מסמכים דיגיטליים
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
            </div>
            
            {documentsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 && attachedDocs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">אין מסמכים עדיין</h3>
                <p className="mb-4">מסמכים שנוצרים למען הלקוח יופיעו כאן</p>
              </div>
            ) : (
              <div className="space-y-4" dir="rtl">
                {/* Combined documents from both sources */}
                {[...documents, ...attachedDocs.map(doc => ({
                  id: doc.id,
                  title: doc.name,
                  document_number: doc.entity_type === 'tax_invoice' 
                    ? doc.name.replace('חשבונית מס ', '') 
                    : `DOC-${doc.id.slice(0, 8)}`,
                  type: doc.type === 'tax_invoice' ? 'חשבונית מס' : doc.type,
                  amount: doc.amount || 0,
                  date: doc.created_at,
                  created_at: doc.created_at,
                  status: 'attached' as const,
                  url: doc.url,
                  entity_type: doc.entity_type
                }))].map((doc) => (
                  <div key={doc.id} className="border-2 border-slate-200 rounded-2xl p-6 bg-gradient-to-bl from-white via-slate-50/30 to-blue-50/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-right flex-1">
                        <h4 className="font-bold text-xl text-slate-800 mb-2">{doc.title}</h4>
                        <div className="space-y-1">
                          <p className="text-lg text-slate-600 flex items-center gap-2">
                            <span className="font-semibold">מספר מסמך:</span>
                            <span className="font-mono bg-slate-100 px-2 py-1 rounded">{doc.document_number}</span>
                          </p>
                          <p className="text-lg text-slate-600">
                            <span className="font-semibold">סוג:</span> {doc.type}
                          </p>
                        </div>
                      </div>
                      <div className="mr-4">
                        {doc.status === 'attached' ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 shadow-sm text-base px-3 py-1">
                            <FileText className="h-4 w-4 ml-1" />
                            מצורף
                          </Badge>
                        ) : (
                          getStatusBadge(doc.status)
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg text-slate-700 mb-6 bg-white/50 p-4 rounded-xl border border-slate-100">
                      <div className="text-right">
                        <span className="font-bold text-slate-800">סכום: </span>
                        <span className="font-semibold text-green-700">
                          {doc.amount ? `₪${doc.amount.toLocaleString()}` : 'לא צוין'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800">תאריך: </span>
                        <span className="font-semibold">
                          {new Date(doc.date || doc.created_at).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`pt-4 border-t-2 border-slate-100 ${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
                      {doc.status !== 'attached' ? (
                        <>
                          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 flex-wrap`}>
                            <DocumentPreviewDialog
                              documentId={doc.id}
                              documentTitle={doc.title}
                              documentType={doc.type}
                              trigger={
                                <Button variant="outline" size={isMobile ? "default" : "lg"} className={`rounded-xl ${isMobile ? 'w-full justify-start' : 'text-base px-6'} hover:bg-blue-50 hover:border-blue-300`}>
                                  <Eye className="h-5 w-5 ml-2" />
                                  תצוגה מקדימה
                                </Button>
                              }
                            />
                            <Button 
                              variant="outline" 
                              size={isMobile ? "default" : "lg"}
                              className={`rounded-xl ${isMobile ? 'w-full justify-start' : 'text-base px-6'} hover:bg-green-50 hover:border-green-300`}
                              onClick={() => handleDownloadPDF(doc)}
                            >
                              <Download className="h-5 w-5 ml-2" />
                              הורד PDF
                            </Button>
                            <Button 
                              variant="outline" 
                              size={isMobile ? "default" : "lg"}
                              className={`rounded-xl ${isMobile ? 'w-full justify-start' : 'text-base px-6'} hover:bg-green-50 hover:border-green-300`}
                              onClick={() => handleSendToWhatsApp(doc)}
                              disabled={updateDocumentStatus.isPending || !customer?.phone}
                            >
                              <Send className="h-5 w-5 ml-2" />
                              שלח לוואטסאפ
                            </Button>
                            {!isMobile && (
                              <>
                                <UploadDocumentDialog
                                  customerId={customerId}
                                  documentId={doc.id}
                                  trigger={
                                    <Button variant="outline" size="lg" className="rounded-xl text-base px-6 hover:bg-purple-50 hover:border-purple-300">
                                      <Upload className="h-5 w-5 ml-2" />
                                      העלה מסמך חתום
                                    </Button>
                                  }
                                />
                                <Button 
                                  variant="outline" 
                                  size="lg" 
                                  className="rounded-xl text-base px-6 hover:bg-emerald-50 hover:border-emerald-300"
                                  onClick={() => handleStatusUpdate(doc.id, 'signed')}
                                  disabled={updateDocumentStatus.isPending}
                                >
                                  <CheckCircle className="h-5 w-5 ml-2" />
                                  סמן כחתום
                                </Button>
                              </>
                            )}
                          </div>
                          {isMobile ? (
                            <div className="flex flex-col gap-2">
                              <UploadDocumentDialog
                                customerId={customerId}
                                documentId={doc.id}
                                trigger={
                                  <Button variant="outline" size="default" className="rounded-xl w-full justify-start hover:bg-purple-50 hover:border-purple-300">
                                    <Upload className="h-5 w-5 ml-2" />
                                    העלה מסמך חתום
                                  </Button>
                                }
                              />
                              <Button 
                                variant="outline" 
                                size="default"
                                className="rounded-xl w-full justify-start hover:bg-emerald-50 hover:border-emerald-300"
                                onClick={() => handleStatusUpdate(doc.id, 'signed')}
                                disabled={updateDocumentStatus.isPending}
                              >
                                <CheckCircle className="h-5 w-5 ml-2" />
                                סמן כחתום
                              </Button>
                              <Button 
                                variant="outline" 
                                size="default"
                                className="text-destructive rounded-xl w-full justify-start hover:bg-red-50 hover:border-red-300"
                                onClick={() => handleStatusUpdate(doc.id, 'cancelled')}
                                disabled={updateDocumentStatus.isPending}
                              >
                                <X className="h-5 w-5 ml-2" />
                                בטל
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-3">
                              <Button 
                                variant="outline" 
                                size="lg" 
                                className="text-destructive rounded-xl text-base px-6 hover:bg-red-50 hover:border-red-300"
                                onClick={() => handleStatusUpdate(doc.id, 'cancelled')}
                                disabled={updateDocumentStatus.isPending}
                              >
                                <X className="h-5 w-5 ml-2" />
                                בטל
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 w-full ${isMobile ? '' : 'justify-center'}`}>
                          <Button 
                            variant="outline" 
                            size={isMobile ? "default" : "lg"}
                            className={`rounded-xl ${isMobile ? 'w-full justify-start' : 'text-base px-8'} hover:bg-blue-50 hover:border-blue-300`}
                            onClick={() => {
                              if (doc.url) {
                                window.open(doc.url, '_blank');
                              } else {
                                toast.error('אין קישור למסמך');
                              }
                            }}
                          >
                            <Eye className="h-5 w-5 ml-2" />
                            צפה במסמך
                          </Button>
                          <Button 
                            variant="outline" 
                            size={isMobile ? "default" : "lg"}
                            className={`rounded-xl ${isMobile ? 'w-full justify-start' : 'text-base px-8'} hover:bg-green-50 hover:border-green-300`}
                            onClick={() => handleDownloadPDF(doc)}
                          >
                            <Download className="h-5 w-5 ml-2" />
                            הורד PDF
                          </Button>
                        </div>
                      )}
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
            
            {returnsLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : documentReturns.length === 0 ? (
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (docReturn.file_path) {
                            supabase.storage
                              .from('customer-documents')
                              .createSignedUrl(docReturn.file_path, 3600)
                              .then(({ data, error }) => {
                                if (data?.signedUrl) {
                                  window.open(data.signedUrl, '_blank');
                                } else {
                                  toast.error('שגיאה בפתיחת המסמך');
                                }
                              });
                          }
                        }}
                      >
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