#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# RentalHub — EC2 First-Time Setup
# EC2 IP   : 44.220.153.2
# Domain   : rentcarhub.duckdns.org
# GitHub   : https://github.com/Mayur8182/RentalHub.git
# MongoDB  : cluster0.a82h2.mongodb.net  (Atlas)
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="rentcarhub.duckdns.org"
REPO="https://github.com/Mayur8182/RentalHub.git"
APP_DIR="/home/ubuntu/RentalHub"
MONGO_URI="mongodb+srv://mkbharvad8080:Mkb%408080@cluster0.a82h2.mongodb.net/rentalhub?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="7f3a9c2e1b8d4f6e0a5c7d9b2e4f1a8c3d6e9b2f5a8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6"

echo "======================================================"
echo " RentalHub EC2 Setup"
echo " Domain : $DOMAIN"
echo " EC2 IP : 44.220.153.2"
echo "======================================================"

# ── 1. System update ────────────────────────────────────────────────────────
echo ""
echo "▶ [1/7] System update..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ── 2. Install Docker ────────────────────────────────────────────────────────
echo ""
echo "▶ [2/7] Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

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
echo "✅ Docker $(docker --version) installed"

# ── 3. Clone or update repo ──────────────────────────────────────────────────
echo ""
echo "▶ [3/7] Getting repository..."
if [ -d "$APP_DIR" ]; then
  echo "   Repo exists — pulling latest..."
  cd "$APP_DIR" && git pull origin main
else
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 4. Write production environment files ────────────────────────────────────
echo ""
echo "▶ [4/7] Writing environment files..."

cat > "$APP_DIR/backend/.env.production" << EOF
PORT=5000
NODE_ENV=production
MONGO_URI=${MONGO_URI}
JWT_SECRET=${JWT_SECRET}
FRONTEND_URL=http://${DOMAIN}
EOF

cat > "$APP_DIR/frontend/.env.production" << EOF
VITE_API_URL=http://${DOMAIN}
EOF

echo "   ✅ Environment files written."

# ── 5. Create required directories ───────────────────────────────────────────
echo ""
echo "▶ [5/7] Creating directories..."
mkdir -p "$APP_DIR/nginx/ssl" "$APP_DIR/nginx/logs"
sudo mkdir -p /var/www/certbot

# ── 6. Build and start containers ────────────────────────────────────────────
echo ""
echo "▶ [6/7] Building Docker images and starting containers..."
cd "$APP_DIR"
sudo docker compose up -d --build

# Wait for containers to start
echo "   Waiting for services to be healthy..."
sleep 15

# ── 7. Verify everything is running ──────────────────────────────────────────
echo ""
echo "▶ [7/7] Verifying deployment..."
sudo docker compose ps

echo ""
echo "Testing API endpoint..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/vehicles 2>/dev/null || echo "000")
if [ "$API_STATUS" = "200" ]; then
  echo "   ✅ API is responding (HTTP $API_STATUS)"
else
  echo "   ⚠️  API returned HTTP $API_STATUS — check logs: docker compose logs backend"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ RentalHub Deployment Complete!                           ║"
echo "║                                                              ║"
echo "║  🌐  http://rentcarhub.duckdns.org                          ║"
echo "║  �  EC2 direct: http://44.220.153.2                        ║"
echo "║                                                              ║"
echo "║  Seed the database (first time only):                        ║"
echo "║  docker compose exec backend node seedData.js               ║"
echo "║                                                              ║"
echo "║  View logs:                                                  ║"
echo "║  docker compose logs -f                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
