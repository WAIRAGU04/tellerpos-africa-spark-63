
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check if window exists (for SSR)
    if (typeof window === 'undefined') return;
    
    // Function to handle resize/change
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    handleResize()
    
    // Use both matchMedia and resize event for better compatibility
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Use the standard event listener API with fallbacks
    if (mql.addEventListener) {
      mql.addEventListener("change", handleResize)
    } else if ((mql as any).addListener) {
      // Deprecated but needed for older browsers
      (mql as any).addListener(handleResize)
    }
    
    // Also listen to resize events directly
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handleResize)
      } else if ((mql as any).removeListener) {
        (mql as any).removeListener(handleResize)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Return boolean value (false as fallback)
  return isMobile
}
