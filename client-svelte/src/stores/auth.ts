import { writable } from 'svelte/store';

export interface AuthData {
  type: 'siwe' | 'magic';
  address?: string;
  ensName?: string;
  email?: string;
  issuer?: string;
  didToken?: string;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthData | null>(null);

  return {
    subscribe,
    login: (authData: AuthData) => {
      localStorage.setItem('authData', JSON.stringify(authData));
      set(authData);
    },
    logout: () => {
      localStorage.removeItem('authData');
      localStorage.removeItem('authToken');
      set(null);
    },
    init: () => {
      const stored = localStorage.getItem('authData');
      if (stored) {
        try {
          const authData = JSON.parse(stored);
          set(authData);
        } catch (e) {
          console.error('Failed to restore auth:', e);
          localStorage.removeItem('authData');
        }
      }
    }
  };
}

export const authStore = createAuthStore();
