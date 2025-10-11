import { writable } from 'svelte/store'

type Theme = 'light' | 'dark'

console.log('[Theme] Module loading - START')

function prefersDarkMode(): boolean {
  console.log('[Theme] prefersDarkMode called')
  if (typeof window === 'undefined') {
    console.log('[Theme] Window is undefined, returning false')
    return false
  }
  if (!window.matchMedia) {
    console.log('[Theme] matchMedia not supported')
    return false
  }
  const matches = window.matchMedia('(prefers-color-scheme: dark)').matches
  console.log('[Theme] prefersDarkMode check result:', matches)
  return matches
}

function getSystemTheme(): Theme {
  console.log('[Theme] getSystemTheme called')
  const isDark = prefersDarkMode()
  const theme = isDark ? 'dark' : 'light'
  console.log('[Theme] getSystemTheme returning:', theme)
  return theme
}

function createThemeStore() {
  console.log('[Theme] createThemeStore called - START')
  
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

  // Apply initial theme immediately
  console.log('[Theme] Applying initial theme')
  applyTheme(systemTheme)

  // Set up listener after a short delay to ensure everything is ready
  if (typeof window !== 'undefined') {
    console.log('[Theme] Window is available, setting up listener')
    
    setTimeout(() => {
      console.log('[Theme] Setting up matchMedia listener (delayed)')
      
      if (!window.matchMedia) {
        console.log('[Theme] matchMedia not available')
        return
      }
      
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      console.log('[Theme] Media query created')
      console.log('[Theme] Current matches value:', darkModeMediaQuery.matches)
      
      const handleChange = (event: MediaQueryListEvent) => {
        console.log('[Theme] ===== MEDIA QUERY CHANGE EVENT FIRED =====')
        console.log('[Theme] Event:', event)
        console.log('[Theme] Event.matches:', event.matches)
        console.log('[Theme] Event.media:', event.media)
        
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
      
      console.log('[Theme] Adding event listener')
      darkModeMediaQuery.addEventListener('change', handleChange)
      console.log('[Theme] Event listener added successfully')
      
      // Verify the listener was added
      console.log('[Theme] Listener setup complete. Waiting for system theme changes...')
      console.log('[Theme] To test: Change your system theme and watch for events')
    }, 100)
  } else {
    console.log('[Theme] Window not available, cannot set up listener')
  }

  console.log('[Theme] createThemeStore called - END')

  return {
    subscribe
  }
}

console.log('[Theme] Creating theme store...')
export const themeStore = createThemeStore()
console.log('[Theme] Theme store created and exported')
console.log('[Theme] Module loading - END')
