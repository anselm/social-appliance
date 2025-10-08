import { writable } from 'svelte/store'

type Theme = 'light' | 'dark'

function createThemeStore() {
  const stored = typeof window !== 'undefined' 
    ? localStorage.getItem('theme') as Theme | null
    : null
  
  const { subscribe, set } = writable<Theme>(stored || 'dark')
  
  return {
    subscribe,
    set: (value: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', value)
        if (value === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      set(value)
    },
    toggle: () => {
      if (typeof window !== 'undefined') {
        const current = localStorage.getItem('theme') as Theme | null
        const newTheme: Theme = current === 'dark' ? 'light' : 'dark'
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme', newTheme)
        set(newTheme)
      }
    },
    init: () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme') as Theme | null
        const theme = stored || 'dark'
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        set(theme)
      }
    }
  }
}

export const themeStore = createThemeStore()
