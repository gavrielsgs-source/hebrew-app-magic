
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => {
      // Simple mobile detection based on screen width only
      const width = window.innerWidth;
      const isMobileScreen = width < MOBILE_BREAKPOINT;
      
      console.log('Mobile detection (simplified):', {
        width,
        isMobileScreen
      });
      
      setIsMobile(isMobileScreen);
    };

    // Initial check
    checkMobile();

    // Simple resize listener
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
}
