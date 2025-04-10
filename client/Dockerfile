# Stage 1: Build
FROM node:slim AS builder

# Set working directory
WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies only (no unnecessary dev dependencies in final build)
RUN npm ci --legacy-peer-deps

# Copy the rest of the app files
COPY . .

# Pass build arguments that can be used as env variables
ARG VITE_NODE_ENV
ARG VITE_API_URL
ARG VITE_BASE_URL
# Set them as environment variables
ENV VITE_NODE_ENV=$VITE_NODE_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

# Build the app (adjust this if using a different framework)
RUN npm run build

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
