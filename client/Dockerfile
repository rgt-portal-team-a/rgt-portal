# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and pnpm-lock.yaml first for caching dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies only (no unnecessary dev dependencies in final build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the app files
COPY . .

# Build the app (adjust this if using a different framework)
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Enable pnpm in production
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile --prod

EXPOSE 8080
CMD ["pnpm", "run", "preview"]
