
export const rootGroup = {
  id: 'root-group',
  slug: '/',
  type: 'group',
  title: '/Home',
  //content: 'Welcome home',
  view: 'list',
  createdAt: '2024-01-20T08:00:00.000Z',
  updatedAt: '2024-01-20T08:00:00.000Z',
  permissions: ['public:view'],
  metadata: {
    isRoot: true,
    memberCount: 10,
    recentPosts: 0,
    isPublic: true
  }
};

// Portland community group and content
export const portlandGroup = {
  id: 'group-portland-001',
  slug: '/portland',
  parentId: 'root-group',  
  type: 'group',
  title: 'Portland Community',
  content: 'Connect with locals and visitors in Portland, Oregon - food, culture, and city life',
  view: 'map',
  depiction: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=600&fit=crop',
  tags: ['portland', 'oregon', 'pnw', 'city', 'community'],
  latitude: 45.5152,
  longitude: -122.6784,
  radius: 25000, // 25km radius covering Portland metro
  createdAt: '2024-01-25T08:00:00.000Z',
  updatedAt: '2024-01-25T08:00:00.000Z',
  metadata: {
    memberCount: 523,
    recentPosts: 94,
    isPublic: true
  }
};

// Portland posts with specific locations
export const portlandPost1 = {
  id: 'post-portland-001',
  slug: '/portland/powells-books',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Powell\'s City of Books - A Book Lover\'s Paradise',
  content: 'Powell\'s is the largest independent bookstore in the world, occupying an entire city block. Get lost in the color-coded rooms and discover rare finds.',
  depiction: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=600&fit=crop',
  sponsorId: 'admin-001',
  tags: ['books', 'downtown', 'shopping', 'culture'],
  latitude: 45.5230,
  longitude: -122.6814,
  radius: 100,
  createdAt: '2024-03-08T10:00:00.000Z',
  updatedAt: '2024-03-08T10:00:00.000Z'
};
