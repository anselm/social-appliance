// Anselm user and content entities
export const anselm = {
  id: 'party-anselm-001',
  slug: '/anselm',
  type: 'party',
  title: 'Anselm',
  content: 'Digital artist and writer exploring the intersection of technology and creativity',
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
  parentId: 'party-anselm-001',
  sponsorId: 'party-anselm-001',
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
  parentId: 'party-anselm-001',
  sponsorId: 'party-anselm-001',
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
  parentId: 'group-anselm-photos-001',
  sponsorId: 'party-anselm-001',
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
  parentId: 'group-anselm-essays-001',
  sponsorId: 'party-anselm-001',
  tags: ['ai', 'creativity', 'future', 'technology', 'philosophy'],
  createdAt: '2024-03-01T14:00:00.000Z'
};

// Export as array for convenience
export default [anselm, anselmPhotos, anselmEssays, photoPost1, essayPost1];
