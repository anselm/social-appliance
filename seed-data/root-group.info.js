// Root group entity - the top-level container for all entities
export default {
  id: 'root-group',
  slug: '/',
  type: 'group',
  title: 'Home',
  //content: 'Welcome',
  view: 'list',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  permissions: ['public:view'],
  depiction: "https://www.doc.govt.nz/thumbs/hero/globalassets/images/places/fiordland/kepler-track/kepler-1920.jpg",
  metadata: {
    isRoot: true,
    description: 'This is the root group that serves as the top-level container for all other entities'
  }
};
