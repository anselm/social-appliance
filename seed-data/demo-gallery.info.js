// Demo gallery group with grid view
export const galleryGroup = {
  id: 'group-demo-gallery-001',
  slug: '/demo/gallery',
  type: 'group',
  title: 'Image Gallery',
  content: 'Visual content gallery - displayed in grid view',
  view: 'grid',
  depiction: 'https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?w=1200&h=600&fit=crop',
  parentId: 'group-demo-001',
  createdAt: '2024-02-01T11:00:00.000Z',
  updatedAt: '2024-02-01T11:00:00.000Z',
  permissions: ['public:view']
};

// Gallery posts
export const galleryPost1 = {
  id: 'post-gallery-001',
  slug: '/demo/gallery/sunset',
  type: 'post',
  title: 'Sunset Photography',
  content: 'Beautiful sunset captured at the beach yesterday evening.',
  depiction: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&h=600&fit=crop',
  parentId: 'group-demo-gallery-001',
  createdAt: '2024-02-02T11:00:00.000Z',
  updatedAt: '2024-02-02T11:00:00.000Z'
};

export const galleryPost2 = {
  id: 'post-gallery-002',
  slug: '/demo/gallery/mountains',
  type: 'post',
  title: 'Mountain Landscapes',
  content: 'Stunning views from the mountain peak hiking trail.',
  depiction: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  parentId: 'group-demo-gallery-001',
  createdAt: '2024-02-03T11:00:00.000Z',
  updatedAt: '2024-02-03T11:00:00.000Z'
};

export const galleryPost3 = {
  id: 'post-gallery-003',
  slug: '/demo/gallery/urban-architecture',
  type: 'post',
  title: 'Urban Architecture',
  content: 'Modern architectural marvels in the city center.',
  depiction: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
  parentId: 'group-demo-gallery-001',
  createdAt: '2024-02-04T11:00:00.000Z',
  updatedAt: '2024-02-04T11:00:00.000Z'
};

export const galleryPost4 = {
  id: 'post-gallery-004',
  slug: '/demo/gallery/nature-macro',
  type: 'post',
  title: 'Nature Macro Photography',
  content: 'Exploring the tiny wonders of nature through macro lens.',
  depiction: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop',
  parentId: 'group-demo-gallery-001',
  createdAt: '2024-02-05T11:00:00.000Z',
  updatedAt: '2024-02-05T11:00:00.000Z'
};

export default [galleryGroup, galleryPost1, galleryPost2, galleryPost3, galleryPost4];
