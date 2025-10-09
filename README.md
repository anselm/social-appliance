# Social Appliance

A decentralized social platform built with Node.js, MongoDB, and Svelte, featuring multiple authentication methods.

## Features

- **Multiple Authentication Methods:**
  - Sign-In with Ethereum (SIWE) via MetaMask
  - Passwordless email authentication via Magic.link
  - Session-based and JWT token authentication

- **Flexible Data Storage:**
  - MongoDB for persistent storage
  - IndexedDB for client-side caching
  - Static file loading for demo/development

- **Modern Stack:**
  - Node.js/Express backend
  - Svelte frontend with TypeScript
  - Viem for Ethereum interactions
  - TailwindCSS for styling

- **Progressive Web App (PWA):**
  - Installable on mobile and desktop
  - Offline-capable
  - Native app-like experience
  - No overscroll or pull-to-refresh

- **Production Ready:**
  - Docker containerization
  - Docker Compose orchestration with local MongoDB
  - Google Cloud Run deployment with MongoDB Atlas
  - Automatic HTTPS with Caddy (Docker Compose)
  - PM2 process management
  - Health checks and monitoring

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Docker & Docker Compose (for Docker deployment)
- MetaMask browser extension (for SIWE authentication)
- Magic.link account (for email authentication)
- Infura account (recommended for ENS name resolution)
- ImageMagick (optional, for generating PWA icons)
- Google Cloud account (optional, for cloud deployment)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd social-appliance
```

2. Install dependencies
```bash
npm run setup
```

3. Configure environment variables

**Root .env file:**
```bash
cp .env.example .env
# Edit .env with your values
```

**Client .env file:**
```bash
cd client-svelte
cp .env.example .env
# Edit .env with your values
```

4. Get your Magic.link keys (optional, for email authentication):
   - Sign up at https://magic.Link
   - Create a new app
   - Copy the publishable key to `client-svelte/.env` as `VITE_MAGIC_PUBLISHABLE_KEY`
   - Copy the secret key to root `.env` as `MAGIC_SECRET_KEY`

5. Get your Infura API key (recommended for ENS lookups):
   - Sign up at https://www.infura.io/ (owned by MetaMask/ConsenSys)
   - Create a new project
   - Copy the project ID
   - Add to `client-svelte/.env` as:
     ```
     VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
     ```

6. Get your Mapbox access token (for map features):
   - Sign up at https://www.mapbox.com/
   - Create an access token
   - Add to `client-svelte/.env` as:
     ```
     VITE_MAPBOX_ACCESS_TOKEN=your_token_here
     ```

7. Generate PWA icons (optional):
```bash
# Create an assets/logo.png file first (512x512 recommended)
chmod +x scripts/generate-pwa-icons.sh
./scripts/generate-pwa-icons.sh
```

### Development

Run both server and client in development mode:
```bash
npm run dev
```

The API server runs on http://localhost:8001 and the Svelte client on http://localhost:8000.

### Production Build

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

## Docker Deployment

### Local Docker Deployment with Docker Compose

Deploy the entire stack locally with Docker Compose (includes MongoDB):

1. **Configure environment:**
```bash
cd docker
cp .env.example .env
# Edit .env with your configuration
```

2. **Deploy:**
```bash
npm run deploy
# or
npm run docker:deploy
```

This will:
- Build the Docker image
- Start MongoDB with replica set
- Start the application with PM2
- Start Caddy reverse proxy with automatic HTTPS
- Set up health checks and monitoring

3. **Access the application:**
- Local: http://localhost
- With domain: https://yourdomain.com (after DNS configuration)

4. **Useful commands:**
```bash
npm run docker:build    # Build images
npm run docker:up       # Start services
npm run docker:down     # Stop services
npm run docker:logs     # View logs
```

### Google Cloud Run Deployment

Deploy to Google Cloud Run (stateless, uses MongoDB Atlas):

1. **Set up MongoDB Atlas:**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string (mongodb+srv://...)
   - Whitelist Cloud Run IP ranges or use 0.0.0.0/0 for testing

2. **Install Google Cloud SDK:**
```bash
# macOS
brew install google-cloud-sdk

