import { FileText, Plus, Filter, Eye, Send, Upload, X, Clock, CheckCircle, AlertCircle, XCircle, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateCustomerDocumentDialog } from "./CreateCustomerDocumentDialog";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { useCustomerDocuments, useCustomerDocumentReturns, useUpdateCustomerDocumentStatus, useCustomerRelatedDocuments } from "@/hooks/customers";
import { useCustomer } from "@/hooks/customers/use-customer";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { generateSalesAgreementPDF } from "@/utils/pdf-generator";
import { generateReceiptPDF } from "@/utils/receipt-pdf-generator";
import { generatePriceQuotePDF } from "@/utils/price-quote-pdf-generator";
import html2pdf from 'html2pdf.js';

interface CustomerDocumentsProps {
  customerId: string;
}

export function CustomerDocuments({ customerId }: CustomerDocumentsProps) {
  const { data: documents = [], isLoading: documentsLoading } = useCustomerDocuments(customerId);
  const { data: documentReturns = [], isLoading: returnsLoading } = useCustomerDocumentReturns(customerId);
  const { data: attachedDocs = [], isLoading: attachedLoading } = useCustomerRelatedDocuments(customerId);
  const { data: customer } = useCustomer(customerId);
  const { profile } = useProfile();
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
    const formattedPhone = phoneNumber.startsWith('0') ? `972${phoneNumber.slice(1)}` : phoneNumber;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    // Update status to sent
    if (doc.status !== 'attached') {
      handleStatusUpdate(doc.id, 'sent');
    }
    
    // Navigate directly to wa.me
    window.location.href = whatsappUrl;
  };

  const generateDocumentHTML = (doc: any) => {
    return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${doc.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      direction: rtl;
      text-align: right;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      color: #666;
    }
    .details {
      margin-bottom: 30px;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .details-label {
      font-weight: bold;
      color: #555;
    }
    .footer {
      margin-top: 50px;
      border-top: 1px solid #ccc;
      padding-top: 20px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${doc.title}</h1>
    <p>מספר מסמך: ${doc.document_number}</p>
  </div>
  <div class="details">
    <div class="details-row">
      <span class="details-label">סוג מסמך:</span>
      <span>${doc.type}</span>
    </div>
    <div class="details-row">
      <span class="details-label">סכום:</span>
      <span>${doc.amount ? `₪${doc.amount.toLocaleString()}` : 'לא צוין'}</span>
    </div>
    <div class="details-row">
      <span class="details-label">תאריך:</span>
      <span>${new Date(doc.date || doc.created_at).toLocaleDateString('he-IL')}</span>
    </div>
    <div class="details-row">
      <span class="details-label">סטטוס:</span>
      <span>${doc.status}</span>
    </div>
  </div>
  <div class="footer">
    <p>מסמך זה נוצר אוטומטית במערכת</p>
  </div>
</body>
</html>`;
  };

  const handleDownloadPDF = async (doc: any) => {
    try {
      toast.loading('מכין את המסמך להורדה...', { id: 'pdf-download' });

      // For attached documents (tax invoices etc.) - navigate to internal URL
      if (doc.status === 'attached' && doc.entity_type === 'tax_invoice') {
        toast.dismiss('pdf-download');
        window.open(doc.url, '_blank');
        toast.success('פותח את המסמך...');
        return;
      }

      // For attached documents with external URL
      if (doc.status === 'attached' && doc.url && doc.url.startsWith('http')) {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = `${doc.title}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.dismiss('pdf-download');
        toast.success('המסמך הורד בהצלחה');
        return;
      }

      // Check if PDF already exists in storage for customer documents
      if (doc.file_path && doc.status !== 'attached') {
        try {
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
            toast.dismiss('pdf-download');
            toast.success('המסמך הורד בהצלחה');
            return;
          }
        } catch (storageErr) {
          console.warn('Storage download failed, generating PDF:', storageErr);
        }
      }

      // Generate proper PDF based on document type
      const docType = doc.type?.toLowerCase() || '';
      const docDate = doc.date || doc.created_at ? new Date(doc.date || doc.created_at).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL');

      if (docType === 'contract' || doc.title?.includes('הסכם מכר') || doc.title?.includes('הסכם')) {
        // Generate sales agreement PDF
        const salesData = {
          date: docDate,
          seller: {
            company: profile?.company_name || '______',
            id: profile?.company_hp || '______',
            phone: profile?.phone || '______',
            address: {
              street: profile?.company_address || '______',
              city: '',
              country: 'ישראל',
            },
          },
          buyer: {
            name: customer?.full_name || '______',
            id: customer?.id_number || '______',
            phone: customer?.phone || '______',
            address: customer?.address || '______',
          },
          car: {
            make: '',
            model: '',
            licenseNumber: '',
            chassisNumber: '',
            year: 0,
            mileage: 0,
            hand: '',
            originality: '',
          },
          financial: {
            totalPrice: doc.amount || 0,
            downPayment: 0,
            remainingAmount: doc.amount || 0,
            paymentTerms: '',
            specialTerms: '',
          },
        };
        await generateSalesAgreementPDF(salesData);
      } else if (docType === 'receipt' || doc.title?.includes('קבלה')) {
        // Generate receipt PDF
        const receiptData = {
          receiptNumber: doc.document_number || '',
          date: docDate,
          branch: '',
          language: 'hebrew' as const,
          currency: 'ILS' as const,
          title: doc.title || 'קבלה',
          customer: {
            name: customer?.full_name || '',
            address: customer?.address || '',
            hp: customer?.id_number || '',
            phone: customer?.phone || '',
          },
          receiptForType: 'none' as const,
          payments: [{
            id: '1',
            type: 'cash' as const,
            amount: doc.amount || 0,
            date: docDate,
          }],
          totals: {
            cash: doc.amount || 0,
            check: 0,
            creditCard: 0,
            bankTransfer: 0,
            other: 0,
            taxDeduction: 0,
            vehicle: 0,
            totalWithTaxDeduction: doc.amount || 0,
            grandTotal: doc.amount || 0,
          },
          notes: '',
          company: {
            name: profile?.company_name || '',
            address: profile?.company_address || '',
            hp: profile?.company_hp || '',
            phone: profile?.phone || '',
            authorizedDealer: profile?.company_authorized_dealer || false,
            logoUrl: profile?.company_logo_url || undefined,
          },
        };
        await generateReceiptPDF(receiptData);
      } else if (docType === 'quote' || doc.title?.includes('הצעת מחיר')) {
        // Generate price quote PDF
        const quoteData = {
          date: docDate,
          quoteNumber: doc.document_number || '',
          customer: {
            fullName: customer?.full_name || '',
            firstName: customer?.full_name?.split(' ')[0] || '',
            phone: customer?.phone || '',
            email: customer?.email || '',
            city: customer?.city || '',
            address: customer?.address || '',
          },
          items: [{
            id: '1',
            description: doc.title || 'פריט',
            unitPrice: doc.amount || 0,
            quantity: 1,
            discount: 0,
            totalPrice: doc.amount || 0,
          }],
          validUntil: '',
          financial: {
            subtotal: doc.amount || 0,
            totalDiscount: 0,
            total: doc.amount || 0,
          },
          company: {
            name: profile?.company_name || '',
            address: profile?.company_address || '',
            hp: profile?.company_hp || '',
            phone: profile?.phone || '',
            authorizedDealer: profile?.company_authorized_dealer || false,
            logoUrl: profile?.company_logo_url || undefined,
          },
        };
        await generatePriceQuotePDF(quoteData);
      } else {
        // Fallback: generate generic document PDF
        const htmlContent = generateDocumentHTML(doc);
        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        document.body.appendChild(element);

        const opt = {
          margin: 10,
          filename: `${doc.title}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        await html2pdf().set(opt).from(element).save();
        document.body.removeChild(element);
      }

      toast.dismiss('pdf-download');
      toast.success('המסמך הורד בהצלחה');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.dismiss('pdf-download');
      toast.error('שגיאה בהורדת המסמך');
    }
  };

  return (
    <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-md hover:shadow-2xl transition-all duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-sm"></div>
            <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2.5 rounded-xl">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-800 mb-0.5">
              מסמכים דיגיטליים
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              ניהול חכם ומתקדם של כל המסמכים והחוזים
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 rounded-xl p-1 shadow-inner">
            <TabsTrigger value="returns" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 text-sm">
              מסמכים שהוחזרו
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 text-sm">
              מסמכים
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger className="w-32 text-sm h-8">
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
                <Button variant="outline" size="sm" className="h-8 text-sm">
                  <Filter className="h-3.5 w-3.5 ml-1" />
                  סינון
                </Button>
              </div>
            </div>
            
            {documentsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 && attachedDocs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <h3 className="text-sm font-medium mb-1">אין מסמכים עדיין</h3>
                <p className="text-xs mb-3">מסמכים שנוצרים למען הלקוח יופיעו כאן</p>
              </div>
            ) : (
              <div className="space-y-4" dir="rtl">
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
                  <div key={doc.id} className="border border-slate-200 rounded-xl p-4 bg-gradient-to-bl from-white via-slate-50/30 to-blue-50/20 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-right flex-1">
                        <h4 className="font-bold text-sm text-slate-800 mb-1">{doc.title}</h4>
                        <div className="space-y-0.5">
                          <p className="text-xs text-slate-600 flex items-center gap-1.5">
                            <span className="font-semibold">מספר מסמך:</span>
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{doc.document_number}</span>
                          </p>
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold">סוג:</span> {doc.type}
                          </p>
                        </div>
                      </div>
                      <div className="mr-3">
                        {doc.status === 'attached' ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 shadow-sm text-xs px-2 py-0.5">
                            <FileText className="h-3 w-3 ml-1" />
                            מצורף
                          </Badge>
                        ) : (
                          getStatusBadge(doc.status)
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 mb-4 bg-white/50 p-3 rounded-lg border border-slate-100">
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
                    
                    <div className={`pt-3 border-t border-slate-100 ${isMobile ? 'space-y-2' : 'flex items-center justify-between'}`}>
                      {doc.status !== 'attached' ? (
                        <>
                          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 flex-wrap`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={`rounded-lg ${isMobile ? 'w-full justify-start' : 'text-xs px-3'} hover:bg-green-50 hover:border-green-300`}
                              onClick={() => handleDownloadPDF(doc)}
                            >
                              <Download className="h-3.5 w-3.5 ml-1" />
                              הורד PDF
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={`rounded-lg ${isMobile ? 'w-full justify-start' : 'text-xs px-3'} hover:bg-green-50 hover:border-green-300`}
                              onClick={() => handleSendToWhatsApp(doc)}
                              disabled={updateDocumentStatus.isPending || !customer?.phone}
                            >
                              <Send className="h-3.5 w-3.5 ml-1" />
                              שלח לוואטסאפ
                            </Button>
                            {!isMobile && (
                              <>
                                <UploadDocumentDialog
                                  customerId={customerId}
                                  documentId={doc.id}
                                  trigger={
                                    <Button variant="outline" size="sm" className="rounded-lg text-xs px-3 hover:bg-purple-50 hover:border-purple-300">
                                      <Upload className="h-3.5 w-3.5 ml-1" />
                                      העלה מסמך חתום
                                    </Button>
                                  }
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-lg text-xs px-3 hover:bg-emerald-50 hover:border-emerald-300"
                                  onClick={() => handleStatusUpdate(doc.id, 'signed')}
                                  disabled={updateDocumentStatus.isPending}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 ml-1" />
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
                                  <Button variant="outline" size="sm" className="rounded-lg w-full justify-start text-xs hover:bg-purple-50 hover:border-purple-300">
                                    <Upload className="h-3.5 w-3.5 ml-1" />
                                    העלה מסמך חתום
                                  </Button>
                                }
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="rounded-lg w-full justify-start text-xs hover:bg-emerald-50 hover:border-emerald-300"
                                onClick={() => handleStatusUpdate(doc.id, 'signed')}
                                disabled={updateDocumentStatus.isPending}
                              >
                                <CheckCircle className="h-3.5 w-3.5 ml-1" />
                                סמן כחתום
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-destructive rounded-lg w-full justify-start text-xs hover:bg-red-50 hover:border-red-300"
                                onClick={() => handleStatusUpdate(doc.id, 'cancelled')}
                                disabled={updateDocumentStatus.isPending}
                              >
                                <X className="h-3.5 w-3.5 ml-1" />
                                בטל
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive rounded-lg text-xs px-3 hover:bg-red-50 hover:border-red-300"
                                onClick={() => handleStatusUpdate(doc.id, 'cancelled')}
                                disabled={updateDocumentStatus.isPending}
                              >
                                <X className="h-3.5 w-3.5 ml-1" />
                                בטל
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 w-full ${isMobile ? '' : 'justify-center'}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`rounded-lg ${isMobile ? 'w-full justify-start' : 'text-xs px-4'} hover:bg-blue-50 hover:border-blue-300`}
                            onClick={() => {
                              if (doc.entity_type === 'tax_invoice') {
                                window.open(doc.url, '_blank');
                              } else if (doc.url) {
                                window.open(doc.url, '_blank');
                              } else {
                                toast.error('אין קישור למסמך');
                              }
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 ml-1" />
                            צפה במסמך
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`rounded-lg ${isMobile ? 'w-full justify-start' : 'text-xs px-4'} hover:bg-green-50 hover:border-green-300`}
                            onClick={() => handleDownloadPDF(doc)}
                          >
                            <Download className="h-3.5 w-3.5 ml-1" />
                            הורד PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`rounded-lg ${isMobile ? 'w-full justify-start' : 'text-xs px-4'} hover:bg-green-50 hover:border-green-300`}
                            onClick={() => handleSendToWhatsApp({
                              ...doc,
                              document_number: doc.document_number || doc.id.slice(0, 8)
                            })}
                            disabled={!customer?.phone}
                          >
                            <Send className="h-3.5 w-3.5 ml-1" />
                            שלח לוואטסאפ
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="returns" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium">מסמכים שהלקוח שלח חזרה ({documentReturns.length})</h3>
            </div>
            
            {returnsLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : documentReturns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <h3 className="text-sm font-medium mb-1">אין מסמכים שהוחזרו</h3>
                <p className="text-xs">מסמכים שהלקוח יעלה יופיעו כאן</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documentReturns.map((docReturn) => (
                  <div key={docReturn.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-medium text-sm">מסמך שהוחזר</h4>
                      <Badge variant="default" className="bg-green-600 text-xs">הועלה</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      הועלה ב-{new Date(docReturn.uploaded_at).toLocaleDateString('he-IL')}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
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
                        <Eye className="h-3.5 w-3.5 ml-1" />
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
