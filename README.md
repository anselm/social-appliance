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

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- MetaMask browser extension (for SIWE authentication)
- Magic.link account (for email authentication)
- Infura account (recommended for ENS name resolution)
- ImageMagick (optional, for generating PWA icons)

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

## PWA Icons

To generate PWA icons from your logo:

1. Place your logo at `assets/logo.png` (512x512 or larger recommended)
2. Make the script executable: `chmod +x scripts/generate-pwa-icons.sh`
3. Run the script: `./scripts/generate-pwa-icons.sh`
4. Icons will be generated in `client-svelte/public/`

The script generates:
- Multiple icon sizes (72x72 to 512x512) for various devices
- Apple Touch Icon (180x180) for iOS devices
- Favicons (16x16, 32x32, .ico) for browsers
- Maskable icon (512x512) for Android adaptive icons

**Requirements:**
- ImageMagick must be installed
  - macOS: `brew install imagemagick`
  - Ubuntu/Debian: `sudo apt-get install imagemagick`
  - Fedora: `sudo dnf install imagemagick`

## Project Structure

```
social-appliance/
├── server/                 # Node.js/Express API server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   │   ├── api.js     # Entity routes
│   │   │   └── auth.js    # Authentication routes
│   │   ├── middleware/    # Express middleware
│   │   │   └── auth.js    # Auth middleware
│   │   ├── services/      # Business logic
│   │   ├── db/           # Database connection
│   │   └── index.js      # Server entry point
│   └── package.json
├── client-svelte/         # Svelte frontend
│   ├── src/
│   │   ├── lib/          # Utilities and helpers
│   │   │   ├── auth.ts   # Auth API calls
│   │   │   ├── siwe.ts   # SIWE utilities
│   │   │   ├── magic.ts  # Magic.link setup
│   │   │   └── ens.ts    # ENS name resolution
│   │   ├── pages/        # Page components
│   │   │   ├── EntityView.svelte
│   │   │   ├── Admin.svelte
│   │   │   └── siwe-magic-login.svelte
│   │   ├── components/   # Reusable components
│   │   ├── stores/       # Svelte stores
│   │   └── App.svelte
│   └── package.json
├── client-console/        # Console-based client
├── seed-data/            # Sample data for development
├── scripts/              # Utility scripts
│   └── generate-pwa-icons.sh
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
  - Body: `{ message: string, signature: string }`
  - Returns: `{ address: string, appToken: string }`
- `POST /api/verify-magic` - Verify Magic.link DID token
  - Body: `{ didToken: string }`
  - Returns: `{ issuer: string, email: string, appToken: string }`
- `GET /api/me` - Get current user (requires auth)
- `POST /api/logout` - Logout current user

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

### 1. Full Server Deployment
Deploy the entire application with MongoDB:
1. Build the client: `npm run build`
2. Deploy the server with the built client
3. Set environment variables (MongoDB URI, secrets, etc.)
4. Start with: `npm start`

### 2. Serverless/Static Deployment
Deploy just the client as a static site:
1. Build the client: `npm run build`
2. Edit `client-svelte/dist/config.js` to set `serverless: true`
3. The app will use entities from `static.info.js` and cached data
4. Deploy the `client-svelte/dist` folder to any static host

### 3. PWA Installation
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

- **Change default secrets in production**: Update `SESSION_SECRET` and `JWT_SECRET` in your `.env` file
- **Use HTTPS in production**: Set `secure: true` for cookies
- **Keep Magic.link secret key secure**: Never commit to git
- **Keep Infura API key secure**: Never commit to git
- **Keep Mapbox token secure**: Never commit to git
- **Use environment variables**: For all secrets and configuration
- **Enable CORS properly**: Set `CORS_ORIGIN` to your production domain
- **Nonce expiration**: Nonces expire after 5 minutes to prevent replay attacks
- **JWT expiration**: Tokens expire after 7 days by default

## Development Tips

- Use `npm run dev` to run both server and client with hot reload
- Check server logs for authentication status on startup
- Use browser DevTools to inspect authentication tokens
- Test both authentication methods to ensure proper setup
- Monitor MongoDB for session and entity data
- Check browser console for ENS lookup status and results
- Test PWA features in Chrome DevTools → Application → Manifest

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
- Add to `client-svelte/.env` as `VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID`
- Check browser console for ENS lookup errors
- Without an API key, addresses will be displayed in truncated format (0x1234...5678)
- The app will fall back to public RPC endpoints, but these may be rate-limited

### Mapbox not loading
- Verify `VITE_MAPBOX_ACCESS_TOKEN` is set correctly
- Check browser console for Mapbox errors
- Ensure you have a valid Mapbox account and token
- Check that the token has the correct scopes

### CORS errors
- Verify `CORS_ORIGIN` matches your client URL
- Ensure `credentials: true` is set in fetch requests
- Check that server is running on the correct port

### Session not persisting
- Verify `SESSION_SECRET` is set
- Check cookie settings in browser
- Ensure `credentials: 'include'` in fetch requests

### PWA not installing
- Ensure HTTPS is enabled (required for PWA)
- Check manifest.json is accessible
- Verify all icon files exist
- Check browser console for PWA errors
- Test in Chrome DevTools → Application → Manifest

## External Services

### Infura (MetaMask/ConsenSys) - Recommended
- **Purpose**: Ethereum RPC provider for ENS lookups
- **Website**: https://www.infura.io/
- **Free Tier**: Yes, 100,000 requests/day
- **Setup**: Sign up, create project, copy project ID
- **Why Recommended**: Most reliable, owned by MetaMask, excellent uptime

### Alchemy (Alternative to Infura)
- **Purpose**: Ethereum RPC provider for ENS lookups
- **Website**: https://www.alchemy.com/
- **Free Tier**: Yes, 300M compute units/month
- **Setup**: Sign up, create app, copy API key

### Magic.link
- **Purpose**: Passwordless email authentication
- **Website**: https://magic.Link
- **Free Tier**: Yes, 1,000 MAUs
- **Setup**: Sign up, create app, copy publishable and secret keys

### Mapbox
- **Purpose**: Interactive maps with 3D buildings and satellite imagery
- **Website**: https://www.mapbox.com/
- **Free Tier**: Yes, 50,000 map loads/month
- **Setup**: Sign up, create access token

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
