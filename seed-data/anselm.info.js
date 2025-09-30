// Anselm user and content entities
export const anselm = {
  id: 'group-anselm-001',
  slug: '/anselm',
  type: 'group',
  title: 'Anselm',
  content: 'Digital artist and writer exploring the intersection of technology and creativity',
  view: 'cards',
  depiction: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop',
  tags: ['artist', 'writer', 'developer', 'creative'],
  createdAt: '2024-01-10T12:00:00.000Z'
};

export const anselmPhotos = {
  id: 'group-anselm-photos-001',
  slug: '/anselm/photos',
  type: 'group',
  title: 'Photography Portfolio',
  content: 'A collection of my photography work spanning landscapes, portraits, and experimental digital art',
  view: 'grid',
  depiction: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=600&fit=crop',
  parentId: 'group-anselm-001',
  sponsorId: 'group-anselm-001',
  tags: ['photography', 'portfolio', 'art', 'visual'],
  createdAt: '2024-01-11T10:00:00.000Z'
};

export const anselmEssays = {
  id: 'group-anselm-essays-001',
  slug: '/anselm/essays',
  type: 'group',
  title: 'Essays & Writings',
  content: 'Thoughts on technology, art, philosophy, and the future of human creativity',
  view: 'cards',
  depiction: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=600&fit=crop',
  parentId: 'group-anselm-001',
  sponsorId: 'group-anselm-001',
  tags: ['writing', 'essays', 'philosophy', 'technology'],
  createdAt: '2024-01-11T11:00:00.000Z'
};

// Some sample content under these groups
export const photoPost1 = {
  id: 'post-anselm-photo-001',
  slug: '/anselm/photos/golden-gate-sunset',
  type: 'post',
  title: 'Golden Gate at Sunset',
  content: 'Captured this stunning view of the Golden Gate Bridge during a particularly vibrant sunset. The interplay of fog and light created these amazing layers.',
  depiction: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop',
  parentId: 'group-anselm-photos-001',
  sponsorId: 'group-anselm-001',
  tags: ['sunset', 'golden-gate', 'san-francisco', 'landscape'],
  latitude: 37.8199,
  longitude: -122.4783,
  radius: 1000,
  createdAt: '2024-02-15T18:30:00.000Z'
};

export const essayPost1 = {
  id: 'post-anselm-essay-001',
  slug: '/anselm/essays/ai-and-creativity',
  type: 'post',
  title: 'AI and the Future of Human Creativity',
  content: 'As we stand at the threshold of an AI-augmented future, we must ask ourselves: what does it mean to be creative? This essay explores the symbiotic relationship between human imagination and machine intelligence.',
  depiction: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop',
  parentId: 'group-anselm-essays-001',
  sponsorId: 'group-anselm-001',
  tags: ['ai', 'creativity', 'future', 'technology', 'philosophy'],
  createdAt: '2024-03-01T14:00:00.000Z'
};

// Additional photo posts
export const photoPost2 = {
  id: 'post-anselm-photo-002',
  slug: '/anselm/photos/urban-geometry',
  type: 'post',
  title: 'Urban Geometry',
  content: 'Exploring the geometric patterns found in modern architecture. The repetition and symmetry create a mesmerizing visual rhythm.',
  depiction: 'https://images.unsplash.com/photo-1481026469463-66327c86e544?w=1200&h=800&fit=crop',
  parentId: 'group-anselm-photos-001',
  sponsorId: 'group-anselm-001',
  tags: ['architecture', 'geometry', 'urban', 'patterns'],
  createdAt: '2024-02-20T14:00:00.000Z'
};

export const photoPost3 = {
  id: 'post-anselm-photo-003',
  slug: '/anselm/photos/nature-abstract',
  type: 'post',
  title: 'Nature Abstract',
  content: 'Close-up exploration of natural textures and patterns. Nature is the ultimate artist.',
  depiction: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop',
  parentId: 'group-anselm-photos-001',
  sponsorId: 'group-anselm-001',
  tags: ['nature', 'abstract', 'macro', 'texture'],
  createdAt: '2024-02-25T10:00:00.000Z'
};

// Additional essay posts
export const essayPost2 = {
  id: 'post-anselm-essay-002',
  slug: '/anselm/essays/digital-minimalism',
  type: 'post',
  title: 'Embracing Digital Minimalism',
  content: 'In an age of information overload, the practice of digital minimalism becomes not just beneficial, but essential for maintaining our cognitive clarity and creative potential.',
  depiction: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=800&fit=crop',
  parentId: 'group-anselm-essays-001',
  sponsorId: 'group-anselm-001',
  tags: ['minimalism', 'digital-wellness', 'productivity', 'philosophy'],
  createdAt: '2024-03-05T16:00:00.000Z'
};

