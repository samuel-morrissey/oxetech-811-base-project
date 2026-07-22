# --- Etapa de Build ---
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci
COPY prisma ./prisma
COPY tsconfig.json .
COPY src ./src
RUN npm run build

# --- Etapa de Runner ---
FROM node:lts-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]