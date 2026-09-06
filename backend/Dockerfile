# ── Stage 1: install deps ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY . .

# ── Stage 2: production image ─────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=5 \
  CMD wget -qO- http://localhost:5000/ || exit 1

CMD ["node", "server.js"]
