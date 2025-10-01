# Social Appliance

A decentralized social platform built with Node.js, MongoDB, and Svelte.

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your MongoDB connection
3. Install dependencies: `npm run setup`
4. Start development servers: `npm run dev`

The API server runs on http://localhost:3000 and the Svelte client on http://localhost:5173.

## Project Structure

- `/server` - Node.js/Express API server
- `/client-svelte` - Svelte frontend application
- `/client-console` - Console-based client
- `/seed-data` - Sample data for development

## Development

Run both server and client in development mode:
```bash
npm run dev
```

## Production Build

Build the client for production:
```bash
npm run build
```

Run the production server (serves both API and client):
```bash
npm start
```

The server will:
- Serve the API on `/api/*` routes
- Serve the built Svelte app for all other routes
- Automatically seed the database if `LOAD_SEED_DATA` is not set to `false`

## Deployment Options

### 1. Full Server Deployment
Deploy the entire application with MongoDB:
1. Build the client: `npm run build`
2. Deploy the server with the built client
3. Set environment variables (MongoDB URI, etc.)
4. Start with: `npm start`

### 2. Serverless/Static Deployment
Deploy just the client as a static site:
1. Build the client: `npm run build`
2. Edit `client-svelte/dist/config.js` to set `serverless: true`
3. The app will use entities from `static.info.js` and cached data
4. Deploy the `client-svelte/dist` folder to any static host

## Configuration

The client can be configured post-build by editing `/config.js`:
- `api.serverless`: Enable serverless mode (uses static data only)
- `api.baseUrl`: API endpoint (for server mode)
- `features.*`: Enable/disable features
- `header.*`: Customize the header

## Console Client

To run the console client:
```bash
cd client-console
npm start
```

Console commands:
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

## API Documentation

See `/server/README.md` for API endpoint documentation.
