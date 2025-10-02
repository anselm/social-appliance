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

export const staticGallery = {
  id: 'static-gallery',
  slug: '/gallery',
  type: 'group',
  parentId: 'root-group',
  title: 'Local Gallery',
  content: 'A collection of images and media stored locally with the app',
  view: 'grid',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const staticImages = [
  {
    id: 'static-img-1',
    slug: '/gallery/sunset',
    type: 'post',
    parentId: 'static-gallery',
    title: 'Mountain Sunset',
    content: 'A breathtaking sunset over the mountains',
    depiction: '/images/sunset.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'static-img-2',
    slug: '/gallery/ocean',
    type: 'post',
    parentId: 'static-gallery',
    title: 'Ocean Waves',
    content: 'Peaceful ocean waves at dawn',
    depiction: '/images/ocean.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'static-img-3',
    slug: '/gallery/forest',
    type: 'post',
    parentId: 'static-gallery',
    title: 'Forest Path',
    content: 'A winding path through an ancient forest',
    depiction: '/images/forest.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const staticDocs = {
  id: 'static-docs',
  slug: '/docs',
  type: 'group',
  parentId: 'root-group',
  title: 'Documentation',
  content: 'Built-in documentation and help resources',
  view: 'list',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const docPages = [
  {
    id: 'static-doc-1',
    slug: '/docs/getting-started',
    type: 'post',
    parentId: 'static-docs',
    title: 'Getting Started',
    content: `Welcome to Social Appliance! This guide will help you get started.

## Navigation
- Click on any item to view its details
- Use the breadcrumb navigation to go back
- Groups can contain posts and other groups

## Creating Content
- Click "New Post" in any group to add content
- Use the Admin panel to create new groups

## Tips
- Content can be organized hierarchically
- Each item has a unique slug for easy sharing`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'static-doc-2',
    slug: '/docs/features',
    type: 'post',
    parentId: 'static-docs',
    title: 'Features Overview',
    content: `## Key Features

### Hierarchical Organization
Organize content in a tree structure with groups and posts.

### Multiple View Modes
- List view for simple browsing
- Grid view for visual content
- Card view for rich previews

### Offline Support
With serverless mode, the entire app can run without a backend.

### Customizable
Edit config.js to customize the app after deployment.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

