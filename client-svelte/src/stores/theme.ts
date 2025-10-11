import { writable } from 'svelte/store'

type Theme = 'light' | 'dark'

console.log('[Theme] Module loading - START')

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    console.log('[Theme] Window is undefined, defaulting to light')
    return 'light'
  }
  
  if (!window.matchMedia) {
    console.log('[Theme] matchMedia not supported, defaulting to light')
    return 'light'
  }
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  console.log('[Theme] Media query object:', mediaQuery)
  console.log('[Theme] Media query matches:', mediaQuery.matches)
  console.log('[Theme] Media query media:', mediaQuery.media)
  
  const isDark = mediaQuery.matches
  const theme = isDark ? 'dark' : 'light'
  console.log('[Theme] System theme detected as:', theme)
  
  return theme
}

function applyTheme(theme: Theme) {
  console.log('[Theme] applyTheme called with:', theme)
  if (typeof document === 'undefined') {
    console.log('[Theme] Document is undefined, cannot apply theme')
    return
  }
  
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
}

function createThemeStore() {
  console.log('[Theme] createThemeStore called - START')
  
  // Get initial system theme
  const systemTheme = getSystemTheme()
  console.log('[Theme] Initial system theme:', systemTheme)
  
  const { subscribe, set } = writable<Theme>(systemTheme)

  // Apply initial theme
  console.log('[Theme] Applying initial theme')
  applyTheme(systemTheme)

  // Set up listener for system theme changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    console.log('[Theme] Setting up media query listener')
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    console.log('[Theme] Media query created for listener')
    console.log('[Theme] Initial matches value:', mediaQuery.matches)
    
    const handleChange = (event: MediaQueryListEvent) => {
      console.log('[Theme] ===== SYSTEM THEME CHANGE DETECTED =====')
      console.log('[Theme] Event object:', event)
      console.log('[Theme] Event.matches (dark mode):', event.matches)
      console.log('[Theme] Event.media:', event.media)
      
      const newTheme = event.matches ? 'dark' : 'light'
      console.log('[Theme] Switching to theme:', newTheme)
      
      set(newTheme)
      applyTheme(newTheme)
      
      console.log('[Theme] Theme change complete')
    }
    
    console.log('[Theme] Adding change event listener')
    mediaQuery.addEventListener('change', handleChange)
    console.log('[Theme] Event listener added successfully')
    console.log('[Theme] Waiting for system theme changes...')
  } else {
    console.log('[Theme] Cannot set up listener - window or matchMedia not available')
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
