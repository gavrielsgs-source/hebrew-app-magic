
/**
 * מחזיר את מספר הלידים שנוצרו בחודש הנוכחי
 */
export function getMonthlyLeadCount(leads: Array<{ created_at?: string | null }>): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  return leads.filter(lead => {
    if (!lead.created_at) return false;
    return lead.created_at >= startOfMonth;
  }).length;
}
