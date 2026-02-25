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
  const num = value ?? 0;
  const sign = num >= 0 ? '+' : '-';
  const agorot = Math.abs(Math.round(num * 100));
  const digits = String(agorot);
  const fieldLen = length - 1;
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
// =============================================

const SPEC_CONSTANT = '&OF1.31&';

// A100 — Opening record — 95 chars
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

// C100 — Document header — 444 chars
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
    padRight('C100', 4),
    padLeft(p.recordNum, 9),
    padRight(p.companyTaxId, 9),
    padRight(p.docTypeCode, 3),
    padRight(p.docNumber, 20),
    fmtDate(p.docDate),
    padRight(p.docTime || '0000', 4),
    padRight(p.customerName, 50),
    padRight(p.customerAddress || '', 50),
    padRight(p.houseNumber || '', 10),
    padRight(p.city || '', 30),
    padRight(p.zipCode || '', 8),
    padRight(p.state || '', 30),
    padRight(p.stateCode || '', 2),
    padRight(p.phone || '', 15),
    padRight(p.customerTaxId || '', 9),
    fmtDate(p.glDate || p.docDate),
    fmtSignedAmount(p.nonIlsAmount ?? 0, 15),
    padRight(p.nonIlsCurrency || 'ILS', 3),
    fmtSignedAmount(net, 15),
    fmtSignedAmount(disc, 15),
    fmtSignedAmount(netPlusDisc, 15),
    fmtSignedAmount(p.vatAmount, 15),
    fmtSignedAmount(p.totalAmount, 15),
    fmtSignedAmount(p.withholdingAmount ?? 0, 12),
    padRight(p.accountNumber || '', 15),
    padRight('', 10),
    padRight(p.cancelled ? '1' : '0', 1),
    fmtDate(p.invoiceDate || p.docDate),
    padRight('', 7),
    padRight(p.userId || '', 9),
    padRight(p.internalId || '', 7),
    padRight('', 13),
  ].join('');
}
export const C100_LEN = 444;

// D110 — Document detail line — 339 chars
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
  const qtySign = p.quantity >= 0 ? '+' : '-';
  const qtyAbs = Math.abs(Math.round(p.quantity * 10000));
  const qtyStr = qtySign + String(qtyAbs).padStart(16, '0');

  return [
    padRight('D110', 4),
    padLeft(p.recordNum, 9),
    padRight(p.companyTaxId, 9),
    padRight(p.docTypeCode, 3),
    padRight(p.docNumber, 20),
    padLeft(p.lineNum, 4),
    padRight(p.docTypeCode, 3),
    padRight(p.docNumber, 20),
    padRight('', 1),
    padRight(p.catalogCode || '999999', 20),
    padRight(p.description || 'Description', 30),
    padRight('', 50),
    padRight('', 30),
    padRight('', 20),
    qtyStr.length > 17 ? qtyStr.slice(0, 17) : qtyStr.padStart(17, '0'),
    fmtSignedAmount(p.unitPrice, 15),
    fmtSignedAmount(p.discountAmount ?? 0, 15),
    fmtSignedAmount(p.lineTotal, 15),
    padLeft(Math.round(p.vatRate), 4),
    padRight('', 7),
    fmtDate(p.invoiceDate),
    padRight(p.internalId || '', 7),
    padRight('999999', 7),
    padRight('999999', 21),
  ].join('');
}
export const D110_LEN = 339;

// D120 — Payment detail line — 222 chars
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
    padRight('D120', 4),
    padLeft(p.recordNum, 9),
    padRight(p.companyTaxId, 9),
    padRight(p.docTypeCode, 3),
    padRight(p.docNumber, 20),
    padLeft(p.paymentNum, 4),
    padRight(p.paymentTypeCode || '0', 1),
    padRight(p.bankCode || '', 10),
    padRight(p.branchCode || '', 10),
    padRight(p.accountNum || '', 15),
    padRight(p.checkNum || '', 10),
    fmtDate(p.dueDate),
    fmtSignedAmount(p.amount, 15),
    padRight(p.creditClearing || '', 1),
    padRight(p.creditCardName || '', 20),
    padRight(p.creditDealType || '', 1),
    padRight('', 7),
    fmtDate(p.receiptDate),
    padRight(p.receiptId || '', 7),
    padRight('', 60),
  ].join('');
}
export const D120_LEN = 222;

