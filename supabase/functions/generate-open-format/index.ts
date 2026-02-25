import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// =============================================
// FORMATTING HELPERS
// =============================================

export function padRight(value: string | null | undefined, length: number, fill = ' '): string {
  const str = String(value ?? '').replace(/[\r\n]/g, ' ');
  if (str.length > length) return str.slice(0, length);
  return str.padEnd(length, fill);
}

export function padLeft(value: number | string | null | undefined, length: number, fill = '0'): string {
  const str = String(value ?? '').replace(/[^0-9]/g, '');
  if (str.length > length) return str.slice(0, length);
  return str.padStart(length, fill);
}

export function fmtSignedAmount(value: number | null | undefined, length: number): string {
  // Format: sign + zero-padded absolute value in agorot (cents)
  const num = value ?? 0;
  const sign = num >= 0 ? '+' : '-';
  const agorot = Math.abs(Math.round(num * 100));
  const digits = String(agorot);
  const fieldLen = length - 1; // 1 char for sign
  if (digits.length > fieldLen) return sign + digits.slice(0, fieldLen);
  return sign + digits.padStart(fieldLen, '0');
}

export function fmtDate(date: string | Date | null | undefined): string {
  if (!date) return '00000000';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '00000000';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function fmtTime(date: Date | null): string {
  if (!date) return '0000';
  return String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
}

export function appendCRLF(line: string): string {
  return line + '\r\n';
}

// =============================================
// OFFICIAL OPEN FORMAT 1.31 RECORD DEFINITIONS
// Based on Israeli Tax Authority spec (Oracle Appendix 6)
// =============================================

// Version constant used in A100, Z900, A000
const SPEC_CONSTANT = '&OF1.31&'; // 8 chars

// A100 — Opening record in BKMVDATA — Total: 95 chars
// Pos 0:  Record Code (4) "A100"
// Pos 4:  Future Use / Record Number (9)
// Pos 13: Tax Identifier (9)
// Pos 22: Reference Key / Primary ID (15)
// Pos 37: Constant (8) "&OF1.31&"
// Pos 45: Rasham Number / Future Use (50) blank
export function buildA100(p: {
  recordNum: number;
  companyTaxId: string;
  primaryId: string;
}): string {
  return [
    padRight('A100', 4),
    padLeft(p.recordNum, 9),
    padRight(p.companyTaxId, 9),
    padRight(p.primaryId, 15),
    padRight(SPEC_CONSTANT, 8),
    padRight('', 50),
  ].join('');
}
export const A100_LEN = 95;

// C100 — Document header — Total: 444 chars
// Pos 0:   Record Code (4)
// Pos 4:   Future Use / Record Number (9)
// Pos 13:  Registration Number / Tax ID (9)
// Pos 22:  Doc Type Code (3)
// Pos 25:  Doc Number (20)
// Pos 45:  Creation Date (8) YYYYMMDD
// Pos 53:  Creation Time (4) HHMM
// Pos 57:  Customer/Supplier Name (50)
// Pos 107: Address Line 1 (50)
// Pos 157: House Number (10)
// Pos 167: City (30)
// Pos 197: Zip Code (8)
// Pos 205: State (30)
// Pos 235: State Code (2)
// Pos 237: Phone (15)
// Pos 252: Customer Tax ID (9)
// Pos 261: Accounting/GL Date (8)
// Pos 269: Non-ILS Amount (15) signed
// Pos 284: Non-ILS Currency Code (3)
// Pos 287: Amount excl tax (15) signed
// Pos 302: Discount amount (15) signed
// Pos 317: Amount excl tax + discount (15) signed
// Pos 332: VAT/Tax amount (15) signed
// Pos 347: Total amount incl tax (15) signed
// Pos 362: Withholding tax (12) signed
// Pos 374: Account Number (15)
// Pos 389: Adjustment field (10)
// Pos 399: Cancelled flag (1) "0" or "1"
// Pos 400: Invoice Date (8) YYYYMMDD
// Pos 408: Branch ID (7)
// Pos 415: User ID (9)
// Pos 424: Internal Invoice ID (7)
// Pos 431: Future Use (13)
export function buildC100(p: {
  recordNum: number;
  companyTaxId: string;
  docTypeCode: string;
  docNumber: string;
  docDate: string;
  docTime?: string;
  customerName: string;
  customerAddress?: string;
  houseNumber?: string;
  city?: string;
  zipCode?: string;
  state?: string;
  stateCode?: string;
  phone?: string;
  customerTaxId?: string;
  glDate?: string;
  nonIlsAmount?: number;
  nonIlsCurrency?: string;
  netAmount: number;
  discountAmount?: number;
  netPlusDiscount?: number;
  vatAmount: number;
  totalAmount: number;
  withholdingAmount?: number;
  accountNumber?: string;
  cancelled: boolean;
  invoiceDate?: string;
  userId?: string;
  internalId?: string;
}): string {
  const net = p.netAmount;
  const disc = p.discountAmount ?? 0;
  const netPlusDisc = p.netPlusDiscount ?? net;
  return [
    padRight('C100', 4),                          // 0-3
    padLeft(p.recordNum, 9),                       // 4-12
    padRight(p.companyTaxId, 9),                   // 13-21
    padRight(p.docTypeCode, 3),                    // 22-24
    padRight(p.docNumber, 20),                     // 25-44
    fmtDate(p.docDate),                            // 45-52
    padRight(p.docTime || '0000', 4),              // 53-56
    padRight(p.customerName, 50),                  // 57-106
    padRight(p.customerAddress || '', 50),          // 107-156
    padRight(p.houseNumber || '', 10),             // 157-166
    padRight(p.city || '', 30),                    // 167-196
    padRight(p.zipCode || '', 8),                  // 197-204
    padRight(p.state || '', 30),                   // 205-234
    padRight(p.stateCode || '', 2),                // 235-236
    padRight(p.phone || '', 15),                   // 237-251
    padRight(p.customerTaxId || '', 9),            // 252-260
    fmtDate(p.glDate || p.docDate),                // 261-268
    fmtSignedAmount(p.nonIlsAmount ?? 0, 15),      // 269-283
    padRight(p.nonIlsCurrency || 'ILS', 3),        // 284-286
    fmtSignedAmount(net, 15),                      // 287-301
    fmtSignedAmount(disc, 15),                     // 302-316
    fmtSignedAmount(netPlusDisc, 15),              // 317-331
    fmtSignedAmount(p.vatAmount, 15),              // 332-346
    fmtSignedAmount(p.totalAmount, 15),            // 347-361
    fmtSignedAmount(p.withholdingAmount ?? 0, 12), // 362-373
    padRight(p.accountNumber || '', 15),            // 374-388
    padRight('', 10),                              // 389-398 adjustment
    padRight(p.cancelled ? '1' : '0', 1),          // 399
    fmtDate(p.invoiceDate || p.docDate),           // 400-407
    padRight('', 7),                               // 408-414 branch
    padRight(p.userId || '', 9),                   // 415-423
    padRight(p.internalId || '', 7),               // 424-430
    padRight('', 13),                              // 431-443 future
  ].join('');
}
export const C100_LEN = 444;

// D110 — Document detail line — Total: 339 chars
// Pos 0:   Record Code (4)
// Pos 4:   Future Use / Record Number (9)
// Pos 13:  Registration Number / Tax ID (9)
// Pos 22:  Doc Type Code (3)
// Pos 25:  Doc Number (20)
// Pos 45:  Line Number (4)
// Pos 49:  Sub Doc Type Code (3)
// Pos 52:  Invoice Number (20)
// Pos 72:  Blank (1)
// Pos 73:  Item Name/Catalog Code (20)
// Pos 93:  Description (30)
// Pos 123: Blank (50)
// Pos 173: Blank (30)
// Pos 203: Blank (20)
// Pos 223: Quantity (17) signed
// Pos 240: Unit Price (15) signed
// Pos 255: Discount (15) signed
// Pos 270: Line Total (15) signed
// Pos 285: VAT Rate (4) numeric (integer %)
// Pos 289: Blank (7)
// Pos 296: Invoice Date (8)
// Pos 304: Internal ID (7)
// Pos 311: Item ID (7)
// Pos 318: Org ID (21)
export function buildD110(p: {
  recordNum: number;
  companyTaxId: string;
  docTypeCode: string;
  docNumber: string;
  lineNum: number;
  catalogCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  lineTotal: number;
  vatRate: number;
  invoiceDate?: string;
  internalId?: string;
}): string {
  // Quantity field: 17 chars, signed, in units*10000 (4 decimals)
  const qtySign = p.quantity >= 0 ? '+' : '-';
  const qtyAbs = Math.abs(Math.round(p.quantity * 10000));
  const qtyStr = qtySign + String(qtyAbs).padStart(16, '0');

  return [
    padRight('D110', 4),                           // 0-3
    padLeft(p.recordNum, 9),                        // 4-12
    padRight(p.companyTaxId, 9),                    // 13-21
    padRight(p.docTypeCode, 3),                     // 22-24
    padRight(p.docNumber, 20),                      // 25-44
    padLeft(p.lineNum, 4),                          // 45-48
    padRight(p.docTypeCode, 3),                     // 49-51 sub doc type = same
    padRight(p.docNumber, 20),                      // 52-71 invoice number
    padRight('', 1),                                // 72
    padRight(p.catalogCode || '999999', 20),        // 73-92
    padRight(p.description || 'Description', 30),   // 93-122
    padRight('', 50),                               // 123-172
    padRight('', 30),                               // 173-202
    padRight('', 20),                               // 203-222
    qtyStr.length > 17 ? qtyStr.slice(0, 17) : qtyStr.padStart(17, '0'),  // 223-239
    fmtSignedAmount(p.unitPrice, 15),               // 240-254
    fmtSignedAmount(p.discountAmount ?? 0, 15),     // 255-269
    fmtSignedAmount(p.lineTotal, 15),               // 270-284
    padLeft(Math.round(p.vatRate), 4),              // 285-288
    padRight('', 7),                                // 289-295
    fmtDate(p.invoiceDate),                         // 296-303
    padRight(p.internalId || '', 7),                // 304-310
    padRight('999999', 7),                          // 311-317 item ID
    padRight('999999', 21),                         // 318-338 org ID
  ].join('');
}
export const D110_LEN = 339;

// D120 — Payment detail line — Total: 222 chars
// Pos 0:   Record Code (4)
// Pos 4:   Future Use / Record Number (9)
// Pos 13:  Registration Number / Tax ID (9)
// Pos 22:  Doc Type Code (3)
// Pos 25:  Doc Number (20)
// Pos 45:  Payment Number (4)
// Pos 49:  Receipt/Payment Type (1)
// Pos 50:  Bank Number (10)
// Pos 60:  Branch Number (10)
// Pos 70:  Account Number (15)
// Pos 85:  Check Number (10)
// Pos 95:  Due Date (8)
// Pos 103: Amount (15) signed
// Pos 118: Credit Clearing House (1)
// Pos 119: Credit Card Name (20)
// Pos 139: Credit Deal Type (1)
// Pos 140: Branch ID (7)
// Pos 147: Receipt Date (8)
// Pos 155: Receipt ID (7)
// Pos 162: Future Use (60)
export function buildD120(p: {
  recordNum: number;
  companyTaxId: string;
  docTypeCode: string;
  docNumber: string;
  paymentNum: number;
  paymentTypeCode: string;
  bankCode?: string;
  branchCode?: string;
  accountNum?: string;
  checkNum?: string;
  dueDate?: string;
  amount: number;
  creditClearing?: string;
  creditCardName?: string;
  creditDealType?: string;
  receiptDate?: string;
  receiptId?: string;
}): string {
  return [
    padRight('D120', 4),                            // 0-3
    padLeft(p.recordNum, 9),                         // 4-12
    padRight(p.companyTaxId, 9),                     // 13-21
    padRight(p.docTypeCode, 3),                      // 22-24
    padRight(p.docNumber, 20),                       // 25-44
    padLeft(p.paymentNum, 4),                        // 45-48
    padRight(p.paymentTypeCode || '0', 1),           // 49
    padRight(p.bankCode || '', 10),                  // 50-59
    padRight(p.branchCode || '', 10),                // 60-69
    padRight(p.accountNum || '', 15),                // 70-84
    padRight(p.checkNum || '', 10),                  // 85-94
    fmtDate(p.dueDate),                              // 95-102
    fmtSignedAmount(p.amount, 15),                   // 103-117
    padRight(p.creditClearing || '', 1),             // 118
    padRight(p.creditCardName || '', 20),             // 119-138
    padRight(p.creditDealType || '', 1),              // 139
    padRight('', 7),                                 // 140-146 branch
    fmtDate(p.receiptDate),                          // 147-154
    padRight(p.receiptId || '', 7),                   // 155-161
    padRight('', 60),                                // 162-221
  ].join('');
}
export const D120_LEN = 222;

// Z900 — Closing record — Total: 110 chars
// Pos 0:   Record Code (4)
// Pos 4:   Future Use / Record Number (9)
// Pos 13:  Registration Number / Tax ID (9)
// Pos 22:  Reference Key / Primary ID (15)
// Pos 37:  Constant (8) "&OF1.31&"
// Pos 45:  Total Records Count (15)
// Pos 60:  Future Use (50)
export function buildZ900(p: {
  recordNum: number;
  companyTaxId: string;
  primaryId: string;
  totalRecords: number;
}): string {
  return [
    padRight('Z900', 4),                            // 0-3
    padLeft(p.recordNum, 9),                         // 4-12
    padRight(p.companyTaxId, 9),                     // 13-21
    padRight(p.primaryId, 15),                       // 22-36
    padRight(SPEC_CONSTANT, 8),                      // 37-44
    padLeft(p.totalRecords, 15),                     // 45-59
    padRight('', 50),                                // 60-109
  ].join('');
}
export const Z900_LEN = 110;

// A000 — INI record — Total: 580 chars
// Pos 0:   Record Code (4) "A000"
// Pos 4:   Future Use (5)
// Pos 9:   Total BKMVDATA records (15)
// Pos 24:  Tax Identifier (9)
// Pos 33:  Reference Key / Primary ID (15)
// Pos 48:  Constant (8) "&OF1.31&"
// Pos 56:  Software Reg Number (8)
// Pos 64:  Software Name (20)
// Pos 84:  Software Version (20)
// Pos 104: SW Manufacturer Tax ID (9)
// Pos 113: SW Manufacturer Name (20)
// Pos 133: Software Type (1) "2"
// Pos 134: Backup Path (50)
// Pos 184: SW Accounting Type (1) "2"
// Pos 185: Accounting Type (1) "1"
// Pos 186: Company Reg Number (9)
// Pos 195: Company Tax File (9)
// Pos 204: Future Use (10)
// Pos 214: Company Name (50)
// Pos 264: Company Street (50)
// Pos 314: Company Location Number (10)
// Pos 324: Company City (30)
// Pos 354: Company Zip Code (8)
// Pos 362: Tax Year (4)
// Pos 366: Date Range Start (8)
// Pos 374: Date Range End (8)
// Pos 382: Process Start Date (8)
// Pos 390: Process Start Time (4) HHMM
// Pos 394: Language Code (1) "0"
// Pos 395: Character Set (1) "1"=ISO-8859-8
// Pos 396: SW Zip Name (20)
// Pos 416: Currency Code (3) "ILS"
// Pos 419: Branch Info (1) "0"
// Pos 420: Future Use (46)
// Pos 466: B100 counter (4+15=19)
// Pos 485: B110 counter (4+15=19)
// Pos 504: C100 counter (4+15=19)
// Pos 523: D110 counter (4+15=19)
// Pos 542: D120 counter (4+15=19)
// Pos 561: M100 counter (4+15=19)
// Total: 580
export function buildA000(p: {
  primaryId: string;
  companyTaxId: string;
  companyName: string;
  companyAddress?: string;
  companyCity?: string;
  companyZip?: string;
  taxYear: number;
  startDate: string;
  endDate: string;
  processDate: Date;
  totalBkmvRecords: number;
  softwareRegNum: string;
  softwareName: string;
  softwareVersion: string;
  vendorTaxId: string;
  vendorName: string;
  encoding: string;
  branchesEnabled: boolean;
  counts: { B100: number; B110: number; C100: number; D110: number; D120: number; M100: number };
}): string {
  const charSet = p.encoding === 'CP862' ? '2' : '1';
  return [
    padRight('A000', 4),                            // 0-3
    padRight('', 5),                                 // 4-8 future use
    padLeft(p.totalBkmvRecords, 15),                 // 9-23
    padRight(p.companyTaxId, 9),                     // 24-32
    padRight(p.primaryId, 15),                       // 33-47
    padRight(SPEC_CONSTANT, 8),                      // 48-55
    padRight(p.softwareRegNum, 8),                   // 56-63
    padRight(p.softwareName, 20),                    // 64-83
    padRight(p.softwareVersion, 20),                 // 84-103
    padRight(p.vendorTaxId, 9),                      // 104-112
    padRight(p.vendorName, 20),                      // 113-132
    padRight('2', 1),                                // 133 software type
    padRight('', 50),                                // 134-183 backup path
    padRight('2', 1),                                // 184 SW accounting type
    padRight('1', 1),                                // 185 accounting type
    padRight(p.companyTaxId, 9),                     // 186-194 company reg
    padRight(p.companyTaxId, 9),                     // 195-203 company tax file
    padRight('', 10),                                // 204-213 future
    padRight(p.companyName, 50),                     // 214-263
    padRight(p.companyAddress || '', 50),             // 264-313
    padRight('', 10),                                // 314-323 location number
    padRight(p.companyCity || '', 30),                // 324-353
    padRight(p.companyZip || '', 8),                  // 354-361
    padLeft(p.taxYear, 4),                           // 362-365
    fmtDate(p.startDate),                            // 366-373
    fmtDate(p.endDate),                              // 374-381
    fmtDate(p.processDate),                          // 382-389
    fmtTime(p.processDate),                          // 390-393
    padRight('0', 1),                                // 394 language code
    padRight(charSet, 1),                            // 395 character set
    padRight('Winzip', 20),                          // 396-415
    padRight('ILS', 3),                              // 416-418
    padRight(p.branchesEnabled ? '1' : '0', 1),     // 419
    padRight('', 46),                                // 420-465 future
    'B100' + padLeft(p.counts.B100, 15),             // 466-484
    'B110' + padLeft(p.counts.B110, 15),             // 485-503
    'C100' + padLeft(p.counts.C100, 15),             // 504-522
    'D110' + padLeft(p.counts.D110, 15),             // 523-541
    'D120' + padLeft(p.counts.D120, 15),             // 542-560
    'M100' + padLeft(p.counts.M100, 15),             // 561-579
  ].join('');
}
export const A000_LEN = 580;

// Record length map for validation
export const RECORD_LENGTHS: Record<string, number> = {
  'A100': A100_LEN,
  'C100': C100_LEN,
  'D110': D110_LEN,
  'D120': D120_LEN,
  'Z900': Z900_LEN,
};

// =============================================
// HELPERS
// =============================================

export function generate15DigitId(): string {
  const ts = Date.now().toString().slice(-10);
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return ts + rand;
}

export function generateLogicalPath(taxId: string, taxYear: number, now: Date): string {
  const taxId8 = (taxId ?? '000000000').replace(/\D/g, '').slice(0, 8).padStart(8, '0');
  const yy = String(taxYear % 100).padStart(2, '0');
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `OPENFRMT/${taxId8}.${yy}/${MM}${DD}${hh}${mm}/`;
}

export function resolveLogicalPathCollision(basePath: string, existingPaths: string[]): string {
  if (!existingPaths.includes(basePath)) return basePath;
  const match = basePath.match(/^(OPENFRMT\/\d{8}\.\d{2}\/)(\d{4})(\d{2})(\d{2})\/$/);
  if (!match) return basePath;
  const [, prefix, MMDD, hh, mm] = match;
  let newMm = parseInt(mm, 10);
  let newHh = parseInt(hh, 10);
  for (let i = 0; i < 60; i++) {
    newMm++;
    if (newMm >= 60) { newMm = 0; newHh = (newHh + 1) % 24; }
    const candidate = `${prefix}${MMDD}${String(newHh).padStart(2, '0')}${String(newMm).padStart(2, '0')}/`;
    if (!existingPaths.includes(candidate)) return candidate;
  }
  return basePath;
}

const DEFAULT_DOC_TYPE_CODES: Record<string, string> = {
  'tax-invoice': '305',
  'receipt': '400',
  'tax-invoice-receipt': '320',
  'credit-invoice': '330',
  'delivery-note': '200',
  'purchase-order': '100',
  'price-quote': '000',
  'proforma-invoice': '000',
};

function paymentTypeCode(method: string): string {
  const map: Record<string, string> = {
    'cash': '1', 'check': '2', 'credit': '3',
    'credit_card': '3', 'bank_transfer': '4', 'other': '0',
  };
  return map[method] || '0';
}

// =============================================
// SIMULATOR SAMPLE DATA GENERATOR
// =============================================

function generateSampleRecords(primaryId: string, companyTaxId: string): {
  records: string[];
  counts: Record<string, number>;
} {
  const records: string[] = [];
  let recordNum = 1;
  const counts: Record<string, number> = {
    'A100': 0, 'C100': 0, 'D110': 0, 'D120': 0,
    'B100': 0, 'B110': 0, 'M100': 0, 'Z900': 0, 'A000': 0,
  };

  // A100 opening
  records.push(buildA100({ recordNum: recordNum++, companyTaxId, primaryId }));
  counts['A100']++;

  // Doc types to generate: 305 (sales inv), 400 (receipt), 320 (inv-receipt), 330 (credit)
  const docTypes = [
    { code: '305', name: 'Sample Customer', hasD110: true, hasD120: false },
    { code: '400', name: 'Receipt Customer', hasD110: false, hasD120: true },
    { code: '320', name: 'InvReceipt Cust', hasD110: true, hasD120: true },
    { code: '330', name: 'Credit Customer', hasD110: true, hasD120: false },
  ];

  // Generate ~500 documents with 3 lines each = ~2000+ records
  for (let docIdx = 0; docIdx < 500; docIdx++) {
    const dt = docTypes[docIdx % docTypes.length];
    const docNum = String(docIdx + 1).padStart(8, '0');
    const month = String((docIdx % 12) + 1).padStart(2, '0');
    const day = String((docIdx % 28) + 1).padStart(2, '0');
    const docDate = `2024${month}${day}`;
    const amount = 100 + (docIdx * 7) % 9900;
    const vatAmount = Math.round(amount * 0.17);
    const totalAmount = amount + vatAmount;

    // C100
    records.push(buildC100({
      recordNum: recordNum++,
      companyTaxId,
      docTypeCode: dt.code,
      docNumber: docNum,
      docDate: `2024-${month}-${day}`,
      customerName: `${dt.name} ${docIdx + 1}`,
      customerAddress: 'רחוב הדוגמה 1',
      city: 'תל אביב',
      netAmount: amount,
      vatAmount,
      totalAmount,
      cancelled: false,
    }));
    counts['C100']++;

    // D110 lines
    if (dt.hasD110) {
      for (let lineIdx = 1; lineIdx <= 3; lineIdx++) {
        const lineAmount = Math.round(amount / 3);
        records.push(buildD110({
          recordNum: recordNum++,
          companyTaxId,
          docTypeCode: dt.code,
          docNumber: docNum,
          lineNum: lineIdx,
          description: `פריט דוגמה ${lineIdx}`,
          quantity: lineIdx,
          unitPrice: lineAmount,
          lineTotal: lineAmount * lineIdx,
          vatRate: 17,
          invoiceDate: `2024-${month}-${day}`,
        }));
        counts['D110']++;
      }
    }

    // D120 payment lines
    if (dt.hasD120) {
      records.push(buildD120({
        recordNum: recordNum++,
        companyTaxId,
        docTypeCode: dt.code,
        docNumber: docNum,
        paymentNum: 1,
        paymentTypeCode: '1',
        amount: totalAmount,
        receiptDate: `2024-${month}-${day}`,
      }));
      counts['D120']++;
    }
  }

  // Z900 closing
  const totalRecords = records.length + 1;
  records.push(buildZ900({
    recordNum: recordNum++,
    companyTaxId,
    primaryId,
    totalRecords,
  }));
  counts['Z900']++;

  return { records, counts };
}

// =============================================
// VALIDATION ENGINE
// =============================================

interface ValidationResult {
  check: string;
  passed: boolean;
  detail?: string;
  category?: 'blocking' | 'warning';
}

export function runValidations(params: {
  records: string[];
  primaryId: string;
  closingTotalCount: number;
  bkmvContent: string;
  iniContent: string;
  iniRecordCounts: Record<string, number>;
  hasComplianceConfig?: boolean;
  hasMappings?: boolean;
  unmappedTypes?: string[];
  encoding?: string;
}): { results: ValidationResult[]; allPassed: boolean; fatalError?: string; warnings: string[]; blockers: string[] } {
  const { records, primaryId, closingTotalCount, bkmvContent, iniContent } = params;
  const results: ValidationResult[] = [];
  const warnings: string[] = [];
  const blockers: string[] = [];
  let fatalError: string | undefined;

  // 1. Record length validation
  let allLengthsValid = true;
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const typeCode = rec.slice(0, 4);
    const expected = RECORD_LENGTHS[typeCode];
    if (expected) {
      if (rec.length !== expected) {
        allLengthsValid = false;
        fatalError = `Record ${i + 1} (${typeCode}): expected ${expected} chars, got ${rec.length}`;
        results.push({ check: `אורך רשומה ${i + 1} (${typeCode})`, passed: false, detail: `צפוי ${expected}, קיבלנו ${rec.length}`, category: 'blocking' });
        blockers.push(fatalError);
      }
    }
  }
  results.push({ check: 'כל הרשומות באורך הנכון', passed: allLengthsValid, category: 'blocking' });

  // 2. CRLF validation
  const crlfValid = bkmvContent.includes('\r\n') && !bkmvContent.match(/[^\r]\n/);
  const iniCrlfValid = iniContent.includes('\r\n') && !iniContent.match(/[^\r]\n/);
  results.push({ check: 'CRLF ב-BKMVDATA.TXT', passed: crlfValid, category: 'blocking' });
  results.push({ check: 'CRLF ב-INI.TXT', passed: iniCrlfValid, category: 'blocking' });

  // 3. INI starts with A000
  results.push({ check: 'INI.TXT מתחיל ב-A000', passed: iniContent.startsWith('A000'), category: 'blocking' });

  // 4. INI no BOM
  const iniBom = iniContent.charCodeAt(0) === 0xFEFF || iniContent.startsWith('\xEF\xBB\xBF');
  results.push({ check: 'INI.TXT ללא BOM', passed: !iniBom, category: 'blocking' });

  // 5. INI record length
  const iniLine = iniContent.replace(/\r\n$/, '');
  results.push({ check: `INI.TXT אורך רשומה (${A000_LEN})`, passed: iniLine.length === A000_LEN, detail: `בפועל: ${iniLine.length}`, category: 'blocking' });

  // 6. A100 first, Z900 last in BKMVDATA
  const firstType = records[0]?.slice(0, 4);
  const lastType = records[records.length - 1]?.slice(0, 4);
  results.push({ check: 'BKMVDATA מתחיל ב-A100', passed: firstType === 'A100', category: 'blocking' });
  results.push({ check: 'BKMVDATA מסתיים ב-Z900', passed: lastType === 'Z900', category: 'blocking' });

  // 7. &OF1.31& constant in A100 and Z900
  const a100Const = records[0]?.slice(37, 45);
  const z900Const = records[records.length - 1]?.slice(37, 45);
  results.push({ check: 'A100 מכיל &OF1.31&', passed: a100Const === SPEC_CONSTANT, detail: `ערך: "${a100Const}"`, category: 'blocking' });
  results.push({ check: 'Z900 מכיל &OF1.31&', passed: z900Const === SPEC_CONSTANT, detail: `ערך: "${z900Const}"`, category: 'blocking' });

  // 8. INI contains &OF1.31&
  const iniConst = iniLine.slice(48, 56);
  results.push({ check: 'INI מכיל &OF1.31&', passed: iniConst === SPEC_CONSTANT, detail: `ערך: "${iniConst}"`, category: 'blocking' });

  // 9. Sequential record numbering
  let seqValid = true;
  for (let i = 0; i < records.length; i++) {
    const num = parseInt(records[i].slice(4, 13), 10);
    if (num !== i + 1) {
      seqValid = false;
      break;
    }
  }
  results.push({ check: 'מספור רשומות רציף', passed: seqValid, category: 'blocking' });

  // 10. Z900 closing count matches actual
  const actualTotal = records.length;
  results.push({ check: 'Z900 ספירה תואמת', passed: closingTotalCount === actualTotal, detail: `Z900: ${closingTotalCount}, בפועל: ${actualTotal}`, category: 'blocking' });

  // 11. INI total count matches actual BKMVDATA records
  const iniTotalStr = iniLine.slice(9, 24);
  const iniTotal = parseInt(iniTotalStr, 10);
  results.push({ check: 'INI ספירת רשומות תואמת', passed: iniTotal === actualTotal, detail: `INI: ${iniTotal}, בפועל: ${actualTotal}`, category: 'blocking' });

  // 12. INI per-type counters match
  const actualCounts: Record<string, number> = {};
  for (const rec of records) {
    const t = rec.slice(0, 4);
    actualCounts[t] = (actualCounts[t] || 0) + 1;
  }
  for (const type of ['C100', 'D110', 'D120']) {
    const iniCount = params.iniRecordCounts[type] || 0;
    const actual = actualCounts[type] || 0;
    results.push({ check: `INI ספירת ${type} תואמת`, passed: iniCount === actual, detail: `INI: ${iniCount}, בפועל: ${actual}`, category: 'blocking' });
  }

  // 13. Primary ID format
  const pidValid = /^\d{15}$/.test(primaryId);
  results.push({ check: 'Primary ID - 15 ספרות', passed: pidValid, category: 'blocking' });

  // 14. Tax ID in all records
  const companyTaxId = records[0]?.slice(13, 22);
  const allSameTaxId = records.every(r => r.slice(13, 22) === companyTaxId);
  results.push({ check: 'עקביות מספר עוסק', passed: allSameTaxId, category: 'blocking' });

  // Warnings
  if (params.hasComplianceConfig !== undefined) {
    results.push({ check: 'הגדרות ציות', passed: params.hasComplianceConfig!, category: 'warning' });
    if (!params.hasComplianceConfig) warnings.push('חסרות הגדרות ציות');
  }
  if (params.hasMappings !== undefined) {
    results.push({ check: 'מיפוי מסמכים', passed: params.hasMappings!, detail: params.unmappedTypes?.length ? `חסרים: ${params.unmappedTypes.join(', ')}` : undefined, category: 'warning' });
    if (!params.hasMappings) warnings.push('מיפוי חסר: ' + (params.unmappedTypes || []).join(', '));
  }
  if (params.encoding) {
    const ok = params.encoding !== 'UTF-8';
    results.push({ check: 'קידוד תואם', passed: ok, detail: params.encoding, category: ok ? 'warning' : 'blocking' });
    if (!ok) blockers.push('UTF-8 לא תואם');
  }

  const allPassed = results.every(r => r.passed);
  return { results, allPassed, fatalError, warnings, blockers };
}

