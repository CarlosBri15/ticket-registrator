FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

RUN npm run build -w @ticket-registrator/shared
RUN npm run build -w backend

FROM node:22-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=8080

WORKDIR /app

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/drizzle ./packages/backend/drizzle
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

EXPOSE 8080

WORKDIR /app/packages/backend

CMD ["node", "dist/main.js"]