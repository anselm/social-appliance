# Social Appliance Server

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up MongoDB (if not already running)

3. Create a `.env` file with your configuration:
   ```
   # For local MongoDB without authentication:
   MONGODB_URI=mongodb://localhost:27017
   
   # For MongoDB with authentication:
   # MONGODB_URI=mongodb://username:password@localhost:27017/social_appliance?authSource=admin
   
   # For MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social_appliance
   
   DB_NAME=social_appliance
   PORT=3000
   ```

4. Run the server:
   ```
   npm start
   ```

## API Endpoints

See the API documentation for details on available endpoints.

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017)
- `DB_NAME` - Database name (default: social_appliance)
- `LOAD_SEED_DATA` - Set to 'false' to skip seed data loading (default: true)
- `SEED_DATA_PATH` - Path to seed data folder (default: ./seed-data)

## Seed Data

The server can automatically load seed data on startup from `.info.js` files in the seed data folder.

### Creating Seed Data Files

Create files ending with `.info.js` in the seed data folder. These files can export:
- A default export (single entity or array of entities)
- Named exports (each can be a single entity or array of entities)

Example:
```javascript
// Single entity as default export
export default {
  id: 'unique-id',
  slug: 'my-entity',
  type: 'post',
  title: 'My Entity'
};

// Multiple entities as named exports
export const entity1 = { id: 'id1', ... };
export const entity2 = { id: 'id2', ... };

// Array of entities
export const entities = [
  { id: 'id1', ... },
  { id: 'id2', ... }
];
```

### Requirements
- Each entity must have an `id` field
- Slugs must be unique across all entities
- Existing entities (by id) will be updated rather than duplicated
