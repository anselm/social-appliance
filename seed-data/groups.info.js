// Sample group entities
export const hikingGroup = {
  id: 'group-hiking-001',
  slug: 'hiking',
  type: 'group',
  title: 'Hiking Enthusiasts',
  content: 'A community for people who love hiking and outdoor adventures',
  tags: ['outdoors', 'hiking', 'nature', 'fitness'],
  createdAt: '2024-01-15T10:00:00.000Z'
};

export const baliGroup = {
  id: 'group-bali-001',
  slug: 'bali',
  type: 'group',
  title: 'Bali Community',
  content: 'Connect with people interested in Bali - travel, culture, and living',
  tags: ['travel', 'indonesia', 'bali', 'culture', 'expat'],
  latitude: -8.4095,
  longitude: 115.1889,
  radius: 50000, // 50km radius covering most of Bali
  createdAt: '2024-01-20T08:00:00.000Z'
};

export const photographyGroup = {
  id: 'group-photo-001',
  slug: 'photography',
  type: 'group',
  title: 'Photography Club',
  content: 'Share your photos, get feedback, and learn photography techniques',
  tags: ['photography', 'art', 'camera', 'creative'],
  createdAt: '2024-02-01T14:00:00.000Z'
};

// Export as array for convenience
export default [hikingGroup, baliGroup, photographyGroup];
