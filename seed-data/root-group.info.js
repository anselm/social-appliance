// Root group entity - the top-level container for all entities
export default {
  id: 'root-group',
  slug: '/',
  type: 'group',
  title: 'Root Group',
  content: 'The root container for all entities in the system',
  view: 'grid',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  permissions: ['public:view'],
  metadata: {
    isRoot: true,
    description: 'This is the root group that serves as the top-level container for all other entities'
  }
};
