FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
# Copy workspace package files
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies (this will also link workspaces)
RUN npm install

# Copy source code
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

# Build shared first, then backend
RUN npm run build -w @ticket-registrator/shared
RUN npm run build -w backend

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=8080

WORKDIR /app

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install only production dependencies
RUN npm install --omit=dev

# Copy built assets from builder
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

EXPOSE 8080

# Run the backend from its workspace directory or via root script
CMD ["node", "packages/backend/dist/main.js"]
