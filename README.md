# Social Appliance

A decentralized social platform built with Node.js, MongoDB, and Svelte, featuring multiple authentication methods.

## Features

- **Multiple Authentication Methods:**
  - Sign-In with Ethereum (SIWE) via MetaMask
  - Passwordless email authentication via Magic.link
  - Stateless JWT token authentication

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
  - Docker Compose orchestration (requires external MongoDB)
  - Google Cloud Run deployment with MongoDB Atlas
  - PM2 process management
  - Health checks and monitoring
  - Stateless authentication (no server-side sessions)
  - Permissive CORS (allows all origins)

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or other external MongoDB service)
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

**Option 1: Run both server and client with hot reload (recommended for development):**
```bash
npm run dev
```
- Server runs on http://localhost:8080 (serves API + static files)
- Client dev server runs on http://localhost:8001 (with hot reload)

**Option 2: Run only the server (if client is already built):**
```bash
npm run build  # Build the client first
npm run server:only
```
- Server runs on http://localhost:8080 (serves API + built client from dist/)
- No need to run Vite dev server

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
- Serve the built Svelte app from `client-svelte/dist/` for all other routes
- Automatically seed the database if `LOAD_SEED_DATA` is not set to `false`

## Docker Deployment

### Local Docker Deployment with Docker Compose

Deploy the application locally with Docker Compose (requires external MongoDB):

