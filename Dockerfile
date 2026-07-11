# syntax=docker/dockerfile:1

# ---- Estagio de build ----
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependencias com o lockfile para builds reproduziveis
COPY package.json package-lock.json ./
RUN npm ci

# Compila o TypeScript para dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Estagio de runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Apenas dependencias de producao no runtime
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Codigo ja compilado
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Verifica a saude da API pelo endpoint /api/health
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Semeia o banco apenas se ainda nao existir e inicia a API
CMD ["sh", "-c", "[ -f data/db.json ] || node dist/seed.js; node dist/server.js"]
