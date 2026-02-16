// Company type utilities
export const COMPANY_TYPE_LABELS: Record<string, string> = {
  authorized_dealer: 'עוסק מורשה',
  ltd: 'חברה בע"מ',
  exempt: 'עוסק פטור',
};

export function getCompanyTypeLabel(companyType?: string | null, authorizedDealer?: boolean): string {
  if (companyType && COMPANY_TYPE_LABELS[companyType]) {
    return COMPANY_TYPE_LABELS[companyType];
  }
  // Backward compatibility
  if (authorizedDealer) {
    return 'עוסק מורשה';
  }
  return '';
}

export function getCompanyTypeBadgeHTML(companyType?: string | null, authorizedDealer?: boolean): string {
  const label = getCompanyTypeLabel(companyType, authorizedDealer);
  if (!label) return '';
  return `<div style="margin-top:5px;font-size:11px;color:#2b6cb0;font-weight:bold">✓ ${label}</div>`;
}

export function getCompanyTypeFooter(companyType?: string | null, authorizedDealer?: boolean): string {
  const label = getCompanyTypeLabel(companyType, authorizedDealer);
  if (!label) return '';
  return ` | ${label}`;
}
