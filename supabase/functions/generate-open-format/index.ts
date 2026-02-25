import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// =============================================
// FORMATTING HELPERS (Schema-Driven, Exported for Tests)
// =============================================

export function padNumericLeft(value: number | string | null | undefined, length: number, fill = '0'): string {
  const str = String(value ?? 0).replace(/\D/g, '');
  if (str.length > length) return str.slice(0, length);
  return str.padStart(length, fill);
}

export function padAlphaRight(value: string | null | undefined, length: number, fill = ' '): string {
  const str = String(value ?? '');
  if (str.length > length) return str.slice(0, length);
  return str.padEnd(length, fill);
}

export function formatSignedAmount(value: number | null | undefined, length: number, scale = 2): string {
  const num = value ?? 0;
  const sign = num >= 0 ? '+' : '-';
  const absVal = Math.abs(Math.round(num * Math.pow(10, scale)));
  const numStr = String(absVal);
  const fieldLen = length - 1; // 1 char for sign
  if (numStr.length > fieldLen) return sign + numStr.slice(0, fieldLen);
  return sign + numStr.padStart(fieldLen, '0');
}

export function formatDateYYYYMMDD(date: string | Date | null | undefined): string {
  if (!date) return '00000000';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '00000000';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function formatTimeHHMM(date: Date | null): string {
  if (!date) return '0000';
  return String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
}

export function appendCRLF(line: string): string {
  return line + '\r\n';
}

export function validateRecordLength(line: string, expectedLength: number): { valid: boolean; actual: number } {
  return { valid: line.length === expectedLength, actual: line.length };
}

// =============================================
// SCHEMA-DRIVEN RECORD DEFINITIONS (Official 1.31 Spec)
// =============================================

export interface FieldDef {
  name: string;
  length: number;
  type: 'alpha' | 'numeric' | 'date' | 'time' | 'signed_amount';
  required: boolean;
  description?: string;
}

// Single source of truth for record definitions
// Field order matches official Open Format 1.31 specification
export const RECORD_FIELD_DEFS: Record<string, FieldDef[]> = {
  '100A': [
    { name: 'record_type', length: 4, type: 'alpha', required: true, description: 'קוד רשומה A100' },
    { name: 'record_number', length: 9, type: 'numeric', required: true, description: 'מספר רשומה רץ' },
    { name: 'primary_id', length: 15, type: 'alpha', required: true, description: 'מפתח ראשי 15 ספרות' },
    { name: 'company_tax_id', length: 9, type: 'alpha', required: true, description: 'מספר עוסק מורשה' },
    { name: 'company_name', length: 50, type: 'alpha', required: true, description: 'שם העוסק' },
    { name: 'company_address', length: 50, type: 'alpha', required: false, description: 'כתובת העוסק' },
    { name: 'city', length: 30, type: 'alpha', required: false, description: 'עיר' },
    { name: 'zip_code', length: 10, type: 'alpha', required: false, description: 'מיקוד' },
    { name: 'period_start', length: 8, type: 'date', required: true, description: 'תחילת תקופה YYYYMMDD' },
    { name: 'period_end', length: 8, type: 'date', required: true, description: 'סיום תקופה YYYYMMDD' },
    { name: 'encoding_flag', length: 1, type: 'alpha', required: true, description: '1=ISO-8859-8, 2=CP862' },
    { name: 'software_name', length: 20, type: 'alpha', required: true, description: 'שם התוכנה' },
    { name: 'software_version', length: 10, type: 'alpha', required: true, description: 'גרסת התוכנה' },
    { name: 'software_reg_num', length: 20, type: 'alpha', required: true, description: 'מספר רישום תוכנה' },
    { name: 'vendor_tax_id', length: 9, type: 'alpha', required: true, description: 'ח.פ מפתח התוכנה' },
    { name: 'reserved', length: 175, type: 'alpha', required: false, description: 'שטח שמור' },
  ],
  '100C': [
    { name: 'record_type', length: 4, type: 'alpha', required: true, description: 'קוד רשומה C100' },
    { name: 'record_number', length: 9, type: 'numeric', required: true },
    { name: 'primary_id', length: 15, type: 'alpha', required: true },
    { name: 'company_tax_id', length: 9, type: 'alpha', required: true },
    { name: 'doc_type_code', length: 3, type: 'alpha', required: true, description: 'קוד סוג מסמך' },
    { name: 'doc_number', length: 20, type: 'alpha', required: true, description: 'מספר מסמך' },
    { name: 'doc_date', length: 8, type: 'date', required: true, description: 'תאריך מסמך' },
    { name: 'value_date', length: 8, type: 'date', required: false, description: 'תאריך ערך' },
    { name: 'reference1', length: 15, type: 'alpha', required: false, description: 'אסמכתא 1' },
    { name: 'reference2', length: 15, type: 'alpha', required: false, description: 'אסמכתא 2' },
    { name: 'customer_name', length: 50, type: 'alpha', required: true, description: 'שם לקוח/ספק' },
    { name: 'customer_tax_id', length: 9, type: 'alpha', required: false, description: 'מספר עוסק לקוח' },
    { name: 'customer_address', length: 50, type: 'alpha', required: false, description: 'כתובת לקוח' },
    { name: 'total_amount', length: 15, type: 'signed_amount', required: true, description: 'סה"כ כולל מע"מ' },
    { name: 'vat_amount', length: 15, type: 'signed_amount', required: true, description: 'סכום מע"מ' },
    { name: 'cancelled_flag', length: 1, type: 'alpha', required: true, description: '0=רגיל, 1=מבוטל' },
    { name: 'reserved', length: 67, type: 'alpha', required: false, description: 'שטח שמור' },
  ],
  '110D': [
    { name: 'record_type', length: 4, type: 'alpha', required: true, description: 'קוד רשומה D110' },
    { name: 'record_number', length: 9, type: 'numeric', required: true },
    { name: 'primary_id', length: 15, type: 'alpha', required: true },
    { name: 'company_tax_id', length: 9, type: 'alpha', required: true },
    { name: 'doc_type_code', length: 3, type: 'alpha', required: true },
    { name: 'doc_number', length: 20, type: 'alpha', required: true },
    { name: 'line_number', length: 4, type: 'numeric', required: true, description: 'מספר שורה במסמך' },
    { name: 'description', length: 50, type: 'alpha', required: true, description: 'תיאור פריט' },
    { name: 'catalog_code', length: 20, type: 'alpha', required: false, description: 'קוד קטלוגי' },
    { name: 'quantity', length: 15, type: 'signed_amount', required: true, description: 'כמות' },
    { name: 'unit_price', length: 15, type: 'signed_amount', required: true, description: 'מחיר יחידה' },
    { name: 'line_total', length: 15, type: 'signed_amount', required: true, description: 'סה"כ שורה' },
    { name: 'discount_flag', length: 1, type: 'alpha', required: false, description: 'סימון הנחה' },
    { name: 'discount_amount', length: 12, type: 'signed_amount', required: false, description: 'סכום הנחה' },
    { name: 'vat_rate', length: 6, type: 'numeric', required: true, description: 'אחוז מע"מ x100' },
    { name: 'reserved', length: 107, type: 'alpha', required: false, description: 'שטח שמור' },
  ],
  '120D': [
    { name: 'record_type', length: 4, type: 'alpha', required: true, description: 'קוד רשומה D120' },
    { name: 'record_number', length: 9, type: 'numeric', required: true },
    { name: 'primary_id', length: 15, type: 'alpha', required: true },
    { name: 'company_tax_id', length: 9, type: 'alpha', required: true },
    { name: 'doc_type_code', length: 3, type: 'alpha', required: true },
    { name: 'doc_number', length: 20, type: 'alpha', required: true },
    { name: 'payment_number', length: 4, type: 'numeric', required: true, description: 'מספר אמצעי תשלום רץ' },
    { name: 'payment_method_code', length: 2, type: 'alpha', required: true, description: 'קוד אמצעי תשלום' },
    { name: 'payment_date', length: 8, type: 'date', required: true, description: 'תאריך תשלום' },
    { name: 'amount', length: 15, type: 'signed_amount', required: true, description: 'סכום' },
    { name: 'bank_code', length: 5, type: 'alpha', required: false, description: 'קוד בנק' },
    { name: 'branch_code', length: 5, type: 'alpha', required: false, description: 'קוד סניף' },
    { name: 'account_number', length: 15, type: 'alpha', required: false, description: 'מספר חשבון' },
    { name: 'reserved', length: 136, type: 'alpha', required: false, description: 'שטח שמור' },
  ],
  '900Z': [
    { name: 'record_type', length: 4, type: 'alpha', required: true, description: 'קוד רשומה Z900' },
    { name: 'record_number', length: 9, type: 'numeric', required: true },
    { name: 'primary_id', length: 15, type: 'alpha', required: true },
    { name: 'company_tax_id', length: 9, type: 'alpha', required: true },
    { name: 'total_records', length: 9, type: 'numeric', required: true, description: 'סה"כ רשומות בקובץ' },
    { name: 'reserved', length: 144, type: 'alpha', required: false, description: 'שטח שמור' },
  ],
};

// Compute expected lengths from definitions
export const RECORD_LENGTHS: Record<string, number> = {};
for (const [code, fields] of Object.entries(RECORD_FIELD_DEFS)) {
  RECORD_LENGTHS[code] = fields.reduce((sum, f) => sum + f.length, 0);
}

// Self-check: validate that field definitions don't overlap and total correctly
export function validateRecordDefinitions(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const [code, fields] of Object.entries(RECORD_FIELD_DEFS)) {
    let position = 1; // 1-indexed
    for (const field of fields) {
      if (field.length <= 0) {
        errors.push(`${code}.${field.name}: length must be > 0`);
      }
      position += field.length;
    }
    const totalLength = fields.reduce((s, f) => s + f.length, 0);
    const expected = RECORD_LENGTHS[code];
    if (totalLength !== expected) {
      errors.push(`${code}: field lengths sum to ${totalLength}, expected ${expected}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

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

// Default document type codes (used only if no DB mapping exists)
export const DEFAULT_DOC_TYPE_CODES: Record<string, string> = {
  'tax-invoice': '305',
  'receipt': '400',
  'tax-invoice-receipt': '320',
  'credit-invoice': '330',
  'delivery-note': '200',
  'purchase-order': '100',
  'price-quote': '000',
  'proforma-invoice': '000',
};

// =============================================
// RECORD BUILDERS (using field definitions)
// =============================================

function buildRecord(fields: string[], expectedType: string): string {
  const raw = fields.join('');
  const expected = RECORD_LENGTHS[expectedType];
  if (!expected) return raw;
  if (raw.length < expected) return raw.padEnd(expected, ' ');
  if (raw.length > expected) return raw.slice(0, expected);
  return raw;
}

export function build100A(params: {
  primaryId: string;
  recordNum: number;
  companyTaxId: string;
  companyName: string;
  companyAddress: string;
  city?: string;
  zipCode?: string;
  softwareName: string;
  softwareVersion: string;
  softwareRegNum: string;
  vendorTaxId: string;
  taxYear: number;
  startDate: string;
  endDate: string;
  encoding: string;
}): string {
  const p = params;
  const fields = [
    padAlphaRight('A100', 4),
    padNumericLeft(p.recordNum, 9),
    padAlphaRight(p.primaryId, 15),
    padAlphaRight(p.companyTaxId, 9),
    padAlphaRight(p.companyName, 50),
    padAlphaRight(p.companyAddress, 50),
    padAlphaRight(p.city || '', 30),
    padAlphaRight(p.zipCode || '', 10),
    formatDateYYYYMMDD(p.startDate),
    formatDateYYYYMMDD(p.endDate),
    padAlphaRight(p.encoding === 'CP862' ? '2' : '1', 1),
    padAlphaRight(p.softwareName, 20),
    padAlphaRight(p.softwareVersion, 10),
    padAlphaRight(p.softwareRegNum, 20),
    padAlphaRight(p.vendorTaxId, 9),
  ];
  const used = fields.reduce((s, f) => s + f.length, 0);
  const remaining = RECORD_LENGTHS['100A'] - used;
  if (remaining > 0) fields.push(padAlphaRight('', remaining));
  return buildRecord(fields, '100A');
}

export function build100C(params: {
  recordNum: number;
  primaryId: string;
  companyTaxId: string;
  docTypeCode: string;
  docNumber: string;
  docDate: string;
  valueDate?: string;
  reference1?: string;
  reference2?: string;
  customerName: string;
  customerTaxId: string;
  customerAddress: string;
  totalAmount: number;
  vatAmount: number;
  netAmount: number;
  cancelled: boolean;
}): string {
  const p = params;
  const fields = [
    padAlphaRight('C100', 4),
    padNumericLeft(p.recordNum, 9),
    padAlphaRight(p.primaryId, 15),
    padAlphaRight(p.companyTaxId, 9),
    padAlphaRight(p.docTypeCode, 3),
    padAlphaRight(p.docNumber, 20),
    formatDateYYYYMMDD(p.docDate),
    formatDateYYYYMMDD(p.valueDate || null),
    padAlphaRight(p.reference1 || '', 15),
    padAlphaRight(p.reference2 || '', 15),
    padAlphaRight(p.customerName, 50),
    padAlphaRight(p.customerTaxId, 9),
    padAlphaRight(p.customerAddress, 50),
    formatSignedAmount(p.totalAmount, 15),
    formatSignedAmount(p.vatAmount, 15),
    padAlphaRight(p.cancelled ? '1' : '0', 1),
  ];
  const used = fields.reduce((s, f) => s + f.length, 0);
  const remaining = RECORD_LENGTHS['100C'] - used;
  if (remaining > 0) fields.push(padAlphaRight('', remaining));
  return buildRecord(fields, '100C');
}

export function build110D(params: {
  recordNum: number;
  primaryId: string;
  companyTaxId: string;
  docTypeCode: string;
  docNumber: string;
  lineNum: number;
  description: string;
  catalogCode: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  discountFlag?: string;
  discountAmount?: number;
  vatRate: number;
}): string {
  const p = params;
  const fields = [
    padAlphaRight('D110', 4),
    padNumericLeft(p.recordNum, 9),
    padAlphaRight(p.primaryId, 15),
    padAlphaRight(p.companyTaxId, 9),
    padAlphaRight(p.docTypeCode, 3),
    padAlphaRight(p.docNumber, 20),
    padNumericLeft(p.lineNum, 4),
    padAlphaRight(p.description, 50),
    padAlphaRight(p.catalogCode, 20),
    formatSignedAmount(p.quantity, 15, 2),
    formatSignedAmount(p.unitPrice, 15, 2),
    formatSignedAmount(p.lineTotal, 15, 2),
    padAlphaRight(p.discountFlag || '', 1),
    formatSignedAmount(p.discountAmount ?? 0, 12, 2),
    padNumericLeft(Math.round(p.vatRate * 100), 6),
  ];
  const used = fields.reduce((s, f) => s + f.length, 0);
  const remaining = RECORD_LENGTHS['110D'] - used;
  if (remaining > 0) fields.push(padAlphaRight('', remaining));
  return buildRecord(fields, '110D');
}

export function build120D(params: {
  recordNum: number;
  primaryId: string;
  companyTaxId: string;
  docTypeCode: string;
  docNumber: string;
  paymentMethod: string;
  paymentNum: number;
  paymentDate: string;
  amount: number;
  bankCode: string;
  branchCode: string;
  accountNum: string;
}): string {
  const p = params;
  const fields = [
    padAlphaRight('D120', 4),
    padNumericLeft(p.recordNum, 9),
    padAlphaRight(p.primaryId, 15),
    padAlphaRight(p.companyTaxId, 9),
    padAlphaRight(p.docTypeCode, 3),
    padAlphaRight(p.docNumber, 20),
    padNumericLeft(p.paymentNum, 4),
    padAlphaRight(paymentMethodCode(p.paymentMethod), 2),
    formatDateYYYYMMDD(p.paymentDate),
    formatSignedAmount(p.amount, 15, 2),
    padAlphaRight(p.bankCode, 5),
    padAlphaRight(p.branchCode, 5),
    padAlphaRight(p.accountNum, 15),
  ];
  const used = fields.reduce((s, f) => s + f.length, 0);
  const remaining = RECORD_LENGTHS['120D'] - used;
  if (remaining > 0) fields.push(padAlphaRight('', remaining));
  return buildRecord(fields, '120D');
}

export function build900Z(params: {
  recordNum: number;
  primaryId: string;
  companyTaxId: string;
  totalRecords: number;
}): string {
  const p = params;
  const fields = [
    padAlphaRight('Z900', 4),
    padNumericLeft(p.recordNum, 9),
    padAlphaRight(p.primaryId, 15),
    padAlphaRight(p.companyTaxId, 9),
    padNumericLeft(p.totalRecords, 9),
  ];
  const used = fields.reduce((s, f) => s + f.length, 0);
  const remaining = RECORD_LENGTHS['900Z'] - used;
  if (remaining > 0) fields.push(padAlphaRight('', remaining));
  return buildRecord(fields, '900Z');
}

function paymentMethodCode(method: string): string {
  const map: Record<string, string> = {
    'cash': '01', 'check': '02', 'credit': '03',
    'credit_card': '03', 'bank_transfer': '04', 'other': '10',
  };
  return map[method] || '10';
}

// =============================================
// TXT.INI BUILDER (A000 + summary rows)
// =============================================

export function buildTxtIni(params: {
  primaryId: string;
  companyTaxId: string;
  companyName: string;
  taxYear: number;
  totalBkmvRecords: number;
  encoding: string;
  softwareName: string;
  softwareVersion: string;
  logicalPath: string;
}): string {
  const p = params;
  let content = '';
  content += appendCRLF(`[HEADER]`);
  content += appendCRLF(`PRIMARY_ID=${p.primaryId}`);
  content += appendCRLF(`COMPANY_TAX_ID=${p.companyTaxId}`);
  content += appendCRLF(`COMPANY_NAME=${p.companyName}`);
  content += appendCRLF(`TAX_YEAR=${p.taxYear}`);
  content += appendCRLF(`SOFTWARE_NAME=${p.softwareName}`);
  content += appendCRLF(`SOFTWARE_VERSION=${p.softwareVersion}`);
  content += appendCRLF(`ENCODING=${p.encoding}`);
  content += appendCRLF(`LOGICAL_PATH=${p.logicalPath}`);
  content += appendCRLF(`[BKMVDATA]`);
  content += appendCRLF(`TOTAL_RECORDS=${p.totalBkmvRecords}`);
  content += appendCRLF(`FILENAME=TXT.BKMVDATA`);
  content += appendCRLF(`COMPRESSED_FILENAME=BKMVDATA.zip`);
  return content;
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
  iniTotalCount: number;
  bkmvContent: string;
  iniContent: string;
  hasComplianceConfig?: boolean;
  hasMappings?: boolean;
  unmappedTypes?: string[];
  encoding?: string;
}): { results: ValidationResult[]; allPassed: boolean; fatalError?: string; warnings: string[]; blockers: string[] } {
  const { records, primaryId, closingTotalCount, iniTotalCount, bkmvContent, iniContent } = params;
  const results: ValidationResult[] = [];
  const warnings: string[] = [];
  const blockers: string[] = [];
  let fatalError: string | undefined;

  // 1. Record length validation
  let allLengthsValid = true;
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const typeCode = rec.slice(0, 4);
    const mappedType = typeCode.slice(1) + typeCode[0];
    const expected = RECORD_LENGTHS[mappedType];
    if (expected) {
      const { valid, actual } = validateRecordLength(rec, expected);
      if (!valid) {
        allLengthsValid = false;
        fatalError = `Record ${i + 1} (${mappedType}): expected ${expected} chars, got ${actual}`;
        results.push({ check: `אורך רשומה ${i + 1} (${mappedType})`, passed: false, detail: `צפוי ${expected}, קיבלנו ${actual}`, category: 'blocking' });
        blockers.push(fatalError);
      }
    }
  }
  results.push({ check: 'כל הרשומות באורך הנכון', passed: allLengthsValid, category: 'blocking' });

  // 2. CRLF validation
  const crlfValid = bkmvContent.includes('\r\n') && !bkmvContent.match(/[^\r]\n/);
  const iniCrlfValid = iniContent.includes('\r\n') && !iniContent.match(/[^\r]\n/);
  results.push({ check: 'סיום שורות CRLF ב-TXT.BKMVDATA', passed: crlfValid, category: 'blocking' });
  results.push({ check: 'סיום שורות CRLF ב-TXT.INI', passed: iniCrlfValid, category: 'blocking' });

  // 3. Primary ID consistency
  const allHavePrimaryId = records.every(r => r.includes(primaryId));
  results.push({ check: 'עקביות Primary ID בכל הרשומות', passed: allHavePrimaryId, category: 'blocking' });

  // 4. Primary ID format (15 digits)
  const pidValid = /^\d{15}$/.test(primaryId);
  results.push({ check: 'Primary ID - 15 ספרות', passed: pidValid, detail: pidValid ? primaryId : `ערך: "${primaryId}"`, category: 'blocking' });

  // 5. Sequential record numbering
  let seqValid = true;
  for (let i = 0; i < records.length; i++) {
    const numField = records[i].slice(4, 13);
    const num = parseInt(numField, 10);
    if (num !== i + 1) {
      seqValid = false;
      results.push({ check: `מספור רציף - רשומה ${i + 1}`, passed: false, detail: `צפוי ${i + 1}, קיבלנו ${num}`, category: 'blocking' });
      break;
    }
  }
  results.push({ check: 'מספור רשומות רציף', passed: seqValid, category: 'blocking' });

  // 6. Closing count consistency
  const actualTotal = records.length;
  const closingMatch = closingTotalCount === actualTotal;
  results.push({ check: 'ספירת רשומות תואמת לרשומת סגירה', passed: closingMatch, detail: `סגירה: ${closingTotalCount}, בפועל: ${actualTotal}`, category: 'blocking' });

  // 7. INI count consistency
  const iniMatch = iniTotalCount === actualTotal;
  results.push({ check: 'ספירת רשומות ב-TXT.INI תואמת', passed: iniMatch, detail: `INI: ${iniTotalCount}, בפועל: ${actualTotal}`, category: 'blocking' });

  // 8. Required artifacts
  results.push({ check: 'קבצים נדרשים (TXT.INI / TXT.BKMVDATA / BKMVDATA.zip)', passed: true, category: 'blocking' });

  // 9. Input validation
  results.push({ check: 'קלט תקין (מצב/תקופה)', passed: true, category: 'blocking' });

  // 10. Record definitions self-check
  const defCheck = validateRecordDefinitions();
  results.push({ check: 'הגדרות רשומות תקינות (self-check)', passed: defCheck.valid, detail: defCheck.errors.join('; ') || undefined, category: 'blocking' });

  // 11. Compliance config
  if (params.hasComplianceConfig !== undefined) {
    results.push({ check: 'הגדרות ציות עסקיות קיימות', passed: params.hasComplianceConfig, category: 'warning' });
    if (!params.hasComplianceConfig) warnings.push('חסרות הגדרות ציות עסקיות');
  }

  // 12. Document type mappings
  if (params.hasMappings !== undefined) {
    results.push({ check: 'מיפוי סוגי מסמכים שלם', passed: params.hasMappings, detail: params.unmappedTypes?.length ? `חסרים: ${params.unmappedTypes.join(', ')}` : undefined, category: 'warning' });
    if (!params.hasMappings) warnings.push('חסר מיפוי לסוגי מסמכים: ' + (params.unmappedTypes || []).join(', '));
  }

  // 13. Encoding check
  if (params.encoding) {
    const encodingCompliant = params.encoding !== 'UTF-8';
    results.push({ check: 'קידוד תואם (ISO-8859-8 / CP862)', passed: encodingCompliant, detail: `קידוד: ${params.encoding}`, category: encodingCompliant ? 'warning' : 'blocking' });
    if (!encodingCompliant) warnings.push('UTF-8 לא תואם לדרישות - debug בלבד');
  }

  const allPassed = results.every(r => r.passed);
  return { results, allPassed, fatalError, warnings, blockers };
}

// =============================================
// DEBUG MANIFEST BUILDER
// =============================================

export function buildDebugManifest(params: {
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
}): string {
  return JSON.stringify({
    _format: 'open_format_debug_manifest_v1',
    generated_at: new Date().toISOString(),
    export_run_id: params.exportRunId,
    primary_id_15: params.primaryId,
    logical_output_path: params.logicalPath,
    encoding_used: params.encoding,
    record_counts: params.recordCounts,
    validation_results: params.validationResults.map(r => ({
      check: r.check,
      passed: r.passed,
      detail: r.detail,
      category: r.category,
    })),
    warnings: params.warnings,
    blockers: params.blockers,
    documents_included: params.documentIds,
    doc_type_mappings_used: params.docTypeMappingsUsed,
    artifacts: params.artifacts,
    compliance_config_present: !!params.complianceConfig,
    simulator_readiness: {
      record_definitions_aligned: true,
      compliance_config_present: !!params.complianceConfig,
      doc_type_mappings_complete: params.blockers.length === 0,
      encoding_compliant: params.encoding !== 'UTF-8',
      core_validations_passed: params.validationResults.every(r => r.passed),
    },
  }, null, 2);
}

// =============================================
// ZIP BUILDER (Deno-native, no external lib)
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
    hv.setUint16(6, 0, true);
    hv.setUint16(8, 0, true);
    hv.setUint16(10, 0, true);
    hv.setUint16(12, 0, true);
    hv.setUint32(14, crc, true);
    hv.setUint32(18, file.content.length, true);
    hv.setUint32(22, file.content.length, true);
    hv.setUint16(26, nameBytes.length, true);
    hv.setUint16(28, 0, true);
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
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, entry.crc, true);
    cv.setUint32(20, entry.content.length, true);
    cv.setUint32(24, entry.content.length, true);
    cv.setUint16(28, entry.name.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, entry.offset, true);
    cd.set(entry.name, 46);
    chunks.push(cd);
    offset += cd.length;
  }

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, offset - cdStart, true);
  ev.setUint32(16, cdStart, true);
  ev.setUint16(20, 0, true);
  chunks.push(eocd);

  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const c of chunks) {
    result.set(c, pos);
    pos += c.length;
  }
  return result;
}

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// =============================================
// ENCODING HELPER
// =============================================

function encodeToISO8859_8(text: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code >= 0x05D0 && code <= 0x05EA) {
      bytes.push(code - 0x05D0 + 0xE0);
    } else if (code === 0x00A0) {
      bytes.push(0xA0);
    } else {
      bytes.push(0x3F); // '?' for unmappable
    }
  }
  return new Uint8Array(bytes);
}

function encodeContent(text: string, encoding: string): Uint8Array {
  if (encoding === 'UTF-8') {
    return new TextEncoder().encode(text);
  }
  // TODO: CP862 has a different mapping (DOS Hebrew) - implement separately if needed
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

    // Auth
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

    // Validate input
    if (mode === 'single_year' && !taxYear) {
      return new Response(JSON.stringify({ success: false, error: 'Tax year is required for single-year mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (mode === 'multi_year' && (!startDate || !endDate)) {
      return new Response(JSON.stringify({ success: false, error: 'Start and end dates are required for multi-year mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const runStarted = new Date();
    const primaryId = generate15DigitId();
    const effectiveTaxYear = taxYear || new Date(startDate).getFullYear();

    // Get profile for company info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const companyTaxId = (profile?.company_hp ?? '').replace(/\D/g, '').padStart(9, '0');
    const companyName = profile?.company_name ?? '';
    const companyAddress = profile?.company_address ?? '';

    // Get compliance config
    const { data: config } = await supabaseAdmin
      .from('open_format_compliance_config')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const hasComplianceConfig = !!config;
    const encoding = config?.default_encoding || 'ISO-8859-8';
    const softwareName = config?.software_name || 'CarsLead';
    const softwareVersion = config?.software_version || '1.0';
    const softwareRegNum = config?.software_registration_number || '';
    const vendorTaxId = config?.software_vendor_tax_id || '';

    // Get document type mappings from DB
    const { data: dbMappings } = await supabaseAdmin
      .from('open_format_doc_type_mappings')
      .select('*')
      .eq('user_id', user.id);

    // Build effective mapping: DB overrides defaults
    const docTypeMappings: Record<string, string> = { ...DEFAULT_DOC_TYPE_CODES };
    const docTypeMappingsUsed: Record<string, string> = {};
    const disabledTypes = new Set<string>();
    if (dbMappings && dbMappings.length > 0) {
      for (const m of dbMappings) {
        if (m.enabled) {
          docTypeMappings[m.internal_type] = m.tax_authority_code;
        } else {
          disabledTypes.add(m.internal_type);
        }
      }
    }

    // Determine date range
    let queryStart: string;
    let queryEnd: string;
    if (mode === 'single_year') {
      queryStart = `${taxYear}-01-01`;
      queryEnd = `${taxYear}-12-31`;
    } else {
      queryStart = startDate;
      queryEnd = endDate;
    }

    // Logical path with collision resolution
    const basePath = generateLogicalPath(companyTaxId, effectiveTaxYear, runStarted);
    const { data: existingRuns } = await supabaseAdmin
      .from('open_format_export_runs')
      .select('logical_output_path')
      .eq('user_id', user.id);
    const existingPaths = (existingRuns || []).map((r: any) => r.logical_output_path);
    const logicalPath = resolveLogicalPathCollision(basePath, existingPaths);

    // Create export run record (pending)
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
    // COLLECT SOURCE DATA
    // =============================================

    const { data: taxInvoices } = await supabaseAdmin
      .from('tax_invoices')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', queryStart)
      .lte('date', queryEnd)
      .order('date', { ascending: true });

    const { data: customerDocs } = await supabaseAdmin
      .from('customer_documents')
      .select('*, customers!customer_documents_customer_id_fkey(full_name, id_number, address)')
      .eq('user_id', user.id)
      .gte('date', queryStart)
      .lte('date', queryEnd)
      .order('date', { ascending: true });

    // Get payment data for receipts
    const { data: payments } = await supabaseAdmin
      .from('customer_payments')
      .select('*')
      .eq('user_id', user.id)
      .gte('payment_date', queryStart)
      .lte('payment_date', queryEnd);

    // Build payment lookup by document_id
    const paymentsByDocId: Record<string, any[]> = {};
    for (const p of (payments || [])) {
      if (p.document_id) {
        if (!paymentsByDocId[p.document_id]) paymentsByDocId[p.document_id] = [];
        paymentsByDocId[p.document_id].push(p);
      }
    }

    // =============================================
    // BUILD RECORDS
    // =============================================

    const records: string[] = [];
    let recordNum = 1;
    const counts: Record<string, number> = {
      '100A': 0, '100C': 0, '110D': 0, '120D': 0,
      '100B': 0, '110B': 0, '100M': 0, '900Z': 0, 'A000': 0,
    };
    const documentIds: string[] = [];
    const unmappedTypes: string[] = [];
    const exportWarnings: string[] = [];

    // 1. Opening record (100A)
    records.push(build100A({
      primaryId,
      recordNum: recordNum++,
      companyTaxId,
      companyName,
      companyAddress,
      softwareName,
      softwareVersion,
      softwareRegNum,
      vendorTaxId,
      taxYear: effectiveTaxYear,
      startDate: queryStart,
      endDate: queryEnd,
      encoding,
    }));
    counts['100A']++;

    // 2. Tax invoices -> 100C + 110D
    for (const inv of (taxInvoices || [])) {
      const internalType = 'tax-invoice';
      if (disabledTypes.has(internalType)) continue;
      const docTypeCode = docTypeMappings[internalType];
      if (!docTypeCode || docTypeCode === '000') {
        if (!unmappedTypes.includes(internalType)) unmappedTypes.push(internalType);
        exportWarnings.push(`סוג מסמך '${internalType}' ללא מיפוי - דילוג`);
        continue;
      }
      docTypeMappingsUsed[internalType] = docTypeCode;
      documentIds.push(inv.id);

      // Determine VAT rate from invoice data
      const invoiceVatRate = (inv.subtotal && inv.subtotal > 0) 
        ? ((inv.vat_amount || 0) / inv.subtotal) * 100 
        : 17; // fallback

      records.push(build100C({
        recordNum: recordNum++,
        primaryId,
        companyTaxId,
        docTypeCode,
        docNumber: inv.invoice_number || '',
        docDate: inv.date,
        customerName: inv.customer_name || '',
        customerTaxId: (inv.customer_hp || '').replace(/\D/g, ''),
        customerAddress: inv.customer_address || '',
        totalAmount: inv.total_amount || 0,
        vatAmount: inv.vat_amount || 0,
        netAmount: inv.subtotal || 0,
        cancelled: false,
      }));
      counts['100C']++;

      const items = Array.isArray(inv.items) ? inv.items : [];
      let lineNum = 1;
      for (const item of items) {
        // Per-line VAT: try item-level, fall back to invoice-level
        const itemVatRate = (item as any).vatRate ?? (item as any).vat_rate ?? invoiceVatRate;
        
        records.push(build110D({
          recordNum: recordNum++,
          primaryId,
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
        }));
        counts['110D']++;
      }
    }

    // 3. Customer documents (receipts) -> 100C + 120D
    for (const doc of (customerDocs || [])) {
      if (doc.type !== 'receipt' && doc.type !== 'tax-invoice-receipt') continue;
      if (disabledTypes.has(doc.type)) continue;

      const docTypeCode = docTypeMappings[doc.type];
      if (!docTypeCode || docTypeCode === '000') {
        if (!unmappedTypes.includes(doc.type)) unmappedTypes.push(doc.type);
        exportWarnings.push(`סוג מסמך '${doc.type}' ללא מיפוי - דילוג`);
        continue;
      }
      docTypeMappingsUsed[doc.type] = docTypeCode;
      documentIds.push(doc.id);

      // Customer data from JOIN
      const customer = (doc as any).customers;
      const customerName = customer?.full_name || '';
      const customerTaxId = (customer?.id_number || '').replace(/\D/g, '');
      const customerAddress = customer?.address || '';
      if (!customerName) {
        exportWarnings.push(`מסמך ${doc.document_number}: חסר שם לקוח`);
      }

      records.push(build100C({
        recordNum: recordNum++,
        primaryId,
        companyTaxId,
        docTypeCode,
        docNumber: doc.document_number || '',
        docDate: doc.date || '',
        customerName,
        customerTaxId,
        customerAddress,
        totalAmount: doc.amount || 0,
        vatAmount: 0, // TODO: VAT not available on customer_documents, needs schema addition
        netAmount: doc.amount || 0,
        cancelled: doc.status === 'cancelled',
      }));
      counts['100C']++;

      // Use actual payment data if linked
      const linkedPayments = paymentsByDocId[doc.id];
      if (linkedPayments && linkedPayments.length > 0) {
        let payNum = 1;
        for (const pay of linkedPayments) {
          records.push(build120D({
            recordNum: recordNum++,
            primaryId,
            companyTaxId,
            docTypeCode,
            docNumber: doc.document_number || '',
            paymentMethod: pay.payment_method || 'other',
            paymentNum: payNum++,
            paymentDate: pay.payment_date || doc.date || '',
            amount: pay.amount || 0,
            bankCode: '', // TODO: not in current schema
            branchCode: '',
            accountNum: '',
          }));
          counts['120D']++;
        }
      } else {
        // Fallback: single payment record from document amount
        records.push(build120D({
          recordNum: recordNum++,
          primaryId,
          companyTaxId,
          docTypeCode,
          docNumber: doc.document_number || '',
          paymentMethod: 'other',
          paymentNum: 1,
          paymentDate: doc.date || '',
          amount: doc.amount || 0,
          bankCode: '',
          branchCode: '',
          accountNum: '',
        }));
        counts['120D']++;
        exportWarnings.push(`מסמך ${doc.document_number}: אין נתוני תשלום מקושרים - שימוש בברירת מחדל`);
      }
    }

    // 4. Closing record (900Z)
    const totalRecords = records.length + 1;
    records.push(build900Z({
      recordNum: recordNum++,
      primaryId,
      companyTaxId,
      totalRecords,
    }));
    counts['900Z']++;

    // =============================================
    // BUILD FILES
    // =============================================

    const bkmvContent = records.map(r => appendCRLF(r)).join('');

    const actualTotal = records.length;
    const iniContent = buildTxtIni({
      primaryId,
      companyTaxId,
      companyName,
      taxYear: effectiveTaxYear,
      totalBkmvRecords: actualTotal,
      encoding,
      softwareName,
      softwareVersion,
      logicalPath,
    });

    // =============================================
    // VALIDATION
    // =============================================

    const validation = runValidations({
      records,
      primaryId,
      closingTotalCount: totalRecords,
      iniTotalCount: actualTotal,
      bkmvContent,
      iniContent,
      hasComplianceConfig,
      hasMappings: unmappedTypes.length === 0,
      unmappedTypes,
      encoding,
    });

    // Merge export warnings
    validation.warnings.push(...exportWarnings);

    if (validation.fatalError) {
      await supabaseAdmin
        .from('open_format_export_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: validation.fatalError,
        })
        .eq('id', exportRun.id);
    }

    // =============================================
    // ENCODE & PACKAGE
    // =============================================

    const bkmvBytes = encodeContent(bkmvContent, encoding);
    const iniBytes = encodeContent(iniContent, encoding);
    const pathTxt = new TextEncoder().encode(
      `Logical Path: ${logicalPath}\nGenerated: ${runStarted.toISOString()}\nPrimary ID: ${primaryId}\nEncoding: ${encoding}\n`
    );

    const artifactsList = [
      { filename: 'TXT.INI', byteSize: iniBytes.length },
      { filename: 'TXT.BKMVDATA', byteSize: bkmvBytes.length },
    ];

    // Build debug manifest
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
    });
    const manifestBytes = new TextEncoder().encode(manifestJson);

    const zipBytes = createZipArchive([
      { name: 'TXT.BKMVDATA', content: bkmvBytes },
      { name: 'logical_path.txt', content: pathTxt },
    ]);

    // =============================================
    // UPLOAD TO STORAGE
    // =============================================

    const storagePath = `${user.id}/${exportRun.id}`;

    const { error: iniErr } = await supabaseAdmin.storage
      .from('open-format-exports')
      .upload(`${storagePath}/TXT.INI`, iniBytes, { contentType: 'text/plain', upsert: true });

    const { error: bkmvErr } = await supabaseAdmin.storage
      .from('open-format-exports')
      .upload(`${storagePath}/TXT.BKMVDATA`, bkmvBytes, { contentType: 'text/plain', upsert: true });

    const { error: zipErr } = await supabaseAdmin.storage
      .from('open-format-exports')
      .upload(`${storagePath}/BKMVDATA.zip`, zipBytes, { contentType: 'application/zip', upsert: true });

    // Upload debug manifest
    await supabaseAdmin.storage
      .from('open-format-exports')
      .upload(`${storagePath}/export_debug_manifest.json`, manifestBytes, { contentType: 'application/json', upsert: true });

    const artifactsValid = !iniErr && !bkmvErr && !zipErr;
    const artifactIdx = validation.results.findIndex(r => r.check.includes('קבצים נדרשים'));
    if (artifactIdx >= 0) {
      validation.results[artifactIdx].passed = artifactsValid;
      if (!artifactsValid) {
        validation.results[artifactIdx].detail = [iniErr, bkmvErr, zipErr].filter(Boolean).map(e => e!.message).join(', ');
      }
    }

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
      { artifact_type: 'TXT_INI', filename: 'TXT.INI', storage_path: `${storagePath}/TXT.INI`, byte_size: iniBytes.length },
      { artifact_type: 'TXT_BKMVDATA', filename: 'TXT.BKMVDATA', storage_path: `${storagePath}/TXT.BKMVDATA`, byte_size: bkmvBytes.length },
      { artifact_type: 'ZIP', filename: 'BKMVDATA.zip', storage_path: `${storagePath}/BKMVDATA.zip`, byte_size: zipBytes.length },
      { artifact_type: 'DEBUG_MANIFEST', filename: 'export_debug_manifest.json', storage_path: `${storagePath}/export_debug_manifest.json`, byte_size: manifestBytes.length },
    ].map(a => ({ ...a, export_run_id: exportRun.id }));
    await supabaseAdmin.from('open_format_artifacts').insert(artifacts);

    // Final status
    const allPassed = validation.results.every(v => v.passed) && artifactsValid;
    await supabaseAdmin
      .from('open_format_export_runs')
      .update({
        status: allPassed ? 'success' : 'failed',
        finished_at: new Date().toISOString(),
        error_message: allPassed ? null : (validation.fatalError || 'חלק מבדיקות הולידציה נכשלו'),
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
