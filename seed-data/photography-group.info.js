// Photography club group and content
export const photographyGroup = {
  id: 'group-photo-001',
  slug: '/photography',
  type: 'group',
  title: 'Photography Club',
  content: 'Share your photos, get feedback, and learn photography techniques',
  view: 'grid',
  depiction: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=600&fit=crop',
  tags: ['photography', 'art', 'camera', 'creative'],
  createdAt: '2024-02-01T14:00:00.000Z',
  updatedAt: '2024-02-01T14:00:00.000Z'
};

// Photography posts
export const photoPost1 = {
  id: 'post-photo-001',
  slug: '/photography/golden-hour-tips',
  type: 'post',
  title: 'Golden hour photography tips',
  content: 'The golden hour is the best time for photography. Here are some tips to make the most of it: use manual mode, shoot in RAW, and experiment with backlighting.',
  depiction: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=800&h=600&fit=crop',
  parentId: 'group-photo-001',
  sponsorId: 'admin-001',
  tags: ['golden-hour', 'tips', 'lighting'],
  createdAt: '2024-03-10T16:00:00.000Z',
  updatedAt: '2024-03-10T16:00:00.000Z'
};

export const photoPost2 = {
  id: 'post-photo-002',
  slug: '/photography/street-photography',
  type: 'post',
  title: 'Street Photography Essentials',
  content: 'Capturing life on the streets requires quick reflexes and an eye for moments. Learn about camera settings, composition, and the ethics of street photography.',
  depiction: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800&h=600&fit=crop',
  parentId: 'group-photo-001',
  tags: ['street-photography', 'urban', 'candid'],
  createdAt: '2024-03-11T10:00:00.000Z',
  updatedAt: '2024-03-11T10:00:00.000Z'
};

export const photoPost3 = {
  id: 'post-photo-003',
  slug: '/photography/editing-workflow',
  type: 'post',
  title: 'My Photo Editing Workflow',
  content: 'A step-by-step guide to my photo editing process using Lightroom and Photoshop. From RAW processing to final touches.',
  depiction: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
  parentId: 'group-photo-001',
  tags: ['editing', 'lightroom', 'photoshop', 'workflow'],
  createdAt: '2024-03-12T14:00:00.000Z',
  updatedAt: '2024-03-12T14:00:00.000Z'
};

export const photoPost4 = {
  id: 'post-photo-004',
  slug: '/photography/portrait-lighting',
  type: 'post',
  title: 'Portrait Lighting Techniques',
  content: 'Master the art of portrait lighting with these fundamental techniques: Rembrandt, butterfly, split, and loop lighting explained.',
  depiction: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  parentId: 'group-photo-001',
  tags: ['portrait', 'lighting', 'studio', 'techniques'],
  createdAt: '2024-03-13T11:00:00.000Z',
  updatedAt: '2024-03-13T11:00:00.000Z'
};