// =============================================
// DEBUG MANIFEST
// =============================================

function buildDebugManifest(params: {
  exportRunId: string;
  primaryId: string;
  logicalPath: string;
  encoding: string;
  recordCounts: Record<string, number>;
  validationResults: ValidationResult[];
  warnings: string[];
  blockers: string[];
  documentIds: string[];
  docTypeMappingsUsed: Record<string, string>;
  artifacts: Array<{ filename: string; byteSize: number }>;
  complianceConfig: Record<string, unknown> | null;
  isSample?: boolean;
  firstRecordCode?: string;
  lastRecordCode?: string;
}): string {
  return JSON.stringify({
    _format: 'open_format_debug_manifest_v2',
    generated_at: new Date().toISOString(),
    export_run_id: params.exportRunId,
    primary_id_15: params.primaryId,
    logical_output_path: params.logicalPath,
    encoding_used: params.encoding,
    is_sample_mode: params.isSample || false,
    record_counts: params.recordCounts,
    first_record_code: params.firstRecordCode,
    last_record_code: params.lastRecordCode,
    validation_results: params.validationResults.map(r => ({ check: r.check, passed: r.passed, detail: r.detail, category: r.category })),
    warnings: params.warnings,
    blockers: params.blockers,
    documents_included: params.documentIds,
    doc_type_mappings_used: params.docTypeMappingsUsed,
    artifacts: params.artifacts,
    spec_version: '1.31',
    record_lengths: { A000: A000_LEN, A100: A100_LEN, C100: C100_LEN, D110: D110_LEN, D120: D120_LEN, Z900: Z900_LEN },
  }, null, 2);
}

