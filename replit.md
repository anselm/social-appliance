# Replit view of Social Appliance

## Overview

This is a from-the-ground-up implementation of a social networking site; the intent will be to support federated protocols. It should also be a reasonable content presentation system / static portfolio site for creatives.

There are multiple clients, the client-svelte is a svelte based interface. There is an idea of static ".info.js" files that can be used to statically define state on the client side.

## System Architecture

### Frontend
- **Multiple Frontends**: Console, Svelte, React (deprecated)
- **Svelte SPA**: Svelte, es6, typescript, tailwind, vite, this is now our main focus
- **Client-Side DB**: IndexedDB, optionally Dexie, static caching, full text search
- **Client-Side Seed Data**: Seed data can be dynamically fetched from public/.info.js and child folders.

### Server
- **Express Server**: Lightweight server primarily for development and serving static assets
- **File System Access**: Server provides access to filesystem-based content via HTTP
- **Database Integration**: MongoDB
- **Seed Data**: Seed-Data folder for optional content

