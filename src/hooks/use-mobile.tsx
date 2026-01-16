import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Helper function to get initial mobile state synchronously
function getInitialIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile() {
  // Initialize with the actual value to prevent hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean>(getInitialIsMobile)

  React.useEffect(() => {
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return the actual mobile state
  return isMobile
}

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  React.useEffect(() => {
    const result = matchMedia(query)
    
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }
    
    setValue(result.matches)
    result.addEventListener("change", onChange)

    return () => result.removeEventListener("change", onChange)
  }, [query])

  return value
}

// Export a hook that indicates if the component has been hydrated
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = React.useState(false)
  
  React.useEffect(() => {
    setIsHydrated(true)
  }, [])
  
  return isHydrated
}
