// Static entities that are bundled with the client
// These entities can reference local assets in the public folder

export const rootGroup = {
  id: 'root-group',
  slug: '/',
  type: 'group',
  title: '/Home',
  content: 'Welcome',
  view: 'list',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  permissions: ['public:view'],
  metadata: {
    isRoot: true,
    description: 'This is the root group that serves as the top-level container for all other entities'
  }
};

