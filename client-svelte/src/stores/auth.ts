import { writable, derived } from 'svelte/store'
import type { User } from '../types'

function createAuthStore() {
  const { subscribe, set, update } = writable<User | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  )
  
  return {
    subscribe,
    user: { subscribe },
    isAuthenticated: derived({ subscribe }, $user => !!$user),
    login: async (username: string) => {
      const mockUser = {
        id: `user-${username}`,
        slug: username,
        title: username
      }
      set(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
    },
    logout: () => {
      set(null)
      localStorage.removeItem('user')
    }
  }
}

export const auth = createAuthStore()
