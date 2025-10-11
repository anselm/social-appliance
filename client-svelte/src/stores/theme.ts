import { writable } from 'svelte/store'

type Theme = 'light' | 'dark'

function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') {
    console.log('[Theme] Window is undefined, returning false')
    return false
  }
  if (!window.matchMedia) {
    console.log('[Theme] matchMedia not supported')
    return false
  }
  const matches = window.matchMedia('(prefers-color-scheme: dark)').matches
  console.log('[Theme] prefersDarkMode check:', matches)
  return matches
}

function getSystemTheme(): Theme {
  const isDark = prefersDarkMode()
  const theme = isDark ? 'dark' : 'light'
  console.log('[Theme] getSystemTheme returning:', theme)
  return theme
}

function createThemeStore() {
  console.log('[Theme] createThemeStore called')
  
  // Always start with system preference
  const systemTheme = getSystemTheme()
  console.log('[Theme] Initializing store with system theme:', systemTheme)
  
  const { subscribe, set } = writable<Theme>(systemTheme)

  // Apply theme to document
  function applyTheme(theme: Theme) {
    console.log('[Theme] applyTheme called with:', theme)
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement
      console.log('[Theme] HTML element classes before:', htmlElement.className)
      
      if (theme === 'dark') {
        htmlElement.classList.add('dark')
        console.log('[Theme] Added "dark" class')
      } else {
        htmlElement.classList.remove('dark')
        console.log('[Theme] Removed "dark" class')
      }
      
      console.log('[Theme] HTML element classes after:', htmlElement.className)
    } else {
      console.log('[Theme] Document is undefined, cannot apply theme')
    }
  }

  // Apply initial theme
  console.log('[Theme] Applying initial theme')
  applyTheme(systemTheme)

  // Listen for system theme changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    console.log('[Theme] Setting up matchMedia listener')
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    console.log('[Theme] Media query created, current matches:', darkModeMediaQuery.matches)
    
    const handleChange = (event: MediaQueryListEvent) => {
      console.log('[Theme] ===== MEDIA QUERY CHANGE EVENT FIRED =====')
      console.log('[Theme] Event object:', event)
      console.log('[Theme] Event.matches:', event.matches)
      
      if (event.matches) {
        console.log('[Theme] System switched to Dark Mode')
        set('dark')
        applyTheme('dark')
      } else {
        console.log('[Theme] System switched to Light Mode')
        set('light')
        applyTheme('light')
      }
    }
    
    console.log('[Theme] Adding event listener to media query')
    darkModeMediaQuery.addEventListener('change', handleChange)
    console.log('[Theme] Event listener added successfully')
    
    // Test that the listener is attached
    console.log('[Theme] Listener attached. Waiting for system theme changes...')
  } else {
    console.log('[Theme] Cannot set up listener - window or matchMedia not available')
  }

  console.log('[Theme] Store creation complete')

  return {
    subscribe
  }
}

console.log('[Theme] Module loading...')
export const themeStore = createThemeStore()
console.log('[Theme] themeStore exported')