# Ubuntu/Debian
sudo apt-get install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

3. **Authenticate:**
```bash
gcloud auth login
gcloud auth configure-docker
```

4. **Set environment variables:**
```bash
export GCLOUD_PROJECT_ID=your-project-id
export MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social_appliance
export SESSION_SECRET=your-session-secret
export JWT_SECRET=your-jwt-secret
export MAGIC_SECRET_KEY=your-magic-secret-key
export LOAD_SEED_DATA=true
```

5. **Deploy:**
```bash
npm run gcloud:run
```

This will:
- Build the Docker image
- Push to Google Artifact Registry
- Deploy to Cloud Run
- Configure environment variables
- Set up automatic scaling

6. **Access your application:**
   - Cloud Run will provide a URL like: https://social-appliance-xxxxx-uc.a.run.app
   - Update your CORS_ORIGIN to this URL

7. **Useful commands:**
```bash
# View logs
gcloud run services logs read social-appliance --region=us-central1

# Update environment variables
gcloud run services update social-appliance --region=us-central1 \
  --set-env-vars="KEY=value"

# Delete service
gcloud run services delete social-appliance --region=us-central1
```

### Docker Architecture

**Docker Compose (Local):**
- **App Container:** Node.js application with PM2 cluster mode
- **MongoDB Container:** MongoDB 7 with replica set for transactions
- **Caddy Container:** Reverse proxy with automatic HTTPS
- **Health Checks:** Automatic monitoring and restart
- **Volumes:** Persistent data for MongoDB and Caddy
- **Networks:** Isolated networks for security

**Cloud Run (Production):**
- **Stateless Container:** Node.js application with PM2
- **MongoDB Atlas:** Managed MongoDB database
- **Automatic HTTPS:** Provided by Cloud Run
- **Auto-scaling:** 0 to 10 instances based on traffic
- **Health Checks:** Built-in monitoring

### Environment Variables

**Docker Compose (.env):**
```bash
NODE_ENV=production
PORT=3000
DOMAIN=yourdomain.com
MONGODB_URI=mongodb://mongo:27017/social_appliance?replicaSet=rs0
DB_NAME=social_appliance
MAGIC_SECRET_KEY=your_magic_secret_key
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://yourdomain.com
LOAD_SEED_DATA=true
FLUSH_DB=false
PM2_INSTANCES=max
```

**Cloud Run (Environment Variables):**
```bash
export GCLOUD_PROJECT_ID=your-project-id
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/social_appliance
export SESSION_SECRET=your-session-secret
export JWT_SECRET=your-jwt-secret
export MAGIC_SECRET_KEY=your-magic-secret-key
export DB_NAME=social_appliance
export LOAD_SEED_DATA=true
export FLUSH_DB=false
```

## Project Structure

```
social-appliance/
├── server/                 # Node.js/Express API server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── db/           # Database connection
│   │   └── index.js      # Server entry point
│   └── package.json
├── client-svelte/         # Svelte frontend
│   ├── src/
│   │   ├── lib/          # Utilities and helpers
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── stores/       # Svelte stores
│   │   └── App.svelte
│   └── package.json
├── client-console/        # Console-based client
├── seed-data/            # Sample data for development
├── docker/               # Docker configuration
│   ├── Dockerfile        # Multi-stage build
│   ├── docker-compose.yml # Service orchestration
│   ├── Caddyfile         # Caddy configuration
│   ├── ecosystem.config.js # PM2 configuration
│   └── .env.example      # Environment template
├── scripts/              # Utility scripts
│   ├── generate-pwa-icons.sh
│   ├── deploy-docker-compose.sh
│   └── deploy-gcloud-run.sh
├── assets/               # Source assets (logo, etc.)
└── package.json          # Root package.json
```

## Authentication

### Sign-In with Ethereum (SIWE)

SIWE allows users to authenticate using their Ethereum wallet through MetaMask.

**How it works:**
1. User clicks "Sign in with MetaMask"
2. Server generates a unique nonce
3. User signs a message containing the nonce with their wallet
4. Server verifies the signature and creates a session

**No additional setup required** beyond having MetaMask installed.

