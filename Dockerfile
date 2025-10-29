# ===== 0) Dev stage =====
FROM node:22-alpine AS dev
WORKDIR /app
# Install base tools and pin pnpm via Corepack
RUN apk add --no-cache libc6-compat ca-certificates \
 && corepack enable && corepack prepare pnpm@9.12.0 --activate
# Pre-install dependencies to speed up first run (source code will be bind-mounted in compose)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
# Expose dev server port and run Next.js in dev mode (HMR enabled)
EXPOSE 3000
CMD ["pnpm", "dev"]


# ===== 1) Build stage =====
FROM node:22-alpine AS builder
WORKDIR /app

# Install musl compatibility libs for common native deps (e.g., sharp)
RUN apk add --no-cache libc6-compat

# Pin pnpm via corepack to avoid version drift
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
# Important: ensure next.config.js has { output: 'standalone' }
ENV NODE_ENV=production
RUN pnpm build

# ===== 2) Runtime stage =====
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Run as non-root user
RUN addgroup -g 1001 nodejs && adduser -S nextjs -u 1001
USER nextjs

# Copy only the runtime artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
