import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

type PaymentType = 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other' | 'tax_deduction' | 'vehicle';

interface PaymentTabContentProps {
  type: PaymentType;
  paymentList: { amount: string; date: Date; [key: string]: any }[];
  updatePayment: (type: PaymentType, index: number, field: string, value: any) => void;
  removePayment: (type: PaymentType, index: number) => void;
  addPayment: (type: PaymentType) => void;
}

export const PaymentTabContent = ({ type, paymentList, updatePayment, removePayment, addPayment }: PaymentTabContentProps) => {
  // מזומן - Cash: Date, Amount only
  if (type === 'cash') {
    return (
      <div className="space-y-3">
        <div className="hidden md:flex md:flex-row-reverse gap-4 text-sm text-muted-foreground px-2">
          <span className="min-w-[140px]">תאריך</span>
          <span className="flex-1">סכום</span>
          <span className="w-10"></span>
        </div>
        {paymentList.map((payment, index) => (
          <div key={index} className="flex flex-col md:flex-row-reverse items-stretch md:items-center gap-4 p-3 rounded-xl">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl min-w-[140px] justify-start">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {format(payment.date, "dd/MM/yyyy", { locale: he })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Input
              type="text"
              inputMode="decimal"
              value={payment.amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                updatePayment(type, index, 'amount', value);
              }}
              placeholder="הזן סכום"
              className="flex-1 h-10 rounded-xl text-right"
            />
            {paymentList.length > 0 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          הוסף תשלום
        </Button>
      </div>
    );
  }

  // המחאות - Checks: Date, Account Number, Branch Number, Bank Number, Check Number, Total
  if (type === 'check') {
    return (
      <div className="space-y-3">
        <div className="hidden md:flex md:flex-row-reverse gap-4 text-sm text-muted-foreground px-2">
          <span className="min-w-[120px]">תאריך</span>
          <span className="flex-1">מספר חשבון</span>
          <span className="w-28">מספר סניף</span>
          <span className="w-24">מספר בנק</span>
          <span className="w-28">מספר המחאה</span>
          <span className="w-24">סה"כ</span>
          <span className="w-10"></span>
        </div>
        {paymentList.map((payment, index) => (
          <div key={index} className="flex flex-col md:flex-row-reverse items-stretch md:items-center gap-4 p-3 rounded-xl">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl min-w-[120px] justify-start">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {format(payment.date, "dd/MM/yyyy", { locale: he })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Input type="text" inputMode="numeric" value={payment.accountNumber || ''} onChange={(e) => updatePayment(type, index, 'accountNumber', e.target.value)} placeholder="הזן מספר חשבון" className="flex-1 h-10 rounded-xl text-right" />
            <Input type="text" inputMode="numeric" value={payment.branchNumber || ''} onChange={(e) => updatePayment(type, index, 'branchNumber', e.target.value)} placeholder="מספר סניף" className="w-28 h-10 rounded-xl text-right" />
            <Input type="text" inputMode="numeric" value={payment.bankNumber || ''} onChange={(e) => updatePayment(type, index, 'bankNumber', e.target.value)} placeholder="מספר בנק" className="w-24 h-10 rounded-xl text-right" />
            <Input type="text" inputMode="numeric" value={payment.checkNumber || ''} onChange={(e) => updatePayment(type, index, 'checkNumber', e.target.value)} placeholder="מספר המחאה" className="w-28 h-10 rounded-xl text-right" />
            <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סה״כ" className="w-24 h-10 rounded-xl text-right" />
            {paymentList.length > 0 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          הוסף תשלום
        </Button>
      </div>
    );
  }

  // כרטיסי אשראי - Credit Cards: Date, Last 4 Digits, Expiry, Card Type, ID/HP, Installments, Total
  if (type === 'credit_card') {
    const cardTypes = ['Mastercard', 'Diners', 'Visa', 'American Express', 'Maestro', 'ישראכרט'];
    const installmentOptions = Array.from({ length: 120 }, (_, i) => i + 1);
    
    return (
      <div className="space-y-3">
        <div className="hidden md:flex md:flex-row-reverse gap-4 text-sm text-muted-foreground px-2">
          <span className="min-w-[110px]">תאריך</span>
          <span className="w-20">4 ספרות אחרונות</span>
          <span className="w-20">תוקף</span>
          <span className="w-32">סוג כרטיס</span>
          <span className="w-28">ת.ז/ח.פ</span>
          <span className="w-24">תשלומים</span>
          <span className="w-24">סה"כ</span>
          <span className="w-10"></span>
        </div>
        {paymentList.map((payment, index) => (
          <div key={index} className="flex flex-col md:flex-row-reverse items-stretch md:items-center gap-4 p-3 rounded-xl flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl min-w-[110px] justify-start">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {format(payment.date, "dd/MM/yyyy", { locale: he })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Input type="text" inputMode="numeric" maxLength={4} value={payment.lastFourDigits || ''} onChange={(e) => updatePayment(type, index, 'lastFourDigits', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="4 ספרות" className="w-20 h-10 rounded-xl text-right" />
            <Input type="text" value={payment.expiryDate || ''} onChange={(e) => updatePayment(type, index, 'expiryDate', e.target.value)} placeholder="MM/YY" className="w-20 h-10 rounded-xl text-right" />
            <Select value={payment.cardType || ''} onValueChange={(val) => updatePayment(type, index, 'cardType', val)}>
              <SelectTrigger className="w-32 h-10 rounded-xl">
                <SelectValue placeholder="סוג כרטיס" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {cardTypes.map((ct) => (
                  <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="text" inputMode="numeric" value={payment.idNumber || ''} onChange={(e) => updatePayment(type, index, 'idNumber', e.target.value)} placeholder="ת.ז/ח.פ" className="w-28 h-10 rounded-xl text-right" />
            <Select value={String(payment.installments || '1')} onValueChange={(val) => updatePayment(type, index, 'installments', parseInt(val))}>
              <SelectTrigger className="w-24 h-10 rounded-xl">
                <SelectValue placeholder="תשלומים" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background max-h-60">
                {installmentOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סה״כ" className="w-24 h-10 rounded-xl text-right" />
            {paymentList.length > 0 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          הוסף תשלום
        </Button>
      </div>
    );
  }

  // העברות בנקאיות - Bank Transfer: Date, Account Number, Branch Number, Bank Number, Total
  if (type === 'bank_transfer') {
    return (
      <div className="space-y-3">
        <div className="hidden md:flex md:flex-row-reverse gap-4 text-sm text-muted-foreground px-2">
          <span className="min-w-[120px]">תאריך</span>
          <span className="flex-1">מספר חשבון</span>
          <span className="w-28">מספר סניף הבנק</span>
          <span className="w-24">מספר בנק</span>
          <span className="w-24">סה"כ</span>
          <span className="w-10"></span>
        </div>
        {paymentList.map((payment, index) => (
          <div key={index} className="flex flex-col md:flex-row-reverse items-stretch md:items-center gap-4 p-3 rounded-xl">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl min-w-[120px] justify-start">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {format(payment.date, "dd/MM/yyyy", { locale: he })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Input type="text" inputMode="numeric" value={payment.accountNumber || ''} onChange={(e) => updatePayment(type, index, 'accountNumber', e.target.value)} placeholder="הזן את מספר החשבון" className="flex-1 h-10 rounded-xl text-right" />
            <Input type="text" inputMode="numeric" value={payment.branchNumber || ''} onChange={(e) => updatePayment(type, index, 'branchNumber', e.target.value)} placeholder="הזן מספר סניף" className="w-28 h-10 rounded-xl text-right" />
            <Input type="text" inputMode="numeric" value={payment.bankNumber || ''} onChange={(e) => updatePayment(type, index, 'bankNumber', e.target.value)} placeholder="מספר בנק" className="w-24 h-10 rounded-xl text-right" />
            <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סה״כ" className="w-24 h-10 rounded-xl text-right" />
            {paymentList.length > 0 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          הוסף תשלום
        </Button>
      </div>
    );
  }

  // אחר - Other: Date, Payment Type (free text), Amount
  if (type === 'other') {
    return (
      <div className="space-y-3">
        <div className="hidden md:flex md:flex-row-reverse gap-4 text-sm text-muted-foreground px-2">
          <span className="min-w-[120px]">תאריך</span>
          <span className="flex-1">סוג תשלום</span>
          <span className="w-28">סכום</span>
          <span className="w-10"></span>
        </div>
        {paymentList.map((payment, index) => (
          <div key={index} className="flex flex-col md:flex-row-reverse items-stretch md:items-center gap-4 p-3 rounded-xl">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl min-w-[120px] justify-start">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {format(payment.date, "dd/MM/yyyy", { locale: he })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Input type="text" value={payment.paymentType || ''} onChange={(e) => updatePayment(type, index, 'paymentType', e.target.value)} placeholder="הזן סוג תשלום" className="flex-1 h-10 rounded-xl text-right" />
            <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סכום" className="w-28 h-10 rounded-xl text-right" />
            {paymentList.length > 0 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          הוסף תשלום
        </Button>
      </div>
    );
  }

  // ניכוי מס במקור - Tax Deduction: Amount only
  if (type === 'tax_deduction') {
    return (
      <div className="space-y-3">
        <div className="hidden md:flex md:flex-row-reverse gap-4 text-sm text-muted-foreground px-2">
          <span className="flex-1">סכום</span>
          <span className="w-10"></span>
        </div>
        {paymentList.map((payment, index) => (
          <div key={index} className="flex flex-col md:flex-row-reverse items-stretch md:items-center gap-4 p-3 rounded-xl">
            <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סכום ניכוי מס במקור" className="flex-1 h-10 rounded-xl text-right" />
            {paymentList.length > 0 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          הוסף תשלום
        </Button>
      </div>
    );
  }

  // רכבים - Vehicles: Date, Vehicle (License Plate), Total
  if (type === 'vehicle') {
    return (
      <div className="space-y-3">
        <div className="hidden md:flex md:flex-row-reverse gap-4 text-sm text-muted-foreground px-2">
          <span className="min-w-[120px]">תאריך</span>
          <span className="flex-1">רכב (מספר רישוי)</span>
          <span className="w-28">סה"כ</span>
          <span className="w-10"></span>
        </div>
        {paymentList.map((payment, index) => (
          <div key={index} className="flex flex-col md:flex-row-reverse items-stretch md:items-center gap-4 p-3 rounded-xl">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl min-w-[120px] justify-start">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {format(payment.date, "dd/MM/yyyy", { locale: he })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Input type="text" value={payment.licensePlate || ''} onChange={(e) => updatePayment(type, index, 'licensePlate', e.target.value)} placeholder="הזן מספר רישוי" className="flex-1 h-10 rounded-xl text-right" />
            <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סה״כ" className="w-28 h-10 rounded-xl text-right" />
            {paymentList.length > 0 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          הוסף תשלום
        </Button>
      </div>
    );
  }

  return null;
};
