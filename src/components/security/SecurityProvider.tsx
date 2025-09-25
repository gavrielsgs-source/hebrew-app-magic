import { createContext, useContext, useEffect, ReactNode } from 'react';
import { getSecurityHeaders } from '@/lib/security-utils';

interface SecurityContextType {
  reportSecurityIncident: (incident: string, details?: any) => void;
}

const SecurityContext = createContext<SecurityContextType>({
  reportSecurityIncident: () => {},
});

export function SecurityProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Apply security headers (CSP will be applied by meta tags)
    const headers = getSecurityHeaders();
    
    // Create and append meta tags for security headers
    Object.entries(headers).forEach(([name, content]) => {
      const existingMeta = document.querySelector(`meta[http-equiv="${name}"]`);
      if (!existingMeta) {
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

    // Monitor for potential XSS attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check for suspicious script injections
            if (element.tagName === 'SCRIPT' && !element.getAttribute('nonce')) {
              console.warn('[SECURITY] Suspicious script injection detected');
              reportSecurityIncident('XSS_ATTEMPT', { element: element.outerHTML });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const reportSecurityIncident = (incident: string, details?: any) => {
    // Log security incidents
    console.error(`[SECURITY INCIDENT] ${incident}:`, details);
    
    // In production, you might want to send this to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to security monitoring endpoint
      fetch('/api/security-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident, details, timestamp: new Date().toISOString() }),
      }).catch(console.error);
    }
  };

  return (
    <SecurityContext.Provider value={{ reportSecurityIncident }}>
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => useContext(SecurityContext);