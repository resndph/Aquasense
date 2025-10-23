FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json yarn.lock* ./
RUN corepack enable || true
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

HEALTHCHECK --interval=10s --timeout=3s --retries=10 CMD wget -qO- http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["node", "src/server.js"]

