# Build stage
FROM --platform=linux/amd64 node:22-alpine AS build

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
FROM --platform=linux/amd64 node:22-alpine

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
COPY docker/ecosystem.config.cjs ./ecosystem.config.cjs

# Verify files are in place
RUN echo "=== Verifying build ===" && \
    ls -la && \
    ls -la server/src/ && \
    ls -la client-svelte/dist/ && \
    cat ecosystem.config.cjs && \
    echo "=== Node version ===" && \
    node --version && \
    echo "=== PM2 version ===" && \
    pm2 --version && \
    echo "=== Architecture ===" && \
    uname -m

# Set environment
ENV NODE_ENV=production

# Expose port (Cloud Run uses 8080 by default)
EXPOSE 8080

# Health check - use /api/health endpoint
HEALTHCHECK --interval=15s --timeout=3s --retries=10 --start-period=20s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Override the default entrypoint and use node directly
ENTRYPOINT []
CMD ["node", "server/src/index.js"]
