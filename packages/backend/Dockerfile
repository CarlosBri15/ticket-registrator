FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

RUN npm run build -w shared
RUN npm run build -w backend

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=8080

WORKDIR /app

COPY package*.json ./

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/shared/dist ./node_modules/@mi-app/shared/dist

EXPOSE 8080

CMD ["node", "dist/main.js"]