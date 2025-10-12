# FEATURES - Oct 10 2025

## Mission statement / Core Value Prop:

"Help individuals and groups connect over shared passions in the real world."

Core features:

- **Social Network** - social network patterns (join groups, post messages, sort posts by value to user...) but a strong emphasis on place, with security and privacy.

- **Place Sharing** - emphasis on location features; sharing location and favorite places - should be an industrial grade place archiving, sharing and curation service similar to the way pinterest is industrial grade image saving.

## ###################################################################
## low level
## ###################################################################

## Data Architecture:

- **wiki like**; allowing collective curation and organization of structured content and rich media
- uuids and slugs are based on a file system pattern (directed acyclic graph of human-readable path segments).
- many types of first class artifacts: groups, people, places, things, challenges, rewards, polls...
- A server or serverless mode; in serverless mode data is loaded from client from human legible files
- **Public key authentication** - in server mode a non-custodial public key (or using magic.link) avoids owning user identity.

## Docker based deployment

- Google Cloud Run deployment with MongoDB Atlas
- PM2 process management
- Health checks and monitoring
- Stateless authentication (no server-side sessions)
- Permissive CORS (allows all origins)

- Image Recognition via docker
- LLM Support

## ###################################################################
## UX PRINCIPLES
## ###################################################################

- **Conversational** - [TBD] There have been many efforts to build social networks for emphemeral place based experiences - I feel like these failed because the cost to reward ratio of entering new locations by typing them in is too much work. Services like Foursquare worked because they required a minimum of labor for some reward. To that end we will support voice input, video input, swarm generation of models of places by simply using video recognition together, llm assisted group interactions and anything we can do to get away from the clicking on buttons and typing stuff in pattern.

- **Basic UX Foundations** - Svelte 5, SPA, PWA, Tailwind, Typescript, ES6.

- **UX Aesthetics** - minimalist, black and white, large fonts, bold, - a good example of style http://aiaiai.com/ . Respect system light / dark.

- **Mobile First** - pull up overlays, swipe navigation, touch optimized controls, PWA, edge-to-edge layout...

- **Console Mode** - [Deprecated] note that a bash console mode is available (although not tested as much as the web interface)

## ###################################################################
## KINDS OF CONTENT
## ###################################################################

Currently only a few types:

- party (person)
- place
- group
- post (can cite rich media types)
- event

Relationships:

- favorites
- upvotes / downvotes / reactions
- follows

Later:

- Smart contracts, small challenges
- DAO Votes and proposal with outcomes
- Intelligent autonomous agents
- Things (books, other kinds of artifacts)
- MRV (Measurements Reporting and Verification)
- Aggregated data (weather data)

- blocking a person?
- annotations on a subject -> is this merely a post?
- reporting issues, bad posts and so on?
- reputational scoring; vouching for people and so on

## ###################################################################
## UX AREAS
## ###################################################################

### 1. User Authentication
- web3 auth
- Pseudonymous participation supported

### 2. Landing Page
- typical splash, landing page, calls to action, note open source community driven

### 3. Onboarding page
- help new users figure out what to do; may blend with home page

### 4. Home Page / List Views
- See lists of recent posts... like most websites...
- Enumerates recent posts with pagination
- Banner/header with current user, search bar, and "create post" button
- Wiki-style URL navigation

### 5. Map Views
- Interactive map showing nearby posts
- Distance calculations and radius-based queries
- Location obfuscation controls for privacy
- Filter by type, tags, time, author

### 6. Social Features
- Favorite posts and people
- Simple trust relationships (vouching)
- Content flagging and basic moderation

### 7. Search
- Full-text search
- Tag-based filtering
- Geospatial queries
- Wiki-style URL navigation

### 8. Posting new events
- **Post Types**: post, party, group, place, thing, event
- **Post Fields**: 
  - slug (wiki-style URLs)
  - title, content
  - location (lat/lng with optional radius)
  - tags
  - depiction URL
  - temporal data (for events)
- **Permissions**: Public by default, with optional group-based access control

### 9. Groups/Zones
- Support for groups
- Group pages show only posts belonging to that group
- Group-specific permissions and moderation
- Hierarchical zone organization
- Group admins and basic permissions
- Private Groups

## ###################################################################
## FUTURE THOUGHTS
## ###################################################################

### 1. Playful Elements
- Users can create challenges (posts of type "challenge")
- Post challenges and micro-rewards
- Location-based achievements
- Participation scoring
- Challenge responses and tracking
- Serendipitous discovery incentives

### 2. Enhanced Social Trust
- Social tapestry/web of trust
- Vouching and reputation system
- Trust-based content prioritization
- Anonymous but trusted participation

### 3. Stronger Content Moderation
- Profanity filtering
- Community reporting
- Pre-publication queue for new users
- Admin dashboard for moderation

### 4. Data Aggregation
- Weather and environmental data
- Event calendar integration
- Public transit overlays
- Civic data integration
- Integration with third-party APIs

### 5. Conversational Interface
- LLM-powered discovery assistant
- Natural language queries about places
- partylized recommendations
- Voice input support
- Proactive notifications

### 6. Rich Media
- Video and image posts
- Audio stories and place-based audio
- AR-ready data structures
- Camera-based input (reducing typing)
- Support for uploads and media management

### 7. Advanced Analytics
- Popularity and velocity algorithms
- Sentiment analysis
- Foot traffic patterns
- Community health metrics

### 8. Developer support
- Public API
- Embeddable widgets
- RSS feeds
- Third-party integrations

### 9. Monetization for participants
- Event promotion tools
- Local business features
- Professional analytics
- Grant and funding integration

### 10. Decentralization
- Public ledger integration (optional)
- Federated deployment support
- Data portability
- Community ownership models
- DAO-based group management

### 11. Other Later Features
- Micro-voting and polls
- DAO-like governance
- MRV (Monitoring, Reporting, Verification) systems
- Cross-platform social proof
- Real-time sensor data aggregation
- Advanced privacy controls and age-of-consent checks




