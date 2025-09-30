// Sample posts for the groups
const posts = [
  {
    id: 'post-hike-001',
    slug: '/hiking/weekend-tamalpais',
    type: 'post',
    title: 'Weekend hike to Mount Tamalpais',
    content: 'Planning a group hike this Saturday morning. Who wants to join?',
    parentId: 'group-hiking-001',
    sponsorId: 'admin-001',
    tags: ['hike', 'weekend', 'mount-tamalpais'],
    latitude: 37.9235,
    longitude: -122.5965,
    radius: 5000,
    createdAt: '2024-03-01T09:00:00.000Z'
  },
  {
    id: 'post-bali-001',
    slug: '/bali/canggu-cafes',
    type: 'post',
    title: 'Best cafes in Canggu for digital nomads',
    content: 'Here are my top 5 cafes with good wifi and great coffee in Canggu area.',
    parentId: 'group-bali-001',
    sponsorId: 'admin-001',
    tags: ['canggu', 'cafe', 'digital-nomad', 'wifi'],
    latitude: -8.6478,
    longitude: 115.1385,
    radius: 2000,
    createdAt: '2024-03-05T11:30:00.000Z'
  },
  {
    id: 'post-photo-001',
    slug: '/photography/golden-hour-tips',
    type: 'post',
    title: 'Golden hour photography tips',
    content: 'The golden hour is the best time for photography. Here are some tips to make the most of it.',
    parentId: 'group-photo-001',
    sponsorId: 'admin-001',
    tags: ['golden-hour', 'tips', 'lighting'],
    createdAt: '2024-03-10T16:00:00.000Z'
  }
];

export default posts;
