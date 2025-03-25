FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/copy-assets.js ./

ENV NODE_ENV=production

EXPOSE 8000

CMD ["node", "-r", "dotenv/config", "dist/index.js"]
