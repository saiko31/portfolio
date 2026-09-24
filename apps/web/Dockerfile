# Stage 1: Dependencies & Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root workspace and web package definitions
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/

# Install dependencies across workspaces
RUN npm install

# Copy source files
COPY apps/web/ ./apps/web/

# Build Astro with standalone Node adapter
RUN npm run build --workspace=@portfolio/web

# Stage 2: Minimal Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy root workspace dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Copy built application assets and server bundle
COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"]
