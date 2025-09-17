# Social Appliance

A console-based social network with a MongoDB-powered backend, implementing a wiki-like structure with entities and relationships.

## Architecture

- **Backend**: Express.js API server with MongoDB
- **Client**: Console-based interface for interacting with the API
- **Database**: MongoDB with two collections: entities and relationships

## Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (running locally or remote URI)

### Installation

1. Install server dependencies:
```bash
cd server
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
```

3. Configure environment (optional):
Edit `server/.env` to set your MongoDB connection string and port.

### Running the Application

1. Start MongoDB (if running locally):
```bash
mongod
```

2. Start the server:
```bash
cd server
npm start
```

3. In another terminal, start the console client:
```bash
cd client
npm start
```

## Console Commands

- `help` - Show available commands
- `register <username>` - Create a new user account
- `login <username>` - Login as an existing user
- `ls` - List entities in current directory
- `cd <path>` - Navigate to a group or entity
- `create <group|post> <title>` - Create a new group or post
- `edit <slug>` - Edit an existing entity
- `view <slug>` - View entity details
- `delete <slug>` - Delete an entity
- `exit` - Exit the console

## Running Tests

Run the regression tests:
```bash
cd server
npm test
```

## API Endpoints

- `POST /api/users` - Create a user
- `POST /api/groups` - Create a group
- `POST /api/posts` - Create a post
- `GET /api/entities/:id` - Get entity by ID
- `GET /api/entities/slug/:slug` - Get entity by slug
- `PUT /api/entities/:id` - Update entity
- `DELETE /api/entities/:id` - Delete entity
- `GET /api/entities` - Query entities with filters

## Entity Types

- **PARTY** - User accounts
- **GROUP** - Groups/communities
- **POST** - Posts and comments
- **PLACE** - Location-based entities
- **THING** - Generic objects
- **AGENT** - Automated agents

## Features

- Wiki-like slug system for human-readable URLs
- Hierarchical structure with parent-child relationships
- Location-based queries
- Flexible entity system
- Permission system (stub implementation)
