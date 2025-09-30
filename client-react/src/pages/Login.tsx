import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      await login(username.trim())
      navigate('/')
    }
  }

  return (
    <div className="max-w-sm">
      <h1 className="text-xs uppercase tracking-wider mb-8">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-xs text-white/60 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-black border border-white/20 px-2 py-1 text-sm focus:outline-none focus:border-white"
            placeholder="enter username"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="border border-white/20 px-4 py-1 text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  )
}
