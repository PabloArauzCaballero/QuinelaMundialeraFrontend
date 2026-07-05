# --- Etapa 1: Construcción (Build) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias primero para aprovechar caché de capas
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa 2: Servidor Web de Producción (Nginx) ---
FROM nginx:alpine

# Copiar archivos compilados estáticos del frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la configuración de Nginx SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
