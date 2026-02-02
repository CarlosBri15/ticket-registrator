FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

RUN npm install

COPY backend ./backend
COPY shared ./shared

RUN npm run build -w shared

RUN npm run build -w backend

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=8080

WORKDIR /app

COPY package*.json ./

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/shared/dist ./node_modules/@mi-app/shared/dist

EXPOSE 8080

CMD ["node", "dist/main.js"]