// B110 — Account balance card — 376 chars (OF1.31)
// Pos 0-3: Record Code (4)
// Pos 4-12: Record Number (9)
// Pos 13-21: Tax ID (9)
// Pos 22-36: Account Value (15)
// Pos 37-86: Account Description (50)
// Pos 87-101: Opening Balance (15) signed
// Pos 102-116: Non-ILS Opening Balance (15) signed
// Pos 117-131: Debit Turnover (15) signed
// Pos 132-146: Non-ILS Debit Turnover (15) signed
// Pos 147-161: Credit Turnover (15) signed
// Pos 162-176: Non-ILS Credit Turnover (15) signed
// Pos 177-191: Closing Balance (15) signed – calculated: opening + debit - credit
// Pos 192-206: Non-ILS Closing Balance (15) signed
// Pos 207-221: Balance Indicator (15) signed
// Pos 222-321: Future Use (100)
// Pos 322-325: Accounting Classification (4)
// Pos 326-334: Customer/Supplier Tax ID (9)
// Pos 335-341: Branch ID (7)
// Pos 342-356: Future (15)
// Pos 357-359: Currency Code (3)
// Pos 360-375: Future (16)
export function buildB110(p: {
  recordNum: number;
  companyTaxId: string;
  accountValue: string;
  accountDescription: string;
  openingBalance: number;
  debitTurnover: number;
  creditTurnover: number;
  closingBalance: number;
  customerTaxId?: string;
}): string {
  return [
    padRight('B110', 4),              // 0-3
    padLeft(p.recordNum, 9),           // 4-12
    padRight(p.companyTaxId, 9),       // 13-21
    padRight(p.accountValue, 15),      // 22-36
    padRight(p.accountDescription, 50),// 37-86
    fmtSignedAmount(p.openingBalance, 15),   // 87-101
    fmtSignedAmount(0, 15),            // 102-116 non-ILS opening (ILS only = 0)
    fmtSignedAmount(p.debitTurnover, 15),    // 117-131
    fmtSignedAmount(0, 15),            // 132-146 non-ILS debit
    fmtSignedAmount(p.creditTurnover, 15),   // 147-161
    fmtSignedAmount(0, 15),            // 162-176 non-ILS credit
    fmtSignedAmount(p.closingBalance, 15),   // 177-191
    fmtSignedAmount(0, 15),            // 192-206 non-ILS closing
    fmtSignedAmount(0, 15),            // 207-221 balance indicator
    padRight('', 100),                 // 222-321 future
    padRight('', 4),                   // 322-325 accounting classification
    padRight(p.customerTaxId || '', 9),// 326-334
    padRight('', 7),                   // 335-341 branch
    padRight('', 15),                  // 342-356 future
    padRight('ILS', 3),                // 357-359
    padRight('', 16),                  // 360-375 future
  ].join('');
}
export const B110_LEN = 376;

// Z900 — Closing record — 110 chars
export function buildZ900(p: {
  recordNum: number;
  companyTaxId: string;
  primaryId: string;
  totalRecords: number;
}): string {
  return [
    padRight('Z900', 4),
    padLeft(p.recordNum, 9),
    padRight(p.companyTaxId, 9),
    padRight(p.primaryId, 15),
    padRight(SPEC_CONSTANT, 8),
    padLeft(p.totalRecords, 15),
    padRight('', 50),
  ].join('');
}
export const Z900_LEN = 110;

// A000 — INI record — 580 chars
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
    padRight('A000', 4),
    padRight('', 5),
    padLeft(p.totalBkmvRecords, 15),
    padRight(p.companyTaxId, 9),
    padRight(p.primaryId, 15),
    padRight(SPEC_CONSTANT, 8),
    padRight(p.softwareRegNum, 8),
    padRight(p.softwareName, 20),
    padRight(p.softwareVersion, 20),
    padRight(p.vendorTaxId, 9),
    padRight(p.vendorName, 20),
    padRight('2', 1),
    padRight('', 50),
    padRight('2', 1),
    padRight('1', 1),
    padRight(p.companyTaxId, 9),
    padRight(p.companyTaxId, 9),
    padRight('', 10),
    padRight(p.companyName, 50),
    padRight(p.companyAddress || '', 50),
    padRight('', 10),
    padRight(p.companyCity || '', 30),
    padRight(p.companyZip || '', 8),
    padLeft(p.taxYear, 4),
    fmtDate(p.startDate),
    fmtDate(p.endDate),
    fmtDate(p.processDate),
    fmtTime(p.processDate),
    padRight('0', 1),
    padRight(charSet, 1),
    padRight('Winzip', 20),
    padRight('ILS', 3),
    padRight(p.branchesEnabled ? '1' : '0', 1),
    padRight('', 46),
    'B100' + padLeft(p.counts.B100, 15),
    'B110' + padLeft(p.counts.B110, 15),
    'C100' + padLeft(p.counts.C100, 15),
    'D110' + padLeft(p.counts.D110, 15),
    'D120' + padLeft(p.counts.D120, 15),
    'M100' + padLeft(p.counts.M100, 15),
  ].join('');
}
export const A000_LEN = 580;