// =============================================
// ZIP BUILDER
// =============================================

function createZipArchive(files: Array<{ name: string; content: Uint8Array }>): Uint8Array {
  const entries: Array<{ name: Uint8Array; content: Uint8Array; offset: number; crc: number }> = [];
  const chunks: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(file.content);
    entries.push({ name: nameBytes, content: file.content, offset, crc });

    const header = new Uint8Array(30 + nameBytes.length);
    const hv = new DataView(header.buffer);
    hv.setUint32(0, 0x04034b50, true);
    hv.setUint16(4, 20, true);
    hv.setUint16(8, 0, true);
    hv.setUint32(14, crc, true);
    hv.setUint32(18, file.content.length, true);
    hv.setUint32(22, file.content.length, true);
    hv.setUint16(26, nameBytes.length, true);
    header.set(nameBytes, 30);

    chunks.push(header);
    chunks.push(file.content);
    offset += header.length + file.content.length;
  }

  const cdStart = offset;
  for (const entry of entries) {
    const cd = new Uint8Array(46 + entry.name.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint32(16, entry.crc, true);
    cv.setUint32(20, entry.content.length, true);
    cv.setUint32(24, entry.content.length, true);
    cv.setUint16(28, entry.name.length, true);
    cv.setUint32(42, entry.offset, true);
    cd.set(entry.name, 46);
    chunks.push(cd);
    offset += cd.length;
  }

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, offset - cdStart, true);
  ev.setUint32(16, cdStart, true);
  chunks.push(eocd);

  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const c of chunks) { result.set(c, pos); pos += c.length; }
  return result;
}

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// =============================================
// ENCODING
// =============================================

