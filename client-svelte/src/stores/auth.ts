import { writable, derived } from 'svelte/store'
import type { User } from '../types'

function createAuthStore() {
  const user = writable<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  
  return {
    user,
    isAuthenticated: derived(user, $user => !!$user),
    login: async (username: string) => {
      const mockUser = {
        id: `user-${username}`,
        slug: username,
        title: username
      }
      user.set(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
    },
    logout: () => {
      user.set(null)
      localStorage.removeItem('user')
    }
  }
}

export const auth = createAuthStore()
