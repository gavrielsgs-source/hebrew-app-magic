/**
 * Convert Israeli phone number to WhatsApp format (972XXXXXXXXX)
 * Handles formats: 0534318411, 534318411, 972534318411, +972534318411
 */
export const formatPhoneForWhatsApp = (phone: string | null | undefined): string | null => {
  if (!phone) return null;
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove leading 0 if exists
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Add 972 prefix if not exists
  if (!cleaned.startsWith('972')) {
    cleaned = '972' + cleaned;
  }
  
  return cleaned;
};

/**
 * Validate Israeli phone number
 */
export const isValidIsraeliPhone = (phone: string | null | undefined): boolean => {
  if (!phone) return false;
  
  const formatted = formatPhoneForWhatsApp(phone);
  if (!formatted) return false;
  
  // Israeli phone numbers should be 972 + 9 digits (total 12 digits)
  return formatted.length === 12 && formatted.startsWith('972');
};
