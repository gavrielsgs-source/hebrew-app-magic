
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => {
      try {
        // Simple mobile detection based on screen width only
        const width = window.innerWidth;
        const isMobileScreen = width < MOBILE_BREAKPOINT;
        
        console.log('Mobile detection:', {
          width,
          isMobileScreen,
          userAgent: navigator.userAgent
        });
        
        setIsMobile(isMobileScreen);
      } catch (error) {
        console.error('Error in mobile detection:', error);
        // Fallback to desktop if there's an error
        setIsMobile(false);
      }
    };

    // Initial check
    checkMobile();

    // Debounced resize listener to prevent excessive calls
    let timeoutId: NodeJS.Timeout;
    const debouncedCheckMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };

    window.addEventListener("resize", debouncedCheckMobile);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedCheckMobile);
    };
  }, []);

  return isMobile;
}
