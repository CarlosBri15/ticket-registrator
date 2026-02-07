FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración de la raíz y de los paquetes
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

# Instalar TODAS las dependencias para poder compilar
RUN npm install

# Copiar el código fuente
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

# Compilar shared y luego backend
RUN npm run build -w @ticket-registrator/shared
RUN npm run build -w backend

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=8080

WORKDIR /app

# Copiamos los archivos de paquetes necesarios para la instalación de prod
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

# Instalamos solo dependencias de producción
# npm install en la raíz instalará las dependencias de todos los workspaces listados
RUN npm install --omit=dev

# Copiamos los archivos compilados desde el builder
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

EXPOSE 8080

# Ejecutamos el backend
CMD ["node", "packages/backend/dist/main.js"]