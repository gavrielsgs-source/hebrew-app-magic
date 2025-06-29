
// Facebook Pixel utility functions
declare global {
  interface Window {
    fbq: (action: string, event: string, params?: Record<string, any>) => void;
  }
}

export const FacebookPixel = {
  // Track page views
  trackPageView: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  },

  // Track lead generation
  trackLead: (leadData?: { source?: string; value?: number }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', leadData);
    }
  },

  // Track registration completion
  trackCompleteRegistration: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration');
    }
  },

  // Track subscription start
  trackSubscribe: (subscriptionData?: { value?: number; currency?: string }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Subscribe', subscriptionData);
    }
  },

  // Track purchase (payment)
  trackPurchase: (purchaseData: { value: number; currency?: string }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        currency: purchaseData.currency || 'ILS',
        value: purchaseData.value
      });
    }
  },

  // Track content view (cars/leads)
  trackViewContent: (contentData?: { content_type?: string; content_ids?: string[] }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', contentData);
    }
  },

  // Track contact (WhatsApp)
  trackContact: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Contact');
    }
  },

  // Track custom events
  trackCustomEvent: (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, params);
    }
  }
};
