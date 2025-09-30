import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

interface Entity {
  id: string
  slug?: string
  type: string
  title?: string
  content?: string
  createdAt: string
}

export default function Home() {
  const [groups, setGroups] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const data = await api.queryEntities({ type: 'group', limit: 50 })
      setGroups(data)
    } catch (error) {
      console.error('Failed to load groups:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-xs text-white/60">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-xs uppercase tracking-wider mb-8">Groups</h1>
      <div className="space-y-2">
        {groups.length === 0 ? (
          <p className="text-xs text-white/60">No groups found</p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="border-b border-white/10 pb-2">
              <Link
                to={`/g/${group.slug || group.id}`}
                className="block hover:bg-white/5 -mx-2 px-2 py-1"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-white/60">[{group.type}]</span>
                  <span className="text-sm">{group.title || group.slug || 'Untitled'}</span>
                </div>
                {group.content && (
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">{group.content}</p>
                )}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