// Record length map for validation
export const RECORD_LENGTHS: Record<string, number> = {
  'A100': A100_LEN,
  'B110': B110_LEN,
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
  const [, prefix, _MMDD, hh, mm] = match;
  let newMm = parseInt(mm, 10);
  let newHh = parseInt(hh, 10);
  for (let i = 0; i < 60; i++) {
    newMm++;
    if (newMm >= 60) { newMm = 0; newHh = (newHh + 1) % 24; }
    const candidate = `${prefix}${_MMDD}${String(newHh).padStart(2, '0')}${String(newMm).padStart(2, '0')}/`;
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
// ACCOUNT BALANCE TRACKER (for B110)
// =============================================

interface AccountBalance {
  accountValue: string;
  accountDescription: string;
  customerTaxId: string;
  debitTotal: number;
  creditTotal: number;
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

  // 7. &OF1.31& constant
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
    if (num !== i + 1) { seqValid = false; break; }
  }
  results.push({ check: 'מספור רשומות רציף', passed: seqValid, category: 'blocking' });

  // 10. Z900 closing count matches actual
  const actualTotal = records.length;
  results.push({ check: 'Z900 ספירה תואמת', passed: closingTotalCount === actualTotal, detail: `Z900: ${closingTotalCount}, בפועל: ${actualTotal}`, category: 'blocking' });

  // 11. INI total count matches
  const iniTotalStr = iniLine.slice(9, 24);
  const iniTotal = parseInt(iniTotalStr, 10);
  results.push({ check: 'INI ספירת רשומות תואמת', passed: iniTotal === actualTotal, detail: `INI: ${iniTotal}, בפועל: ${actualTotal}`, category: 'blocking' });

  // 12. INI per-type counters
  const actualCounts: Record<string, number> = {};
  for (const rec of records) {
    const t = rec.slice(0, 4);
    actualCounts[t] = (actualCounts[t] || 0) + 1;
  }
  for (const type of ['B110', 'C100', 'D110', 'D120']) {
    const iniCount = params.iniRecordCounts[type] || 0;
    const actual = actualCounts[type] || 0;
    results.push({ check: `INI ספירת ${type} תואמת`, passed: iniCount === actual, detail: `INI: ${iniCount}, בפועל: ${actual}`, category: 'blocking' });
  }

  // 13. Primary ID format
  const pidValid = /^\d{15}$/.test(primaryId);
  results.push({ check: 'Primary ID - 15 ספרות', passed: pidValid, category: 'blocking' });

  // 14. Tax ID consistency
  const companyTaxId = records[0]?.slice(13, 22);
  const allSameTaxId = records.every(r => r.slice(13, 22) === companyTaxId);
  results.push({ check: 'עקביות מספר עוסק', passed: allSameTaxId, category: 'blocking' });

  // 15. Every C100 must have at least one D110
  const c100DocNums = new Set<string>();
  const d110DocNums = new Set<string>();
  for (const rec of records) {
    const t = rec.slice(0, 4);
    if (t === 'C100') c100DocNums.add(rec.slice(25, 45));
    if (t === 'D110') d110DocNums.add(rec.slice(25, 45));
  }
  const c100WithoutD110: string[] = [];
  for (const dn of c100DocNums) {
    if (!d110DocNums.has(dn)) c100WithoutD110.push(dn.trim());
  }
  results.push({ check: 'כל C100 כולל D110', passed: c100WithoutD110.length === 0, detail: c100WithoutD110.length > 0 ? `חסר D110 ל: ${c100WithoutD110.slice(0,3).join(', ')}` : undefined, category: 'blocking' });

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
    record_lengths: { A000: A000_LEN, A100: A100_LEN, B110: B110_LEN, C100: C100_LEN, D110: D110_LEN, D120: D120_LEN, Z900: Z900_LEN },
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
    const { mode, taxYear, startDate, endDate } = body;

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

    const runStarted = new Date();
    const primaryId = generate15DigitId();
    const effectiveTaxYear = taxYear || new Date(startDate).getFullYear();

    // Profile
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
    const companyTaxId = (profile?.company_hp ?? '').replace(/\D/g, '');

    // *** PRE-EXPORT VALIDATION: company_hp must exist ***
    if (!companyTaxId || companyTaxId.length < 2) {
      return new Response(JSON.stringify({
        success: false,
        error: 'חסר מספר עוסק/ח.פ. בפרופיל החברה. יש להגדיר אותו לפני ייצוא.',
        preExportValidation: true,
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const companyTaxId9 = companyTaxId.padStart(9, '0');
    const companyName = profile?.company_name ?? '';
    const companyAddress = profile?.company_address ?? '';

    if (!companyName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'חסר שם חברה בפרופיל. יש להגדיר אותו לפני ייצוא.',
        preExportValidation: true,
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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
    if (mode === 'single_year') {
      queryStart = `${taxYear}-01-01`;
      queryEnd = `${taxYear}-12-31`;
    } else {
      queryStart = startDate;
      queryEnd = endDate;
    }

    // Logical path
    const basePath = generateLogicalPath(companyTaxId9, effectiveTaxYear, runStarted);
    const { data: existingRuns } = await supabaseAdmin.from('open_format_export_runs').select('logical_output_path').eq('user_id', user.id);
    const existingPaths = (existingRuns || []).map((r: any) => r.logical_output_path);
    const logicalPath = resolveLogicalPathCollision(basePath, existingPaths);

    // Create export run
    const { data: exportRun, error: runError } = await supabaseAdmin
      .from('open_format_export_runs')
      .insert({
        user_id: user.id,
        mode,
        tax_year: mode === 'single_year' ? taxYear : null,
        start_date: mode === 'multi_year' ? startDate : null,
        end_date: mode === 'multi_year' ? endDate : null,
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

    const records: string[] = [];
    let recordNum = 1;
    const counts: Record<string, number> = { 'A100': 0, 'B110': 0, 'C100': 0, 'D110': 0, 'D120': 0, 'B100': 0, 'M100': 0, 'Z900': 0, 'A000': 0 };
    const documentIds: string[] = [];
    const unmappedTypes: string[] = [];
    const exportWarnings: string[] = [];
    const docTypeMappingsUsed: Record<string, string> = {};

    // Account balance tracker for B110 records
    const accountBalances = new Map<string, AccountBalance>();

    function trackAccount(accountKey: string, description: string, customerTaxId: string, debit: number, credit: number) {
      const existing = accountBalances.get(accountKey);
      if (existing) {
        existing.debitTotal += debit;
        existing.creditTotal += credit;
      } else {
        accountBalances.set(accountKey, {
          accountValue: accountKey,
          accountDescription: description,
          customerTaxId,
          debitTotal: debit,
          creditTotal: credit,
        });
      }
    }

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

    // A100 opening record
    records.push(buildA100({ recordNum: recordNum++, companyTaxId: companyTaxId9, primaryId }));
    counts['A100']++;

    // =============================================
    // TAX INVOICES → C100 + D110
    // =============================================

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
      const customerTaxId = (inv.customer_hp || '').replace(/\D/g, '');

      records.push(buildC100({
        recordNum: recordNum++,
        companyTaxId: companyTaxId9,
        docTypeCode,
        docNumber: inv.invoice_number || '',
        docDate: inv.date,
        customerName: inv.customer_name || '',
        customerTaxId,
        customerAddress: inv.customer_address || '',
        netAmount: inv.subtotal || 0,
        vatAmount: inv.vat_amount || 0,
        totalAmount: inv.total_amount || 0,
        cancelled: false,
      }));
      counts['C100']++;

      // Track account balance for this customer
      const acctKey = customerTaxId || inv.customer_name?.slice(0, 15) || 'UNKNOWN';
      trackAccount(acctKey, inv.customer_name || 'לקוח', customerTaxId, inv.total_amount || 0, 0);

      // D110 detail lines from invoice items
      const items = Array.isArray(inv.items) ? inv.items : [];
      if (items.length > 0) {
        let lineNum = 1;
        for (const item of items) {
          const itemVatRate = (item as any).vatRate ?? (item as any).vat_rate ?? vatRate;
          records.push(buildD110({
            recordNum: recordNum++,
            companyTaxId: companyTaxId9,
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
      } else {
        // No items – create a single D110 fallback line for the entire invoice
        records.push(buildD110({
          recordNum: recordNum++,
          companyTaxId: companyTaxId9,
          docTypeCode,
          docNumber: inv.invoice_number || '',
          lineNum: 1,
          description: inv.title || 'חשבונית',
          quantity: 1,
          unitPrice: inv.subtotal || inv.total_amount || 0,
          lineTotal: inv.subtotal || inv.total_amount || 0,
          vatRate: Math.round(vatRate),
          invoiceDate: inv.date,
        }));
        counts['D110']++;
      }
    }

    // =============================================
    // CUSTOMER DOCUMENTS → C100 + D110 + D120
    // =============================================

    const { data: customerDocs } = await supabaseAdmin
      .from('customer_documents')
      .select('*, customers!customer_documents_customer_id_fkey(full_name, id_number, address)')
      .eq('user_id', user.id)
      .neq('status', 'cancelled')
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
        companyTaxId: companyTaxId9,
        docTypeCode,
        docNumber: doc.document_number || '',
        docDate: doc.date || '',
        customerName,
        customerTaxId,
        customerAddress,
        netAmount: doc.amount || 0,
        vatAmount: 0,
        totalAmount: doc.amount || 0,
        cancelled: false,
      }));
      counts['C100']++;

      // Track account balance
      const acctKey = customerTaxId || customerName?.slice(0, 15) || doc.customer_id?.slice(0, 15) || 'UNKNOWN';
      // For receipts, it's a credit (payment received); for invoices it's a debit
      const isCredit = doc.type === 'receipt' || doc.type === 'tax-invoice-receipt';
      if (isCredit) {
        trackAccount(acctKey, customerName || 'לקוח', customerTaxId, 0, doc.amount || 0);
      } else {
        trackAccount(acctKey, customerName || 'לקוח', customerTaxId, doc.amount || 0, 0);
      }

      // D110 – every C100 must have at least one D110
      records.push(buildD110({
        recordNum: recordNum++,
        companyTaxId: companyTaxId9,
        docTypeCode,
        docNumber: doc.document_number || '',
        lineNum: 1,
        description: doc.title || doc.type || 'מסמך',
        quantity: 1,
        unitPrice: doc.amount || 0,
        lineTotal: doc.amount || 0,
        vatRate: 0,
        invoiceDate: doc.date || '',
      }));
      counts['D110']++;

      // D120 for receipt-type docs
      if (doc.type === 'receipt' || doc.type === 'tax-invoice-receipt') {
        const linked = paymentsByDocId[doc.id];
        if (linked && linked.length > 0) {
          let payNum = 1;
          for (const pay of linked) {
            records.push(buildD120({
              recordNum: recordNum++,
              companyTaxId: companyTaxId9,
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
            companyTaxId: companyTaxId9,
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

    // =============================================
    // B110 — ACCOUNT BALANCE CARDS
    // =============================================

    for (const [_key, acct] of accountBalances) {
      const closingBalance = acct.debitTotal - acct.creditTotal;
      records.push(buildB110({
        recordNum: recordNum++,
        companyTaxId: companyTaxId9,
        accountValue: acct.accountValue,
        accountDescription: acct.accountDescription,
        openingBalance: 0,
        debitTurnover: acct.debitTotal,
        creditTurnover: acct.creditTotal,
        closingBalance,
        customerTaxId: acct.customerTaxId,
      }));
      counts['B110']++;
    }

    // =============================================
    // Z900 — CLOSING RECORD
    // =============================================

    const totalRecords = records.length + 1; // +1 for Z900 itself
    records.push(buildZ900({
      recordNum: recordNum++,
      companyTaxId: companyTaxId9,
      primaryId,
      totalRecords,
    }));
    counts['Z900']++;

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
      companyTaxId: companyTaxId9,
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

    // If there are blocking errors, fail the export
    const hasBlockers = validation.results.some(r => r.category === 'blocking' && !r.passed);
    if (hasBlockers || validation.fatalError) {
      await supabaseAdmin.from('open_format_export_runs')
        .update({ status: 'failed', finished_at: new Date().toISOString(), error_message: validation.fatalError || 'בדיקות ולידציה נכשלו' })
        .eq('id', exportRun.id);

      return new Response(JSON.stringify({
        success: false,
        exportRunId: exportRun.id,
        error: validation.fatalError || 'הייצוא נכשל בבדיקות ולידציה',
        validationResults: validation.results,
        warnings: validation.warnings,
        blockers: validation.blockers,
        recordCounts: counts,
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
      isSample: false,
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
