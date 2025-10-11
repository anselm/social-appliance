import { writable } from 'svelte/store'

type Theme = 'light' | 'dark'

function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getSystemTheme(): Theme {
  const isDark = prefersDarkMode()
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
  if (typeof window !== 'undefined' && window.matchMedia) {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    console.log('[Theme] Setting up media query listener, current matches:', darkModeMediaQuery.matches)
    
    darkModeMediaQuery.addEventListener('change', (event) => {
      if (event.matches) {
        console.log('[Theme] System switched to Dark Mode')
        set('dark')
        applyTheme('dark')
      } else {
        console.log('[Theme] System switched to Light Mode')
        set('light')
        applyTheme('light')
      }
    })
  }

  return {
    subscribe
  }
}

export const themeStore = createThemeStore()
