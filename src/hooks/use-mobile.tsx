
import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * useIsMobile
 *
 * Returns true when the viewport width is below the mobile breakpoint
 * (768px, checked via a `(max-width: 767px)` media query). Uses a
 * matchMedia "change" listener with a window-resize fallback for older
 * browsers, and removes the listener on unmount. Initializes from the live
 * viewport width so the first paint already uses the right layout instead
 * of flashing the desktop layout on a phone.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
  )

  React.useEffect(() => {
    // Check if we're on the client-side
    if (typeof window === 'undefined') return;

    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Create media query
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Define handler
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Modern event listener
    if (mql.addEventListener) {
      mql.addEventListener('change', handleResize)
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize)
    }

    // Cleanup
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return isMobile
}

/**
 * useViewportSize
 *
 * Returns the current viewport dimensions as `{ width, height }`, refreshed
 * on every window resize. Initializes from the live viewport size so the
 * first paint already uses real dimensions instead of `{ width: 0, height: 0 }`.
 */
export function useViewportSize() {
  const [size, setSize] = React.useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }))

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Initial size
    updateSize()

    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return size
}
