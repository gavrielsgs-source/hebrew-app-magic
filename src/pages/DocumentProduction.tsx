import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { DOCUMENT_TYPES } from "@/types/document-production";
import SalesAgreement from "./SalesAgreement";
import NewCarOrder from "./NewCarOrder";
import PriceQuote from "./PriceQuote";
import TaxInvoiceReceipt from "./TaxInvoiceReceipt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function DocumentProduction() {
  const { type } = useParams<{ type: string }>();

  // Find the document type
  const documentType = DOCUMENT_TYPES.find(doc => doc.id === type);

  if (!documentType) {
    return <Navigate to="/document-production" replace />;
  }

  // Route to specific document component
  switch (type) {
    case 'sales-agreement':
      return <SalesAgreement />;
    
    case 'new-car-order':
      return <NewCarOrder />;
    
    case 'price-quote':
      return <PriceQuote />;
    
    case 'tax-invoice-receipt':
      return <TaxInvoiceReceipt />;
    
    // Future document types will be handled here
    default:
      return (
        <div className="container mx-auto py-6 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <FileText className="h-6 w-6" />
                {documentType.name} - בפיתוח
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-xl font-semibold mb-2">תכונה בפיתוח</h2>
                <p className="text-muted-foreground">
                  המסמך "{documentType.name}" נמצא כרגע בפיתוח ויהיה זמין בקרוב.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
  }
}