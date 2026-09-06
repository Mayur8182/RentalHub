#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# RentalHub — EC2 First-Time Setup
# EC2 IP   : 44.220.153.2
# Domain   : rentcarhub.duckdns.org  (DuckDNS)
# GitHub   : https://github.com/Mayur8182/RentalHub.git
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="rentcarhub.duckdns.org"
REPO="https://github.com/Mayur8182/RentalHub.git"
APP_DIR="/home/ubuntu/RentalHub"

echo "======================================================"
echo " RentalHub EC2 Setup — $DOMAIN"
echo "======================================================"

# ── 1. System update ────────────────────────────────────────────────────────
echo ""
echo "▶ [1/8] System update..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ── 2. Install Docker ────────────────────────────────────────────────────────
echo ""
echo "▶ [2/8] Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
                        docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker ubuntu
echo "Docker installed: $(docker --version)"

# ── 3. Install Git ───────────────────────────────────────────────────────────
echo ""
echo "▶ [3/8] Installing Git..."
sudo apt-get install -y git

# ── 4. Clone repo ────────────────────────────────────────────────────────────
echo ""
echo "▶ [4/8] Cloning repository..."
if [ -d "$APP_DIR" ]; then
  echo "Repo already exists — pulling latest..."
  cd "$APP_DIR" && git pull origin main
else
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 5. Create secret files ───────────────────────────────────────────────────
echo ""
echo "▶ [5/8] Creating environment files..."

# Generate a random JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || \
             openssl rand -hex 64)

cat > "$APP_DIR/backend/.env.production" << EOF
PORT=5000
NODE_ENV=production

# ⚠️  EDIT THIS: Replace with your MongoDB Atlas connection string
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/rentalhub?retryWrites=true&w=majority

JWT_SECRET=${JWT_SECRET}

FRONTEND_URL=http://${DOMAIN}
EOF

cat > "$APP_DIR/frontend/.env.production" << EOF
VITE_API_URL=http://${DOMAIN}
EOF

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ⚠️  ACTION REQUIRED                                      ║"
echo "║  Edit backend/.env.production and set your MONGO_URI     ║"
echo "║  (MongoDB Atlas connection string)                        ║"
echo "║                                                           ║"
echo "║  nano $APP_DIR/backend/.env.production                   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
read -p "Press Enter after editing MONGO_URI to continue..."

# ── 6. Create required directories ───────────────────────────────────────────
echo ""
echo "▶ [6/8] Creating directories..."
mkdir -p "$APP_DIR/nginx/ssl" "$APP_DIR/nginx/logs"
sudo mkdir -p /var/www/certbot

# ── 7. Optional: Get free SSL cert with Certbot ──────────────────────────────
echo ""
echo "▶ [7/8] SSL Certificate (Let's Encrypt)..."
echo "   DuckDNS supports HTTPS via Let's Encrypt."
read -p "   Get free SSL cert now? (y/N): " GET_SSL

if [[ "${GET_SSL,,}" == "y" ]]; then
  sudo apt-get install -y certbot
  # Stop any process on port 80 first
  sudo systemctl stop nginx 2>/dev/null || true

  sudo certbot certonly --standalone \
    -d "$DOMAIN" \
    --agree-tos --non-interactive \
    --email admin@$DOMAIN

  # Copy certs
  sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem "$APP_DIR/nginx/ssl/"
  sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem   "$APP_DIR/nginx/ssl/"
  sudo chown ubuntu:ubuntu "$APP_DIR/nginx/ssl/"*.pem

  # Enable HTTPS block in nginx config
  sed -i 's/^# server {/server {/' "$APP_DIR/nginx/proxy.conf"
  sed -i 's/^# //' "$APP_DIR/nginx/proxy.conf"
  echo "   ✅ SSL certificate installed."

  # Auto-renew cron
  (sudo crontab -l 2>/dev/null; echo "0 3 * * 1 certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem $APP_DIR/nginx/ssl/ && docker compose -f $APP_DIR/docker-compose.yml restart nginx-proxy") | sudo crontab -
  echo "   ✅ Auto-renewal cron set."
else
  echo "   Skipped — site will run on HTTP only."
fi

# ── 8. Build and start containers ────────────────────────────────────────────
echo ""
echo "▶ [8/8] Building and starting containers..."
cd "$APP_DIR"

# Need to re-login for docker group — use sg for current session
sg docker -c "docker compose up -d --build"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ RentalHub is LIVE!                                    ║"
echo "║                                                           ║"
echo "║  🌐  http://rentcarhub.duckdns.org                       ║"
echo "║  🔌  Backend: http://44.220.153.2:5000                   ║"
echo "║                                                           ║"
echo "║  Useful commands:                                         ║"
echo "║  docker compose ps           — check status              ║"
echo "║  docker compose logs -f      — view all logs             ║"
echo "║  docker compose restart      — restart all               ║"
echo "╚══════════════════════════════════════════════════════════╝"
