// Hiking enthusiasts group and content
export const hikingGroup = {
  id: 'group-hiking-001',
  slug: '/hiking',
  type: 'group',
  title: 'Hiking Enthusiasts',
  content: 'A community for people who love hiking and outdoor adventures',
  view: 'list',
  depiction: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=600&fit=crop',
  tags: ['outdoors', 'hiking', 'nature', 'fitness'],
  createdAt: '2024-01-15T10:00:00.000Z'
};

// Hiking posts
export const hikingPost1 = {
  id: 'post-hike-001',
  slug: '/hiking/weekend-tamalpais',
  type: 'post',
  title: 'Weekend hike to Mount Tamalpais',
  content: 'Planning a group hike this Saturday morning. Who wants to join? We will meet at the Pantoll parking lot at 8 AM and take the Steep Ravine trail.',
  depiction: 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=800&h=600&fit=crop',
  parentId: 'group-hiking-001',
  sponsorId: 'admin-001',
  tags: ['hike', 'weekend', 'mount-tamalpais'],
  latitude: 37.9235,
  longitude: -122.5965,
  radius: 5000,
  createdAt: '2024-03-01T09:00:00.000Z'
};

export const hikingPost2 = {
  id: 'post-hike-002',
  slug: '/hiking/gear-recommendations',
  type: 'post',
  title: 'Essential Hiking Gear for Beginners',
  content: 'Starting your hiking journey? Here is a comprehensive list of essential gear you will need for safe and enjoyable hikes.',
  parentId: 'group-hiking-001',
  tags: ['gear', 'beginners', 'equipment'],
  createdAt: '2024-03-02T14:00:00.000Z'
};

export const hikingPost3 = {
  id: 'post-hike-003',
  slug: '/hiking/trail-conditions',
  type: 'post',
  title: 'Trail Conditions Update - Bay Area',
  content: 'Recent rain has made some trails muddy and slippery. Please be careful and wear appropriate footwear. Avoid steep trails until they dry out.',
  parentId: 'group-hiking-001',
  tags: ['trail-conditions', 'safety', 'bay-area'],
  createdAt: '2024-03-03T08:00:00.000Z'
};

export default [hikingGroup, hikingPost1, hikingPost2, hikingPost3];
