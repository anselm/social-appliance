// Root group entity - the top-level container for all entities
export default {
  id: 'root-group',
  slug: '/',
  type: 'group',
  title: 'Home',
  //content: 'Welcome',
  view: 'list',
  createdAt: '2024-01-20T08:00:00.000Z',
  updatedAt: '2024-01-20T08:00:00.000Z',
  permissions: ['public:view'],
  depiction: "https://www.doc.govt.nz/thumbs/hero/globalassets/images/places/fiordland/kepler-track/kepler-1920.jpg",
  metadata: {
    isRoot: true,
    memberCount: 100,
    recentPosts: 10,
    isPublic: true
  }
};
