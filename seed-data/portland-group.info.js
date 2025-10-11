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

export const portlandPost2 = {
  id: 'post-portland-002',
  slug: '/portland/voodoo-doughnuts',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Voodoo Doughnut - Iconic Portland Treat',
  content: 'Famous for their quirky doughnuts and pink boxes. Try the Bacon Maple Bar or the Portland Cream. Expect a line, but it moves fast!',
  depiction: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop',
  tags: ['food', 'doughnuts', 'downtown', 'iconic'],
  latitude: 45.5225,
  longitude: -122.6730,
  radius: 50,
  createdAt: '2024-03-08T11:00:00.000Z',
  updatedAt: '2024-03-08T11:00:00.000Z'
};

export const portlandPost3 = {
  id: 'post-portland-003',
  slug: '/portland/japanese-garden',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Portland Japanese Garden - Tranquil Beauty',
  content: 'One of the most authentic Japanese gardens outside of Japan. Stunning views, peaceful atmosphere, and beautiful in every season.',
  depiction: 'https://images.unsplash.com/photo-1519552928909-67d0cdc3c0ed?w=800&h=600&fit=crop',
  tags: ['garden', 'nature', 'peaceful', 'west-hills'],
  latitude: 45.5186,
  longitude: -122.7161,
  radius: 200,
  createdAt: '2024-03-08T12:00:00.000Z',
  updatedAt: '2024-03-08T12:00:00.000Z'
};

export const portlandPost4 = {
  id: 'post-portland-004',
  slug: '/portland/saturday-market',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Saturday Market - Local Arts and Crafts',
  content: 'The longest-running outdoor arts and crafts market in the US. Open Saturdays and Sundays, featuring local artisans, food, and live music.',
  depiction: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&h=600&fit=crop',
  tags: ['market', 'arts', 'crafts', 'waterfront', 'weekend'],
  latitude: 45.5234,
  longitude: -122.6708,
  radius: 150,
  createdAt: '2024-03-08T13:00:00.000Z',
  updatedAt: '2024-03-08T13:00:00.000Z'
};

export const portlandPost5 = {
  id: 'post-portland-005',
  slug: '/portland/lan-su-chinese-garden',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Lan Su Chinese Garden - Urban Oasis',
  content: 'A Ming Dynasty-style garden in the heart of Chinatown. Enjoy tea in the teahouse and explore the beautiful architecture and landscaping.',
  depiction: 'https://images.unsplash.com/photo-1604608672516-f1b9b1a0b3c5?w=800&h=600&fit=crop',
  tags: ['garden', 'chinatown', 'tea', 'architecture'],
  latitude: 45.5247,
  longitude: -122.6739,
  radius: 100,
  createdAt: '2024-03-08T14:00:00.000Z',
  updatedAt: '2024-03-08T14:00:00.000Z'
};

export const portlandPost6 = {
  id: 'post-portland-006',
  slug: '/portland/forest-park',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Forest Park - Urban Wilderness',
  content: 'One of the largest urban forests in the US with over 80 miles of trails. The Wildwood Trail offers stunning views and peaceful forest walks.',
  depiction: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
  tags: ['hiking', 'nature', 'trails', 'forest', 'northwest'],
  latitude: 45.5579,
  longitude: -122.7376,
  radius: 5000,
  createdAt: '2024-03-08T15:00:00.000Z',
  updatedAt: '2024-03-08T15:00:00.000Z'
};

export const portlandPost7 = {
  id: 'post-portland-007',
  slug: '/portland/pittock-mansion',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Pittock Mansion - Historic Estate with City Views',
  content: 'French Renaissance-style mansion with panoramic views of Portland and Mount Hood. Tour the historic home and enjoy the gardens.',
  depiction: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  tags: ['historic', 'mansion', 'views', 'west-hills'],
  latitude: 45.5253,
  longitude: -122.7161,
  radius: 100,
  createdAt: '2024-03-08T16:00:00.000Z',
  updatedAt: '2024-03-08T16:00:00.000Z'
};

export const portlandPost8 = {
  id: 'post-portland-008',
  slug: '/portland/hawthorne-district',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Hawthorne District - Quirky Shopping and Dining',
  content: 'Eclectic neighborhood with vintage shops, bookstores, cafes, and restaurants. Perfect for a leisurely afternoon of exploring.',
  depiction: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
  tags: ['shopping', 'dining', 'neighborhood', 'southeast', 'vintage'],
  latitude: 45.5122,
  longitude: -122.6208,
  radius: 1000,
  createdAt: '2024-03-08T17:00:00.000Z',
  updatedAt: '2024-03-08T17:00:00.000Z'
};

export const portlandPost9 = {
  id: 'post-portland-009',
  slug: '/portland/alberta-arts',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Alberta Arts District - Creative Hub',
  content: 'Vibrant arts district with galleries, street art, and the Last Thursday art walk. Great restaurants and local breweries too.',
  depiction: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop',
  tags: ['arts', 'galleries', 'street-art', 'northeast', 'nightlife'],
  latitude: 45.5589,
  longitude: -122.6544,
  radius: 800,
  createdAt: '2024-03-08T18:00:00.000Z',
  updatedAt: '2024-03-08T18:00:00.000Z'
};

export const portlandPost10 = {
  id: 'post-portland-010',
  slug: '/portland/waterfront-park',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Tom McCall Waterfront Park - River Views',
  content: 'Beautiful park along the Willamette River, perfect for walking, biking, or just relaxing. Host to many festivals and events throughout the year.',
  depiction: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&h=600&fit=crop',
  tags: ['park', 'waterfront', 'biking', 'events', 'downtown'],
  latitude: 45.5202,
  longitude: -122.6742,
  radius: 2000,
  createdAt: '2024-03-08T19:00:00.000Z',
  updatedAt: '2024-03-08T19:00:00.000Z'
};

export const portlandPost11 = {
  id: 'post-portland-011',
  slug: '/portland/food-carts',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Food Cart Pods - Culinary Adventure',
  content: 'Portland is famous for its food cart scene. Check out the pods on Alder Street, Hawthorne, and Mississippi for diverse international cuisine.',
  depiction: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&h=600&fit=crop',
  tags: ['food', 'food-carts', 'international', 'lunch', 'downtown'],
  latitude: 45.5189,
  longitude: -122.6765,
  radius: 500,
  createdAt: '2024-03-08T20:00:00.000Z',
  updatedAt: '2024-03-08T20:00:00.000Z'
};

export const portlandPost12 = {
  id: 'post-portland-012',
  slug: '/portland/crystal-springs',
  parentId: 'group-portland-001',
  type: 'post',
  title: 'Crystal Springs Rhododendron Garden - Spring Blooms',
  content: 'Spectacular display of rhododendrons and azaleas in spring. Peaceful garden with a lake, waterfalls, and wildlife. Best visited in April-May.',
  depiction: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop',
  tags: ['garden', 'flowers', 'spring', 'nature', 'southeast'],
  latitude: 45.4836,
  longitude: -122.6344,
  radius: 200,
  createdAt: '2024-03-08T21:00:00.000Z',
  updatedAt: '2024-03-08T21:00:00.000Z'
};