function encodeToISO8859_8(text: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x80) bytes.push(code);
    else if (code >= 0x05D0 && code <= 0x05EA) bytes.push(code - 0x05D0 + 0xE0);
    else if (code === 0x00A0) bytes.push(0xA0);
    else bytes.push(0x3F);
  }
  return new Uint8Array(bytes);
}

function encodeContent(text: string, encoding: string): Uint8Array {
  if (encoding === 'UTF-8') return new TextEncoder().encode(text);
  return encodeToISO8859_8(text);
}

// =============================================
// MAIN HANDLER
// =============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { mode, taxYear, startDate, endDate, sampleMode } = body;

    if (!sampleMode) {
      if (mode === 'single_year' && !taxYear) {
        return new Response(JSON.stringify({ success: false, error: 'Tax year required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (mode === 'multi_year' && (!startDate || !endDate)) {
        return new Response(JSON.stringify({ success: false, error: 'Dates required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    const runStarted = new Date();
    const primaryId = generate15DigitId();
    const effectiveTaxYear = sampleMode ? 2024 : (taxYear || new Date(startDate).getFullYear());

    // Profile
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
    const companyTaxId = (profile?.company_hp ?? '').replace(/\D/g, '').padStart(9, '0');
    const companyName = profile?.company_name ?? 'Sample Company';
    const companyAddress = profile?.company_address ?? '';

    // Compliance config
    const { data: config } = await supabaseAdmin.from('open_format_compliance_config').select('*').eq('user_id', user.id).single();
    const hasComplianceConfig = !!config;
    const encoding = config?.default_encoding || 'ISO-8859-8';
    const softwareName = config?.software_name || 'CarsLead';
    const softwareVersion = config?.software_version || '1.0';
    const softwareRegNum = config?.software_registration_number || '';
    const vendorTaxId = (config?.software_vendor_tax_id || '').replace(/\D/g, '');
    const vendorName = config?.software_vendor_name || 'CarsLead Ltd';
    const branchesEnabled = config?.branches_enabled || false;

    // Date range
    let queryStart: string;
    let queryEnd: string;
    if (sampleMode) {
      queryStart = '2024-01-01';
      queryEnd = '2024-12-31';
    } else if (mode === 'single_year') {
      queryStart = `${taxYear}-01-01`;
      queryEnd = `${taxYear}-12-31`;
    } else {
      queryStart = startDate;
      queryEnd = endDate;
    }

    // Logical path
    const basePath = generateLogicalPath(companyTaxId, effectiveTaxYear, runStarted);
    const { data: existingRuns } = await supabaseAdmin.from('open_format_export_runs').select('logical_output_path').eq('user_id', user.id);
    const existingPaths = (existingRuns || []).map((r: any) => r.logical_output_path);
    const logicalPath = resolveLogicalPathCollision(basePath, existingPaths);

    // Create export run
    const { data: exportRun, error: runError } = await supabaseAdmin
      .from('open_format_export_runs')
      .insert({
        user_id: user.id,
        mode: sampleMode ? 'sample' : mode,
        tax_year: sampleMode ? 2024 : (mode === 'single_year' ? taxYear : null),
        start_date: sampleMode ? '2024-01-01' : (mode === 'multi_year' ? startDate : null),
        end_date: sampleMode ? '2024-12-31' : (mode === 'multi_year' ? endDate : null),
        primary_id_15: primaryId,
        logical_output_path: logicalPath,
        encoding_used: encoding,
        status: 'pending',
        started_at: runStarted.toISOString(),
      })
      .select()
      .single();

    if (runError) throw runError;

    // =============================================
    // BUILD RECORDS
    // =============================================

    let records: string[];
    let counts: Record<string, number>;
    const documentIds: string[] = [];
    const unmappedTypes: string[] = [];
    const exportWarnings: string[] = [];
    const docTypeMappingsUsed: Record<string, string> = {};

    if (sampleMode) {
      // SAMPLE MODE: synthetic data
      const sample = generateSampleRecords(primaryId, companyTaxId);
      records = sample.records;
      counts = sample.counts;
      exportWarnings.push('מצב הדגמה - נתונים סינתטיים בלבד');
    } else {
      // REAL MODE
      records = [];
      let recordNum = 1;
      counts = { 'A100': 0, 'C100': 0, 'D110': 0, 'D120': 0, 'B100': 0, 'B110': 0, 'M100': 0, 'Z900': 0, 'A000': 0 };

      // Doc type mappings
      const { data: dbMappings } = await supabaseAdmin.from('open_format_doc_type_mappings').select('*').eq('user_id', user.id);
      const docTypeMappings: Record<string, string> = { ...DEFAULT_DOC_TYPE_CODES };
      const disabledTypes = new Set<string>();
      if (dbMappings && dbMappings.length > 0) {
        for (const m of dbMappings) {
          if (m.enabled) docTypeMappings[m.internal_type] = m.tax_authority_code;
          else disabledTypes.add(m.internal_type);
        }
      }

      // A100
      records.push(buildA100({ recordNum: recordNum++, companyTaxId, primaryId }));
      counts['A100']++;

      // Tax invoices
      const { data: taxInvoices } = await supabaseAdmin
        .from('tax_invoices')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', queryStart)
        .lte('date', queryEnd)
        .order('date', { ascending: true });

      for (const inv of (taxInvoices || [])) {
        const internalType = 'tax-invoice';
        if (disabledTypes.has(internalType)) continue;
        const docTypeCode = docTypeMappings[internalType];
        if (!docTypeCode || docTypeCode === '000') {
          if (!unmappedTypes.includes(internalType)) unmappedTypes.push(internalType);
          continue;
        }
        docTypeMappingsUsed[internalType] = docTypeCode;
        documentIds.push(inv.id);

        const vatRate = (inv.subtotal && inv.subtotal > 0) ? ((inv.vat_amount || 0) / inv.subtotal) * 100 : 17;

        records.push(buildC100({
          recordNum: recordNum++,
          companyTaxId,
          docTypeCode,
          docNumber: inv.invoice_number || '',
          docDate: inv.date,
          customerName: inv.customer_name || '',
          customerTaxId: (inv.customer_hp || '').replace(/\D/g, ''),
          customerAddress: inv.customer_address || '',
          netAmount: inv.subtotal || 0,
          vatAmount: inv.vat_amount || 0,
          totalAmount: inv.total_amount || 0,
          cancelled: false,
        }));
        counts['C100']++;

        const items = Array.isArray(inv.items) ? inv.items : [];
        let lineNum = 1;
        for (const item of items) {
          const itemVatRate = (item as any).vatRate ?? (item as any).vat_rate ?? vatRate;
          records.push(buildD110({
            recordNum: recordNum++,
            companyTaxId,
            docTypeCode,
            docNumber: inv.invoice_number || '',
            lineNum: lineNum++,
            description: (item as any).description || '',
            catalogCode: (item as any).catalogCode || (item as any).catalog_code || '',
            quantity: Number((item as any).quantity) || 1,
            unitPrice: Number((item as any).unitPrice || (item as any).price) || 0,
            lineTotal: Number((item as any).total || (item as any).amount) || 0,
            vatRate: Number(itemVatRate),
            invoiceDate: inv.date,
          }));
          counts['D110']++;
        }
      }

      // Customer documents (receipts)
      const { data: customerDocs } = await supabaseAdmin
        .from('customer_documents')
        .select('*, customers!customer_documents_customer_id_fkey(full_name, id_number, address)')
        .eq('user_id', user.id)
        .gte('date', queryStart)
        .lte('date', queryEnd)
        .order('date', { ascending: true });

      const { data: payments } = await supabaseAdmin
        .from('customer_payments')
        .select('*')
        .eq('user_id', user.id)
        .gte('payment_date', queryStart)
        .lte('payment_date', queryEnd);

      const paymentsByDocId: Record<string, any[]> = {};
      for (const pay of (payments || [])) {
        if (pay.document_id) {
          if (!paymentsByDocId[pay.document_id]) paymentsByDocId[pay.document_id] = [];
          paymentsByDocId[pay.document_id].push(pay);
        }
      }

      // Also process non-receipt customer docs (contracts etc)
      for (const doc of (customerDocs || [])) {
        if (disabledTypes.has(doc.type)) continue;
        const docTypeCode = docTypeMappings[doc.type];
        if (!docTypeCode || docTypeCode === '000') {
          if (!unmappedTypes.includes(doc.type)) unmappedTypes.push(doc.type);
          exportWarnings.push(`סוג מסמך '${doc.type}' ללא מיפוי - דילוג`);
          continue;
        }
        docTypeMappingsUsed[doc.type] = docTypeCode;
        documentIds.push(doc.id);

        const customer = (doc as any).customers;
        const customerName = customer?.full_name || '';
        const customerTaxId = (customer?.id_number || '').replace(/\D/g, '');
        const customerAddress = customer?.address || '';

        records.push(buildC100({
          recordNum: recordNum++,
          companyTaxId,
          docTypeCode,
          docNumber: doc.document_number || '',
          docDate: doc.date || '',
          customerName,
          customerTaxId,
          customerAddress,
          netAmount: doc.amount || 0,
          vatAmount: 0,
          totalAmount: doc.amount || 0,
          cancelled: doc.status === 'cancelled',
        }));
        counts['C100']++;

        // D120 for receipt-type docs
        if (doc.type === 'receipt' || doc.type === 'tax-invoice-receipt') {
          const linked = paymentsByDocId[doc.id];
          if (linked && linked.length > 0) {
            let payNum = 1;
            for (const pay of linked) {
              records.push(buildD120({
                recordNum: recordNum++,
                companyTaxId,
                docTypeCode,
                docNumber: doc.document_number || '',
                paymentNum: payNum++,
                paymentTypeCode: paymentTypeCode(pay.payment_method || 'other'),
                amount: pay.amount || 0,
                receiptDate: pay.payment_date || doc.date || '',
              }));
              counts['D120']++;
            }
          } else {
            records.push(buildD120({
              recordNum: recordNum++,
              companyTaxId,
              docTypeCode,
              docNumber: doc.document_number || '',
              paymentNum: 1,
              paymentTypeCode: '0',
              amount: doc.amount || 0,
              receiptDate: doc.date || '',
            }));
            counts['D120']++;
          }
        }
      }

      // Z900
      const totalRecords = records.length + 1;
      records.push(buildZ900({
        recordNum: recordNum++,
        companyTaxId,
        primaryId,
        totalRecords,
      }));
      counts['Z900']++;
    }

    // =============================================
    // BUILD FILES
    // =============================================

    const bkmvContent = records.map(r => appendCRLF(r)).join('');
    const actualTotal = records.length;
    counts['A000'] = 1;

    // Count per type for INI
    const typeCounts: Record<string, number> = {};
    for (const rec of records) {
      const t = rec.slice(0, 4);
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }

    const iniRecordCounts = {
      B100: typeCounts['B100'] || 0,
      B110: typeCounts['B110'] || 0,
      C100: typeCounts['C100'] || 0,
      D110: typeCounts['D110'] || 0,
      D120: typeCounts['D120'] || 0,
      M100: typeCounts['M100'] || 0,
    };

    const a000Line = buildA000({
      primaryId,
      companyTaxId,
      companyName,
      companyAddress,
      companyCity: '',
      companyZip: '',
      taxYear: effectiveTaxYear,
      startDate: queryStart,
      endDate: queryEnd,
      processDate: runStarted,
      totalBkmvRecords: actualTotal,
      softwareRegNum,
      softwareName,
      softwareVersion,
      vendorTaxId,
      vendorName,
      encoding,
      branchesEnabled,
      counts: iniRecordCounts,
    });
    const iniContent = appendCRLF(a000Line);

    // =============================================
    // VALIDATION
    // =============================================

    const validation = runValidations({
      records,
      primaryId,
      closingTotalCount: actualTotal,
      bkmvContent,
      iniContent,
      iniRecordCounts,
      hasComplianceConfig,
      hasMappings: unmappedTypes.length === 0,
      unmappedTypes,
      encoding,
    });
    validation.warnings.push(...exportWarnings);

    if (validation.fatalError) {
      await supabaseAdmin.from('open_format_export_runs')
        .update({ status: 'failed', finished_at: new Date().toISOString(), error_message: validation.fatalError })
        .eq('id', exportRun.id);
    }

    // =============================================
    // ENCODE & PACKAGE
    // =============================================

    const bkmvBytes = encodeContent(bkmvContent, encoding);
    const iniBytes = encodeContent(iniContent, encoding);

    const artifactsList = [
      { filename: 'INI.TXT', byteSize: iniBytes.length },
      { filename: 'BKMVDATA.TXT', byteSize: bkmvBytes.length },
    ];

    const manifestJson = buildDebugManifest({
      exportRunId: exportRun.id,
      primaryId,
      logicalPath,
      encoding,
      recordCounts: counts,
      validationResults: validation.results,
      warnings: validation.warnings,
      blockers: validation.blockers,
      documentIds,
      docTypeMappingsUsed,
      artifacts: artifactsList,
      complianceConfig: config,
      isSample: !!sampleMode,
      firstRecordCode: records[0]?.slice(0, 4),
      lastRecordCode: records[records.length - 1]?.slice(0, 4),
    });
    const manifestBytes = new TextEncoder().encode(manifestJson);

    const zipBytes = createZipArchive([
      { name: 'BKMVDATA.TXT', content: bkmvBytes },
      { name: 'INI.TXT', content: iniBytes },
    ]);

    // =============================================
    // UPLOAD
    // =============================================

    const storagePath = `${user.id}/${exportRun.id}`;

    await supabaseAdmin.storage.from('open-format-exports').upload(`${storagePath}/INI.TXT`, iniBytes, { contentType: 'text/plain', upsert: true });
    await supabaseAdmin.storage.from('open-format-exports').upload(`${storagePath}/BKMVDATA.TXT`, bkmvBytes, { contentType: 'text/plain', upsert: true });
    const { error: zipErr } = await supabaseAdmin.storage.from('open-format-exports').upload(`${storagePath}/BKMVDATA.zip`, zipBytes, { contentType: 'application/zip', upsert: true });
    await supabaseAdmin.storage.from('open-format-exports').upload(`${storagePath}/export_debug_manifest.json`, manifestBytes, { contentType: 'application/json', upsert: true });

    // =============================================
    // PERSIST METADATA
    // =============================================

    const countInserts = Object.entries(counts).map(([code, cnt]) => ({
      export_run_id: exportRun.id,
      record_type_code: code,
      count: cnt,
    }));
    await supabaseAdmin.from('open_format_record_counts').insert(countInserts);

    const artifacts = [
      { artifact_type: 'INI', filename: 'INI.TXT', storage_path: `${storagePath}/INI.TXT`, byte_size: iniBytes.length },
      { artifact_type: 'BKMVDATA', filename: 'BKMVDATA.TXT', storage_path: `${storagePath}/BKMVDATA.TXT`, byte_size: bkmvBytes.length },
      { artifact_type: 'ZIP', filename: 'BKMVDATA.zip', storage_path: `${storagePath}/BKMVDATA.zip`, byte_size: zipBytes.length },
      { artifact_type: 'DEBUG_MANIFEST', filename: 'export_debug_manifest.json', storage_path: `${storagePath}/export_debug_manifest.json`, byte_size: manifestBytes.length },
    ].map(a => ({ ...a, export_run_id: exportRun.id }));
    await supabaseAdmin.from('open_format_artifacts').insert(artifacts);

    const allPassed = validation.results.every(v => v.passed) && !zipErr;
    await supabaseAdmin.from('open_format_export_runs')
      .update({
        status: allPassed ? 'success' : 'failed',
        finished_at: new Date().toISOString(),
        error_message: allPassed ? null : (validation.fatalError || 'בדיקות ולידציה נכשלו'),
      })
      .eq('id', exportRun.id);

    return new Response(JSON.stringify({
      success: true,
      exportRunId: exportRun.id,
      primaryId,
      logicalPath,
      encoding,
      startedAt: runStarted.toISOString(),
      finishedAt: new Date().toISOString(),
      status: allPassed ? 'success' : 'failed',
      recordCounts: counts,
      validationResults: validation.results,
      warnings: validation.warnings,
      blockers: validation.blockers,
      isSample: !!sampleMode,
      artifacts: artifacts.map(a => ({
        type: a.artifact_type,
        filename: a.filename,
        storagePath: a.storage_path,
        byteSize: a.byte_size,
      })),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Open Format export error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message || 'An unexpected error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
