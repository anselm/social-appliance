import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface Entity {
  id: string
  slug?: string
  type: string
  title?: string
  content?: string
  createdAt: string
  sponsorId?: string
  parentId?: string
}

export default function EntityView() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [entity, setEntity] = useState<Entity | null>(null)
  const [children, setChildren] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '' })

  useEffect(() => {
    if (slug) {
      loadEntity()
    }
  }, [slug])

  const loadEntity = async () => {
    try {
      // Ensure slug has leading slash
      const querySlug = slug!.startsWith('/') ? slug! : `/${slug!}`
      const entityData = await api.getEntityBySlug(querySlug)
      setEntity(entityData)
      
      if (entityData) {
        // Load children (posts, sub-groups, etc.)
        const childrenData = await api.queryEntities({ 
          parentId: entityData.id,
          limit: 100 
        })
        setChildren(childrenData)
      }
    } catch (error) {
      console.error('Failed to load entity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !entity || !newPost.title.trim()) return

    try {
      await api.createPost({
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        parentId: entity.id,
        sponsorId: user.id,
        auth: user.id
      })
      
      setNewPost({ title: '', content: '' })
      setShowNewPost(false)
      loadEntity() // Reload children
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  if (loading) {
    return <div className="text-xs text-white/60">Loading...</div>
  }

  if (!entity) {
    return <div className="text-xs text-white/60">Not found</div>
  }

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs text-white/60 mb-1">[{entity.type}]</div>
        <h1 className="text-lg mb-2">{entity.title || entity.slug || 'Untitled'}</h1>
        {entity.content && (
          <p className="text-sm text-white/60">{entity.content}</p>
        )}
      </div>

      {entity.type === 'group' && (
        <div className="mb-6">
          {user && !showNewPost && (
            <button
              onClick={() => setShowNewPost(true)}
              className="text-xs uppercase tracking-wider border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-colors"
            >
              New Post
            </button>
          )}

          {showNewPost && (
            <form onSubmit={handleCreatePost} className="border border-white/20 p-4 space-y-3">
              <div>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Title"
                  className="w-full bg-black border-b border-white/20 pb-1 text-sm focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Content (optional)"
                  rows={4}
                  className="w-full bg-black border border-white/20 p-2 text-sm focus:outline-none focus:border-white resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="text-xs uppercase tracking-wider border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-colors"
                >
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPost(false)
                    setNewPost({ title: '', content: '' })
                  }}
                  className="text-xs uppercase tracking-wider text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {children.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-wider text-white/60">
            {entity.type === 'group' ? 'Posts' : 'Children'}
          </h2>
          {children.map((child) => (
            child.type === 'post' ? (
              <div key={child.id} className="border-b border-white/10 pb-4">
                <h3 className="text-sm font-medium mb-1">{child.title || 'Untitled'}</h3>
                {child.content && (
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{child.content}</p>
                )}
                <div className="text-xs text-white/40 mt-2">
                  {new Date(child.createdAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div key={child.id} className="border-b border-white/10 pb-4">
                <a href={child.slug || `/${child.id}`} className="hover:underline">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-white/60">[{child.type}]</span>
                    <span className="text-sm font-medium">{child.title || child.slug || 'Untitled'}</span>
                  </div>
                </a>
                {child.content && (
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">{child.content}</p>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}
