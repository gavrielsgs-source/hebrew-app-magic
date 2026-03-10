interface DiscountResult {
  valid: boolean;
  discountPercent: number;
  errorMessage?: string;
}

const DISCOUNT_CODES: Record<string, { percent: number; yearlyOnly: boolean }> = {
  'CARS40': { percent: 40, yearlyOnly: true },
};

export function validateDiscountCode(code: string, billingCycle: string): DiscountResult {
  const normalized = code.trim().toUpperCase();
  const discount = DISCOUNT_CODES[normalized];

  if (!discount) {
    return { valid: false, discountPercent: 0, errorMessage: 'קוד הנחה לא תקין' };
  }

  if (discount.yearlyOnly && billingCycle !== 'yearly') {
    return { valid: false, discountPercent: 0, errorMessage: 'קוד זה תקף רק למנוי שנתי' };
  }

  return { valid: true, discountPercent: discount.percent };
}

export function applyDiscount(sum: number, discountPercent: number): number {
  return Math.round(sum * (1 - discountPercent / 100));
}
