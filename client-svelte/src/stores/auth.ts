import { writable, derived } from 'svelte/store'
import { api } from '../services/api'
import type { User } from '../types'
import loggers from '../services/logger'

const log = loggers.auth

function createAuthStore() {
  const storedUser = localStorage.getItem('user')
  log.debug('Loading stored user from localStorage:', storedUser ? 'found' : 'not found')
  
  const { subscribe, set, update } = writable<User | null>(
    JSON.parse(storedUser || 'null')
  )
  
  return {
    subscribe,
    user: { subscribe },
    isAuthenticated: derived({ subscribe }, $user => !!$user),
    login: async (username: string) => {
      log.info('Attempting login for user:', username)
      
      try {
        // Ensure username has leading slash
        const slug = username.startsWith('/') ? username : `/${username}`
        log.debug('Looking up user with slug:', slug)
        
        const user = await api.getEntityBySlug(slug)
        
        if (!user || user.type !== 'party') {
          log.warn('Login failed: user not found or not a party type')
          throw new Error('User not found')
        }
        
        log.info('Login successful for user:', user.id)
        localStorage.setItem('user', JSON.stringify(user))
        set(user)
        return user
      } catch (error) {
        log.error('Login failed:', error)
        throw error
      }
    },
    logout: () => {
      log.info('Logging out user')
      localStorage.removeItem('user')
      set(null)
    },
    register: async (userData: any) => {
      log.info('Attempting to register new user:', userData.slug || userData.title)
      
      try {
        const user = await api.createUser(userData)
        log.info('Registration successful for user:', user.id)
        localStorage.setItem('user', JSON.stringify(user))
        set(user)
        return user
      } catch (error) {
        log.error('Registration failed:', error)
        throw error
      }
    }
  }
}

export const auth = createAuthStore()
