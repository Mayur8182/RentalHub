#!/bin/bash

# Fix production environment variables on EC2
# Run this on EC2 server after deployment fails

echo "🔧 Fixing production environment variables..."

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
echo "🔄 Restarting containers..."

# Rebuild and restart containers
sudo docker compose down
sudo docker compose up -d --build --remove-orphans

echo "🎉 Done! Check status with: sudo docker compose ps"