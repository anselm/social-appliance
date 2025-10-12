# FEATURES - Oct 10 2025

## Mission statement / Core Value Prop:

"Help individuals and groups connect over shared passions - in person - in the real world."

## Fundamentals:

- **Social Network** - conventional social network patterns (join groups, post messages, sort posts by value to user...)
- **Place Sharing** - emphasis on location features; sharing location and favorite places

## Data Architecture:

- wiki like; allowing collective curation and organization of structured content and rich media
- uuids and slugs are based on a file system pattern (directed acyclic graph of human-readable path segments).
- many types of first class artifacts: groups, people, places, things, challenges, rewards, polls...
- A server or serverless mode; in serverless mode data is loaded from client from human legible files
- **Public key authentication** - in server mode a non-custodial public key (or using magic.link) avoids owning user identity.

## UX: Rich Media Interface:

There have been many efforts to build social networks for emphemeral place based experiences - I feel like these failed because the cost to reward ratio of entering new locations by typing them in is too much work. Services like Foursquare worked because they required a minimum of labor for some reward. To that end:

- **Swarm support** - map an area together by using video recognition for input (rather than typing stuff in)

- **Conversational Interactions** - encourage voice input instead of typing

- **LLM support** - llm based interactions and responses rather than search or tapping on icons as with traditional apps

## UX: Fundamentals:

- svelte 5 for web interface
- spa
- pwa
- tailwind
- fairly minimalist, black and white theme; light/dark mode support
- mobile first; responsive layout, pwa support, edge-to-edge layouts
- note that a bash console mode is available (although not tested as much as the web interface)

## Docker based deployment

- Google Cloud Run deployment with MongoDB Atlas
- PM2 process management
- Health checks and monitoring
- Stateless authentication (no server-side sessions)
- Permissive CORS (allows all origins)

- Image Recognition via docker
- LLM Support


