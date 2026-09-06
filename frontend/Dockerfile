# ── Stage 1: build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Use npm install instead of npm ci to handle lock file mismatches
RUN npm install --legacy-peer-deps

COPY . .

# Inject API URL at build time
ARG VITE_API_URL=http://rentcarhub.duckdns.org
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: serve with Nginx ──────────────────────────────────────────────
FROM nginx:1.25-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/app.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
