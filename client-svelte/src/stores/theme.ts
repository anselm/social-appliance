import { writable } from 'svelte/store'

type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function createThemeStore() {
  // Initialize with system preference
  const systemTheme = getSystemTheme()
  
  // Check if user has a saved preference, otherwise use system theme
  const savedTheme = typeof window !== 'undefined' 
    ? (localStorage.getItem('theme') as Theme | null)
    : null
  
  const initialTheme = savedTheme || systemTheme
  
  const { subscribe, set, update } = writable<Theme>(initialTheme)

  // Apply theme to document
  function applyTheme(theme: Theme) {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // Apply initial theme
  applyTheme(initialTheme)

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't set a manual preference
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light'
        set(newTheme)
        applyTheme(newTheme)
      }
    }
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }
  }

  return {
    subscribe,
    set: (theme: Theme) => {
      set(theme)
      applyTheme(theme)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', theme)
      }
    },
    toggle: () => {
      update(current => {
        const newTheme = current === 'light' ? 'dark' : 'light'
        applyTheme(newTheme)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('theme', newTheme)
        }
        return newTheme
      })
    },
    reset: () => {
      // Clear saved preference and use system theme
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('theme')
      }
      const systemTheme = getSystemTheme()
      set(systemTheme)
      applyTheme(systemTheme)
    }
  }
}

export const themeStore = createThemeStore()
