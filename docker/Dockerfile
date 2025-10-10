# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client-svelte/package*.json ./client-svelte/

# Install dependencies with legacy peer deps to handle version conflicts
RUN cd server && npm ci
RUN cd client-svelte && npm ci --legacy-peer-deps

# Copy source files
COPY server ./server
COPY client-svelte ./client-svelte
COPY seed-data ./seed-data

# Build client
WORKDIR /app/client-svelte
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy built application
COPY --from=build /app/server ./server
COPY --from=build /app/client-svelte/dist ./client-svelte/dist
COPY --from=build /app/seed-data ./seed-data
COPY --from=build /app/package*.json ./

# Install production dependencies only
RUN cd server && npm ci --omit=dev

# Copy PM2 ecosystem config
COPY docker/ecosystem.config.js ./

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port (Cloud Run uses 8080 by default)
EXPOSE 8080

# Health check - use /api/health endpoint
HEALTHCHECK --interval=15s --timeout=3s --retries=10 --start-period=20s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
