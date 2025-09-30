// Demo groups to showcase different view styles
export default [
  {
    id: 'group-demo-news-001',
    slug: '/demo/news',
    type: 'group',
    title: 'News & Updates',
    content: 'Latest news and updates - displayed in list view',
    view: 'list',
    createdAt: '2024-02-01T10:00:00.000Z',
    updatedAt: '2024-02-01T10:00:00.000Z',
    permissions: ['public:view']
  },
  {
    id: 'group-demo-gallery-001',
    slug: '/demo/gallery',
    type: 'group',
    title: 'Image Gallery',
    content: 'Visual content gallery - displayed in grid view',
    view: 'grid',
    createdAt: '2024-02-01T11:00:00.000Z',
    updatedAt: '2024-02-01T11:00:00.000Z',
    permissions: ['public:view']
  },
  {
    id: 'group-demo-articles-001',
    slug: '/demo/articles',
    type: 'group',
    title: 'Featured Articles',
    content: 'Long-form articles - displayed in cards view',
    view: 'cards',
    createdAt: '2024-02-01T12:00:00.000Z',
    updatedAt: '2024-02-01T12:00:00.000Z',
    permissions: ['public:view']
  },
  // Add some sample posts to each group
  {
    id: 'post-news-001',
    slug: '/demo/news/update-1',
    type: 'post',
    title: 'System Update Released',
    content: 'We have released a new system update with improved performance and bug fixes.',
    parentId: 'group-demo-news-001',
    createdAt: '2024-02-02T10:00:00.000Z',
    updatedAt: '2024-02-02T10:00:00.000Z'
  },
  {
    id: 'post-news-002',
    slug: '/demo/news/announcement',
    type: 'post',
    title: 'New Features Coming Soon',
    content: 'Exciting new features are in development and will be released next month.',
    parentId: 'group-demo-news-001',
    createdAt: '2024-02-03T10:00:00.000Z',
    updatedAt: '2024-02-03T10:00:00.000Z'
  },
  {
    id: 'post-gallery-001',
    slug: '/demo/gallery/sunset',
    type: 'post',
    title: 'Sunset Photography',
    content: 'Beautiful sunset captured at the beach yesterday evening.',
    parentId: 'group-demo-gallery-001',
    createdAt: '2024-02-02T11:00:00.000Z',
    updatedAt: '2024-02-02T11:00:00.000Z'
  },
  {
    id: 'post-gallery-002',
    slug: '/demo/gallery/mountains',
    type: 'post',
    title: 'Mountain Landscapes',
    content: 'Stunning views from the mountain peak hiking trail.',
    parentId: 'group-demo-gallery-001',
    createdAt: '2024-02-03T11:00:00.000Z',
    updatedAt: '2024-02-03T11:00:00.000Z'
  },
  {
    id: 'post-articles-001',
    slug: '/demo/articles/future-tech',
    type: 'post',
    title: 'The Future of Technology',
    content: 'An in-depth exploration of emerging technologies and their potential impact on society. This article examines artificial intelligence, quantum computing, and biotechnology advances that will shape our future.',
    parentId: 'group-demo-articles-001',
    createdAt: '2024-02-02T12:00:00.000Z',
    updatedAt: '2024-02-02T12:00:00.000Z'
  },
  {
    id: 'post-articles-002',
    slug: '/demo/articles/climate-change',
    type: 'post',
    title: 'Climate Change: A Global Challenge',
    content: 'Understanding the science behind climate change and exploring solutions for a sustainable future. This comprehensive article covers the latest research, policy developments, and individual actions we can take.',
    parentId: 'group-demo-articles-001',
    createdAt: '2024-02-03T12:00:00.000Z',
    updatedAt: '2024-02-03T12:00:00.000Z'
  }
];