1. **Set up MongoDB Atlas:**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string (mongodb+srv://...)
   - Whitelist your IP address or use 0.0.0.0/0 for testing

2. **Configure environment:**
```bash
cd docker
cp env-example.txt .env
# Edit .env with your MongoDB Atlas connection string and other values
```

3. **Deploy:**
```bash
npm run deploy
# or
npm run docker:deploy
```

This will:
- Build the Docker image (builds client and includes it in the image)
- Start the application with PM2 on port 8080
- Set up health checks and monitoring
- Connect to your external MongoDB service

4. **Access the application:**
- Local: http://localhost:8080

5. **Useful commands:**
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

4. **Configure environment variables in .env file:**
```bash
# Edit your .env file and add:
GCLOUD_PROJECT_ID=your-project-id
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social_appliance
JWT_SECRET=your-jwt-secret
MAGIC_SECRET_KEY=your-magic-secret-key
LOAD_SEED_DATA=true
```

5. **Deploy:**
```bash
npm run gcloud:run
```

The script will automatically read your `.env` file and:
- Build the Docker image (builds client and includes it)
- Push to Google Artifact Registry
- Deploy to Cloud Run on port 8080
- Configure environment variables
- Set up automatic scaling

6. **Access your application:**
   - Cloud Run will provide a URL like: https://social-appliance-xxxxx-uc.a.run.app

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
- **App Container:** Node.js application with PM2 cluster mode on port 8080
- **External MongoDB:** MongoDB Atlas or other external MongoDB service
- **Health Checks:** Automatic monitoring and restart
- **Networks:** Isolated network for security

**Cloud Run (Production):**
- **Stateless Container:** Node.js application with PM2 on port 8080
- **MongoDB Atlas:** Managed MongoDB database
- **Automatic HTTPS:** Provided by Cloud Run
- **Auto-scaling:** 0 to 10 instances based on traffic
- **Health Checks:** Built-in monitoring
- **Stateless Auth:** Client sends tokens with each request

### Environment Variables

**Local Development (.env):**
```bash
PORT=8080
CLIENTPORT=8001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social_appliance
DB_NAME=social_appliance
JWT_SECRET=your-jwt-secret
MAGIC_SECRET_KEY=your-magic-secret-key
LOAD_SEED_DATA=true
```

**Docker Compose (docker/.env):**
```bash
NODE_ENV=production
PORT=8080
DOMAIN=yourdomain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social_appliance
DB_NAME=social_appliance
MAGIC_SECRET_KEY=your_magic_secret_key
JWT_SECRET=your_jwt_secret
LOAD_SEED_DATA=true
FLUSH_DB=false
PM2_INSTANCES=max
```

**Cloud Run (root .env):**
```bash
GCLOUD_PROJECT_ID=your-project-id
GCLOUD_REGION=us-central1
GCLOUD_SERVICE_NAME=social-appliance
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/social_appliance
JWT_SECRET=your-jwt-secret
MAGIC_SECRET_KEY=your-magic-secret-key
DB_NAME=social_appliance
LOAD_SEED_DATA=true
FLUSH_DB=false
```

## Project Structure

```
social-appliance/
├── server/                 # Node.js/Express API server (port 8080)
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── db/           # Database connection
│   │   └── index.js      # Server entry point (serves API + static files)
│   └── package.json
├── client-svelte/         # Svelte frontend (dev server port 8001)
│   ├── src/
│   │   ├── lib/          # Utilities and helpers
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── stores/       # Svelte stores
│   │   └── App.svelte
│   ├── dist/             # Built client (served by server)
│   └── package.json
├── client-console/        # Console-based client
├── seed-data/            # Sample data for development
├── docker/               # Docker configuration
│   ├── Dockerfile        # Multi-stage build (builds client, runs server)
│   ├── docker-compose.yml # Service orchestration
│   ├── Caddyfile         # Caddy configuration
│   ├── ecosystem.config.cjs # PM2 configuration
│   └── env-example.txt   # Environment template
├── scripts/              # Utility scripts
│   ├── generate-pwa-icons.sh
│   ├── deploy-docker-compose.sh
│   └── deploy-gcloud-run.sh
├── assets/               # Source assets (logo, etc.)
└── package.json          # Root package.json
```

## Authentication

The application uses **stateless authentication** - the client sends authentication tokens with each request, and the server verifies them without maintaining session state. This makes the application fully stateless and perfect for serverless deployments like Cloud Run.

### Sign-In with Ethereum (SIWE)

SIWE allows users to authenticate using their Ethereum wallet through MetaMask.

**How it works:**
1. User clicks "Sign in with MetaMask"
2. Server generates a unique nonce
3. User signs a message containing the nonce with their wallet
4. Server verifies the signature and returns a JWT token
5. Client stores the token and sends it with each API request

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
4. Server verifies the DID token and returns a JWT token
5. Client stores the token and sends it with each API request

## CORS Configuration

The application uses permissive CORS handling - **all origins are allowed** by default. This simplifies development and deployment without compromising security since authentication is handled via JWT tokens.

## API Endpoints

### Authentication

- `GET /api/nonce` - Get a nonce for SIWE
- `POST /api/verify-siwe` - Verify SIWE signature and get JWT token
- `POST /api/verify-magic` - Verify Magic.link DID token and get JWT token
- `GET /api/me` - Get current user (requires JWT token in Authorization header)
- `POST /api/logout` - Logout (client-side token removal)

### Health

- `GET /api/health` - API health check

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
PORT=8080
CLIENTPORT=8001

# Database (MongoDB Atlas or other external MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social_appliance
DB_NAME=social_appliance

# Authentication
MAGIC_SECRET_KEY=sk_live_your_key
JWT_SECRET=your-jwt-secret

# Seed Data
LOAD_SEED_DATA=true

# Google Cloud (for deployment)
GCLOUD_PROJECT_ID=your-project-id
GCLOUD_REGION=us-central1
GCLOUD_SERVICE_NAME=social-appliance
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
Deploy with Docker Compose (requires external MongoDB):
```bash
npm run deploy
```
Includes: App (port 8080) + External MongoDB

### 2. Google Cloud Run (Recommended for Serverless)
Deploy to Google Cloud Run with MongoDB Atlas:
```bash
# Configure .env file first with GCLOUD_PROJECT_ID and MONGODB_URI
npm run gcloud:run
```
Includes: Stateless app (port 8080) + MongoDB Atlas + Auto-scaling

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

- **Change default secrets in production**: Update `JWT_SECRET`
- **Use HTTPS in production**: Cloud Run provides it automatically
- **Keep secrets secure**: Never commit `.env` files to git
- **Use environment variables**: For all secrets and configuration
- **CORS is permissive**: All origins allowed - security is handled via JWT tokens
- **Nonce expiration**: Nonces expire after 5 minutes
- **JWT expiration**: Tokens expire after 7 days by default
- **MongoDB Atlas**: Use IP whitelisting and strong passwords
- **Cloud Run**: Use Secret Manager for sensitive data
- **Stateless authentication**: No server-side session state to manage

## Development Tips

- Use `npm run dev` to run both server and client with hot reload
- Use `npm run server:only` to run just the server (if client is already built)
- Check server logs for authentication status on startup
- Use browser DevTools to inspect authentication tokens
- Test both authentication methods to ensure proper setup
- Monitor MongoDB for entity data
- Check browser console for ENS lookup status and results
- Test PWA features in Chrome DevTools → Application → Manifest
- Use `docker compose logs -f` to monitor container logs
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
- Check that port 8080 is not in use
- Verify `.env` file exists in `docker/` directory
- Check container logs: `docker compose logs -f`
- Restart services: `docker compose restart`
- Ensure MongoDB Atlas connection string is correct

### Cloud Run deployment issues
- Ensure gcloud CLI is installed and authenticated
- Verify `GCLOUD_PROJECT_ID` is set in `.env` file
- Check that MongoDB Atlas connection string is correct
- Whitelist Cloud Run IP ranges in MongoDB Atlas
- View logs: `gcloud run services logs read social-appliance`
- Check environment variables are set correctly in `.env`

### MongoDB Atlas connection issues
- Verify connection string format
- Check username and password are correct
- Whitelist IP addresses (0.0.0.0/0 for testing)
- Ensure cluster is running
- Check network access settings

### Authentication not working
- Verify JWT token is being sent in Authorization header
- Check that `JWT_SECRET` is set correctly
- Ensure token hasn't expired (7 day default)
- Check browser console for authentication errors

### PWA not installing
- Ensure HTTPS is enabled (required for PWA)
- Check manifest.json is accessible
- Verify all icon files exist
- Check browser console for PWA errors
- Test in Chrome DevTools → Application → Manifest

## External Services

### MongoDB Atlas (Required)
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