**ENS Name Resolution:**
- The app automatically resolves Ethereum addresses to ENS names (like "vitalik.eth")
- Requires an Infura API key (recommended) or other RPC provider
- Get a free API key at https://www.infura.io/
- Without an API key, the app will show truncated addresses instead
- Falls back to public RPC endpoints if Infura is not configured

### Magic.link Email Authentication

Magic.link provides passwordless authentication via email.

**Setup:**
1. Create account at https://magic.Link
2. Get your keys from the dashboard
3. Add to environment files:
   - `VITE_MAGIC_PUBLISHABLE_KEY` in `client-svelte/.env`
   - `MAGIC_SECRET_KEY` in root `.env`

**How it works:**
1. User enters their email
2. Magic sends a one-time password or magic link
3. User completes authentication
4. Server verifies the DID token and creates a session

## API Endpoints

### Authentication

- `GET /api/nonce` - Get a nonce for SIWE
- `POST /api/verify-siwe` - Verify SIWE signature
- `POST /api/verify-magic` - Verify Magic.link DID token
- `GET /api/me` - Get current user (requires auth)
- `POST /api/logout` - Logout current user

### Health

- `GET /healthz` - Health check endpoint
- `GET /health` - API health check

### Entities

- `GET /api/entities` - List entities
- `GET /api/entities/:id` - Get entity by ID
- `GET /api/entities/slug/:slug` - Get entity by slug
- `POST /api/entities` - Create entity (requires auth)
- `PUT /api/entities/:id` - Update entity (requires auth)
- `DELETE /api/entities/:id` - Delete entity (requires auth)

### Relationships

- `GET /api/relationships` - Query relationships
- `POST /api/relationships` - Create relationship (requires auth)
- `DELETE /api/relationships/:id` - Delete relationship (requires auth)

## Configuration

### Server Configuration (.env)

```bash
# Server
PORT=3000
SERVERPORT=8001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=social_appliance

# Authentication
MAGIC_SECRET_KEY=sk_live_your_key
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret

# CORS
CORS_ORIGIN=http://localhost:8000

# Seed Data
LOAD_SEED_DATA=true
```

### Client Configuration (client-svelte/.env)

```bash
# Magic.link
VITE_MAGIC_PUBLISHABLE_KEY=pk_live_your_key

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=your_token

# API
VITE_API_BASE_URL=

# Ethereum RPC (recommended for ENS)
VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

## Deployment Options

### 1. Docker Compose (Recommended for VPS/Self-hosted)
Deploy the entire stack with one command:
```bash
npm run deploy
```
Includes: App + MongoDB + Caddy (HTTPS)

### 2. Google Cloud Run (Recommended for Serverless)
Deploy to Google Cloud Run with MongoDB Atlas:
```bash
npm run gcloud:run
```
Includes: Stateless app + MongoDB Atlas + Auto-scaling

### 3. Full Server Deployment
Deploy manually with MongoDB:
1. Build the client: `npm run build`
2. Deploy the server with the built client
3. Set environment variables
4. Start with: `npm start`

### 4. Serverless/Static Deployment
Deploy just the client as a static site:
1. Build the client: `npm run build`
2. Edit `client-svelte/dist/config.js` to set `serverless: true`
3. Deploy the `client-svelte/dist` folder to any static host

### 5. PWA Installation
Users can install the app on their devices:
- **iOS**: Tap Share → Add to Home Screen
- **Android**: Tap menu → Install app / Add to Home Screen
- **Desktop**: Look for install icon in address bar

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

## Security Notes

- **Change default secrets in production**: Update `SESSION_SECRET` and `JWT_SECRET`
- **Use HTTPS in production**: Caddy handles this automatically (Docker Compose), Cloud Run provides it
- **Keep secrets secure**: Never commit `.env` files to git
- **Use environment variables**: For all secrets and configuration
- **Enable CORS properly**: Set `CORS_ORIGIN` to your production domain
- **Nonce expiration**: Nonces expire after 5 minutes
- **JWT expiration**: Tokens expire after 7 days by default
- **MongoDB Atlas**: Use IP whitelisting and strong passwords
- **Cloud Run**: Use Secret Manager for sensitive data

## Development Tips

- Use `npm run dev` to run both server and client with hot reload
- Check server logs for authentication status on startup
- Use browser DevTools to inspect authentication tokens
- Test both authentication methods to ensure proper setup
- Monitor MongoDB for session and entity data
- Check browser console for ENS lookup status and results
- Test PWA features in Chrome DevTools → Application → Manifest
- Use `docker-compose logs -f` to monitor container logs
- Use `gcloud run services logs read` to view Cloud Run logs

## Troubleshooting

### MetaMask not connecting
- Ensure MetaMask is installed and unlocked
- Check that you're on the correct network
- Clear browser cache and try again

### Magic.link not working
- Verify `VITE_MAGIC_PUBLISHABLE_KEY` is set correctly
- Check that `MAGIC_SECRET_KEY` is set on the server
- Ensure email address is valid
- Check server logs for Magic.link errors

### ENS names not resolving
- ENS lookup requires an Infura API key (recommended)
- Get a free API key at https://www.infura.io/
- Add to `client-svelte/.env` as `VITE_ETHEREUM_RPC_URL`
- Check browser console for ENS lookup errors
- Without an API key, addresses will be displayed in truncated format

### Docker issues
- Ensure Docker and Docker Compose are installed
- Check that ports 80 and 443 are not in use
- Verify `.env` file exists in `docker/` directory
- Check container logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`

