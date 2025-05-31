
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // iOS/Safari detection
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    const checkMobile = () => {
      const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const newIsMobile = width < MOBILE_BREAKPOINT || isIOSSafari;
      setIsMobile(newIsMobile);
    };

    // Initial check
    checkMobile();

    // Create media query with fallback for older browsers
    let mql: MediaQueryList | null = null;
    try {
      mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      
      if (mql.addEventListener) {
        mql.addEventListener("change", checkMobile);
      } else if (mql.addListener) {
        // Fallback for older Safari versions
        mql.addListener(checkMobile);
      }
    } catch (e) {
      console.warn("MediaQuery not supported, falling back to resize listener");
    }

    // Fallback resize listener for problematic browsers
    const handleResize = () => {
      setTimeout(checkMobile, 100); // Debounce for performance
    };
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      if (mql) {
        if (mql.removeEventListener) {
          mql.removeEventListener("change", checkMobile);
        } else if (mql.removeListener) {
          mql.removeListener(checkMobile);
        }
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return !!isMobile;
}
