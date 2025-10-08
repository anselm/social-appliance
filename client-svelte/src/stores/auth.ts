import { writable } from 'svelte/store'
import { api } from '../services/api'

export interface AuthState {
  type: 'siwe' | 'magic'
  address?: string
  ensName?: string
  email?: string
  issuer?: string
  didToken?: string
  partyId?: string // The user's primary party entity ID
  partySlug?: string // The user's primary party entity slug
}

const AUTH_STORAGE_KEY = 'auth_state'

function createAuthStore() {
  // Load initial state from localStorage
  let initialState: AuthState | null = null
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        initialState = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored auth state:', e)
      }
    }
  }

  const { subscribe, set, update } = writable<AuthState | null>(initialState)

  return {
    subscribe,
    login: async (authData: Omit<AuthState, 'partyId' | 'partySlug'>) => {
      // Try to find the user's party entity
      const authIdentifier = authData.address || authData.issuer || ''
      
      try {
        const parties = await api.queryEntities({
          type: 'party',
          auth: authIdentifier,
          limit: 1
        })
        
        if (parties && parties.length > 0) {
          const party = parties[0]
          const fullAuthData: AuthState = {
            ...authData,
            partyId: party.id,
            partySlug: party.slug || undefined
          }
          
          set(fullAuthData)
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fullAuthData))
          }
          return { success: true, hasParty: true, party }
        } else {
          // Authenticated but no party entity
          return { success: true, hasParty: false }
        }
      } catch (error) {
        console.error('Failed to check for party entity:', error)
        return { success: true, hasParty: false }
      }
    },
    completeSignup: (partyId: string, partySlug: string) => {
      update(state => {
        if (!state) return state
        const newState = { ...state, partyId, partySlug }
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState))
        }
        return newState
      })
    },
    logout: () => {
      set(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    },
    // Check if user is fully logged in (authenticated + has party)
    isFullyAuthenticated: (state: AuthState | null): boolean => {
      return !!(state && state.partyId)
    }
  }
}

export const authStore = createAuthStore()