### Cloud Run deployment issues
- Ensure gcloud CLI is installed and authenticated
- Verify `GCLOUD_PROJECT_ID` is set correctly
- Check that MongoDB Atlas connection string is correct
- Whitelist Cloud Run IP ranges in MongoDB Atlas
- View logs: `gcloud run services logs read social-appliance`
- Check environment variables are set correctly

### MongoDB Atlas connection issues
- Verify connection string format
- Check username and password are correct
- Whitelist IP addresses (0.0.0.0/0 for testing)
- Ensure cluster is running
- Check network access settings

### CORS errors
- Verify `CORS_ORIGIN` matches your client URL
- Ensure `credentials: true` is set in fetch requests
- Check that server is running on the correct port
- Update CORS_ORIGIN after deploying to Cloud Run

### Session not persisting
- Verify `SESSION_SECRET` is set
- Check cookie settings in browser
- Ensure `credentials: 'include'` in fetch requests
- In production, ensure `secure: true` for cookies over HTTPS

### PWA not installing
- Ensure HTTPS is enabled (required for PWA)
- Check manifest.json is accessible
- Verify all icon files exist
- Check browser console for PWA errors
- Test in Chrome DevTools → Application → Manifest

## External Services

### MongoDB Atlas (Required for Cloud Run)
- **Purpose**: Managed MongoDB database
- **Website**: https://www.mongodb.com/cloud/atlas
- **Free Tier**: Yes, 512MB storage
- **Setup**: Sign up, create cluster, get connection string

### Infura (MetaMask/ConsenSys) - Recommended
- **Purpose**: Ethereum RPC provider for ENS lookups
- **Website**: https://www.infura.io/
- **Free Tier**: Yes, 100,000 requests/day
- **Setup**: Sign up, create project, copy project ID

### Alchemy (Alternative to Infura)
- **Purpose**: Ethereum RPC provider for ENS lookups
- **Website**: https://www.alchemy.com/
- **Free Tier**: Yes, 300M compute units/month
- **Setup**: Sign up, create app, copy API key

### Magic.link
- **Purpose**: Passwordless email authentication
- **Website**: https://magic.Link
- **Free Tier**: Yes, 1,000 MAUs
- **Setup**: Sign up, create app, copy keys

### Mapbox
- **Purpose**: Interactive maps with 3D buildings
- **Website**: https://www.mapbox.com/
- **Free Tier**: Yes, 50,000 map loads/month
- **Setup**: Sign up, create access token

### Google Cloud
- **Purpose**: Cloud hosting and deployment
- **Website**: https://cloud.google.com/
- **Free Tier**: Yes, $300 credit for 90 days + always free tier
- **Setup**: Create account, enable Cloud Run API

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
