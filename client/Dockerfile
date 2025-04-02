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
FROM nginx:alpine AS production

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy built assets from the previous stage
COPY --from=builder /app/dist ./

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
