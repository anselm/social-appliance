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
}

export default function Group() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [group, setGroup] = useState<Entity | null>(null)
  const [posts, setPosts] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '' })

  useEffect(() => {
    if (slug) {
      loadGroup()
    }
  }, [slug])

  const loadGroup = async () => {
    try {
      const groupData = await api.getEntityBySlug(slug!)
      setGroup(groupData)
      
      if (groupData) {
        const postsData = await api.queryEntities({ 
          parentId: groupData.id, 
          type: 'post',
          limit: 100 
        })
        setPosts(postsData)
      }
    } catch (error) {
      console.error('Failed to load group:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !group || !newPost.title.trim()) return

    try {
      await api.createPost({
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        parentId: group.id,
        sponsorId: user.id,
        auth: user.id
      })
      
      setNewPost({ title: '', content: '' })
      setShowNewPost(false)
      loadGroup() // Reload posts
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  if (loading) {
    return <div className="text-xs text-white/60">Loading...</div>
  }

  if (!group) {
    return <div className="text-xs text-white/60">Group not found</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg mb-2">{group.title || group.slug || 'Untitled Group'}</h1>
        {group.content && (
          <p className="text-sm text-white/60">{group.content}</p>
        )}
      </div>

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
                autoFocus
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

      <div className="space-y-4">
        <h2 className="text-xs uppercase tracking-wider text-white/60">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-xs text-white/60">No posts yet</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border-b border-white/10 pb-4">
              <h3 className="text-sm font-medium mb-1">{post.title || 'Untitled'}</h3>
              {post.content && (
                <p className="text-sm text-white/80 whitespace-pre-wrap">{post.content}</p>
              )}
              <div className="text-xs text-white/40 mt-2">
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
