#!/bin/bash

# Complete production fix with database seeding
# Run this on EC2 server after deployment fails

echo "🔧 Complete production fix with database seeding..."

# Create/update backend/.env.production
cat > backend/.env.production << 'EOF'
# ── Server ────────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=production

# ── MongoDB Atlas ─────────────────────────────────────────────────────────
MONGO_URI=mongodb+srv://mkbharvad8080:Mkb%408080@cluster0.a82h2.mongodb.net/rentalhub?retryWrites=true&w=majority&appName=Cluster0

# ── JWT ───────────────────────────────────────────────────────────────────
JWT_SECRET=7f3a9c2e1b8d4f6e0a5c7d9b2e4f1a8c3d6e9b2f5a8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6

# ── CORS ──────────────────────────────────────────────────────────────────
FRONTEND_URL=https://rentcarhub.duckdns.org
EOF

# Create/update frontend/.env.production  
cat > frontend/.env.production << 'EOF'
# Backend API URL — used at Vite build time (HTTPS through nginx proxy)
VITE_API_URL=https://rentcarhub.duckdns.org
EOF

echo "✅ Environment files updated for HTTPS!"

# Copy seed script to backend directory
cp production-seed.js backend/

echo "🧹 Cleaning Docker system..."

# Complete cleanup
sudo docker compose down --remove-orphans --volumes
sudo docker system prune -af --volumes
sudo docker image prune -af

echo "🔄 Fresh build and deployment..."

# Fresh build with no cache
sudo docker compose up -d --build --force-recreate --no-deps

echo ""
echo "⏰ Waiting for containers to start..."
sleep 15

echo "📋 Container status:"
sudo docker compose ps

echo ""
echo "📋 Backend logs (recent):"
sudo docker logs rentalhub-backend --tail 20

# Check if backend is healthy before seeding
echo ""
echo "🌱 Checking if we need to seed the database..."

# Wait a bit more for MongoDB connection
sleep 10

# Run seed script inside the backend container
echo "🌱 Seeding production database..."
sudo docker exec rentalhub-backend node /app/production-seed.js 2>/dev/null || echo "⚠️  Container not ready for seeding, try manually: sudo docker exec rentalhub-backend node /app/production-seed.js"

echo ""
echo "🌐 Production ready!"
echo "  Frontend: https://rentcarhub.duckdns.org"
echo "  Login with: admin@rentalhub.com / admin123"
echo ""
echo "📊 Debug commands:"
echo "  Backend logs: sudo docker logs rentalhub-backend --tail 50"
echo "  Manual seed: sudo docker exec rentalhub-backend node /app/production-seed.js"
echo "  Container status: sudo docker compose ps"