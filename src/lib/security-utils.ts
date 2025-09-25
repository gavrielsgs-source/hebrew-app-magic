// Security utility functions for enhanced validation and protection

/**
 * Enhanced input validation with XSS protection
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove potentially dangerous characters and patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validate and sanitize email addresses
 */
export function validateEmail(email: string): { isValid: boolean; sanitized: string } {
  const sanitized = sanitizeInput(email.toLowerCase().trim());
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return {
    isValid: emailRegex.test(sanitized) && sanitized.length <= 255,
    sanitized
  };
}

/**
 * Validate and sanitize phone numbers
 */
export function validatePhone(phone: string): { isValid: boolean; sanitized: string } {
  const sanitized = sanitizeInput(phone.replace(/[^\d+\-\s()]/g, ''));
  const phoneRegex = /^[\d+\-\s()]{10,15}$/;
  
  return {
    isValid: phoneRegex.test(sanitized),
    sanitized
  };
}

/**
 * Rate limiting utility for client-side protection
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Security logging utility
 */
export function logSecurityEvent(
  actionType: string,
  resourceType: string,
  success: boolean = true,
  error?: string
): void {
  // Only log in production for security reasons
  if (process.env.NODE_ENV === 'production') {
    console.log(`[SECURITY] ${actionType} on ${resourceType}: ${success ? 'SUCCESS' : 'FAILED'}`, 
      error ? { error } : undefined
    );
  }
}

/**
 * Content Security Policy helper
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': `
      default-src 'self'; 
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.google.com https://www.gstatic.com; 
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
      font-src 'self' https://fonts.gstatic.com; 
      img-src 'self' data: https: blob:; 
      connect-src 'self' https://zjmkdmmnajzevoupgfhg.supabase.co wss://zjmkdmmnajzevoupgfhg.supabase.co https://api.stripe.com;
    `.replace(/\s+/g, ' ').trim(),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
}