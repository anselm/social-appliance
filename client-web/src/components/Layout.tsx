import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/20 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xs uppercase tracking-wider hover:underline">
            Social Appliance
          </Link>
          <nav className="flex items-center gap-4 text-xs">
            {user ? (
              <>
                <span className="text-white/60">[{user.slug}]</span>
                <button onClick={logout} className="hover:underline">
                  logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:underline">
                login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
