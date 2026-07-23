# --- Etapa de Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json .
COPY src ./src
RUN npm run build

# --- Etapa de Runner ---
FROM node:20-alpine AS runner
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