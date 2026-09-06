#!/bin/bash

# Fix production MongoDB connection issues on EC2
# Run this on EC2 server after deployment fails

echo "🔧 Fixing MongoDB connection issues..."

# Create/update backend/.env.production with correct MongoDB URL
cat > backend/.env.production << 'EOF'
# ── Server ────────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=production

# ── MongoDB Atlas ─────────────────────────────────────────────────────────
MONGO_URI=mongodb+srv://mkbharvad8080:Mkb%408080@cluster0.a82h2.mongodb.net/rentalhub?retryWrites=true&w=majority&appName=Cluster0

# ── JWT ───────────────────────────────────────────────────────────────────
JWT_SECRET=7f3a9c2e1b8d4f6e0a5c7d9b2e4f1a8c3d6e9b2f5a8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6

# ── CORS ──────────────────────────────────────────────────────────────────
FRONTEND_URL=http://rentcarhub.duckdns.org:3000
EOF

# Create/update frontend/.env.production
cat > frontend/.env.production << 'EOF'
# Backend API URL — used at Vite build time
VITE_API_URL=http://rentcarhub.duckdns.org:5000
EOF

echo "✅ Environment files updated!"
echo "🧹 Cleaning Docker cache..."

# Stop and remove all containers
sudo docker compose down --remove-orphans

# Remove old images to force fresh build
sudo docker image rm rentalhub-backend rentalhub-frontend rentalhub-proxy 2>/dev/null || true
sudo docker system prune -f

echo "🔄 Building and starting containers with fresh code..."

# Rebuild everything from scratch
sudo docker compose up -d --build --force-recreate

echo ""
echo "🎉 Done! Checking container status..."
sleep 10
sudo docker compose ps
echo ""
echo "📋 Backend logs:"
sudo docker logs rentalhub-backend --tail 10