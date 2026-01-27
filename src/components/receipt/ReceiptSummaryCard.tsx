import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ReceiptTotals {
  cash: number;
  check: number;
  creditCard: number;
  bankTransfer: number;
  other: number;
  taxDeduction: number;
  vehicle: number;
  totalWithTaxDeduction: number;
  grandTotal: number;
}

interface ReceiptSummaryCardProps {
  totals: ReceiptTotals;
  className?: string;
}

export const ReceiptSummaryCard = ({ totals, className = "" }: ReceiptSummaryCardProps) => (
  <Card className={cn("shadow-xl rounded-2xl border-0 overflow-hidden", className)}>
    <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-500 p-5 text-white">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>סה"כ מזומן</span>
          <span>₪ {totals.cash.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>סה"כ המחאות</span>
          <span>₪ {totals.check.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>סה"כ כרטיסי אשראי</span>
          <span>₪ {totals.creditCard.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>סה"כ העברות בנקאיות</span>
          <span>₪ {totals.bankTransfer.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>סה"כ אחר</span>
          <span>₪ {totals.other.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>סה"כ ניכוי מס במקור</span>
          <span>₪ {totals.taxDeduction.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>סה"כ רכבים</span>
          <span>₪ {totals.vehicle.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>סה"כ כולל ניכוי מס במקור</span>
          <span>₪ {totals.totalWithTaxDeduction.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/30">
        <div className="text-center">
          <span className="text-sm opacity-80">סה"כ שולם</span>
          <div className="text-3xl font-bold mt-1">
            ₪ {totals.grandTotal.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  </Card>
);
