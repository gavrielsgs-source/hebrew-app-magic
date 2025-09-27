import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { TaxInvoiceData } from '@/types/tax-invoice';

interface TaxInvoicePreviewProps {
  data: TaxInvoiceData;
}

export function TaxInvoicePreview({ data }: TaxInvoicePreviewProps) {
  const currencySymbol = data.currency === 'ILS' ? '₪' : '$';

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white" dir="rtl">
      <CardContent className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-semibold">מספר חשבונית: </span>
              <span className="text-lg">{data.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-lg font-semibold">תאריך: </span>
              <span className="text-lg">{new Date(data.date).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Company and Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">פרטי המוכר</h3>
            <div className="space-y-2">
              <div><strong>שם החברה:</strong> {data.company.name}</div>
              <div><strong>כתובת:</strong> {data.company.address}</div>
              <div><strong>עוסק מורשה:</strong> {data.company.hp}</div>
              <div><strong>טלפון:</strong> {data.company.phone}</div>
              {data.company.authorizedDealer && (
                <Badge variant="secondary">עוסק מורשה</Badge>
              )}
            </div>
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">פרטי הקונה</h3>
            <div className="space-y-2">
              <div><strong>שם:</strong> {data.customer.name}</div>
              <div><strong>כתובת:</strong> {data.customer.address}</div>
              <div><strong>ח.פ / ת.ז:</strong> {data.customer.hp}</div>
              <div><strong>טלפון:</strong> {data.customer.phone}</div>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">פירוט הפריטים</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-right">#</th>
                  <th className="border border-gray-300 p-3 text-right">תיאור</th>
                  <th className="border border-gray-300 p-3 text-right">כמות</th>
                  <th className="border border-gray-300 p-3 text-right">מחיר יחידה</th>
                  <th className="border border-gray-300 p-3 text-right">מע"מ</th>
                  <th className="border border-gray-300 p-3 text-right">אחוז מע"מ</th>
                  <th className="border border-gray-300 p-3 text-right">סכום כולל</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-3 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-3">{item.description}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-3 text-center">
                      {item.unitPrice.toFixed(2)} {currencySymbol}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      {item.includeVat ? (
                        <Badge className="bg-green-100 text-green-800">עם מע"מ</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">ללא מע"מ</Badge>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      {item.includeVat ? `${item.vatRate}%` : '-'}
                    </td>
                    <td className="border border-gray-300 p-3 text-center font-semibold">
                      {item.total.toFixed(2)} {currencySymbol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mb-8">
          <div className="max-w-md ml-auto">
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span>סכום ללא מע"מ:</span>
                <span className="font-semibold">{data.subtotal.toFixed(2)} {currencySymbol}</span>
              </div>
              <div className="flex justify-between">
                <span>מע"מ:</span>
                <span className="font-semibold">{data.vatAmount.toFixed(2)} {currencySymbol}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>סכום כולל לתשלום:</span>
                <span>{data.totalAmount.toFixed(2)} {currencySymbol}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        {data.paymentTerms && (
          <div className="mb-6">
            <h4 className="font-bold mb-2">תנאי תשלום:</h4>
            <p>{data.paymentTerms}</p>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="mb-6">
            <h4 className="font-bold mb-2">הערות:</h4>
            <p className="whitespace-pre-wrap">{data.notes}</p>
          </div>
        )}

        <Separator className="mb-6" />

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>חשבונית זו נוצרה במערכת ניהול חכמה לסוכנויות רכב</p>
          <p>המסמך תקף עם חתימה וחותמת בלבד</p>
        </div>
      </CardContent>
    </Card>
  );
}