import { writable } from 'svelte/store'

type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  console.log('[Theme] System theme detected:', isDark ? 'dark' : 'light')
  return isDark ? 'dark' : 'light'
}

function createThemeStore() {
  // Always start with system preference
  const systemTheme = getSystemTheme()
  console.log('[Theme] Initializing with system theme:', systemTheme)
  
  const { subscribe, set } = writable<Theme>(systemTheme)

  // Apply theme to document
  function applyTheme(theme: Theme) {
    console.log('[Theme] Applying theme to document:', theme)
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        console.log('[Theme] Added "dark" class to html element')
      } else {
        document.documentElement.classList.remove('dark')
        console.log('[Theme] Removed "dark" class from html element')
      }
    }
  }

  // Apply initial theme
  applyTheme(systemTheme)

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    console.log('[Theme] Setting up media query listener, current matches:', mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newTheme = e.matches ? 'dark' : 'light'
      console.log('[Theme] System theme changed to:', newTheme)
      set(newTheme)
      applyTheme(newTheme)
    }
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      console.log('[Theme] Using addEventListener for media query')
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      console.log('[Theme] Using addListener (legacy) for media query')
      mediaQuery.addListener(handleChange)
    }
  }

  return {
    subscribe
  }
}

export const themeStore = createThemeStore()
