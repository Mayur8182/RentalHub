#!/bin/bash

# Complete production login fix with comprehensive debugging
echo "🔧 Production login fix with enhanced debugging..."

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

echo "✅ Environment files updated!"

# Copy debug scripts to backend directory
cp debug-login.js backend/
cp production-seed.js backend/
cp test-api-internal.js backend/

echo "🧹 Complete Docker cleanup..."
sudo docker compose down --remove-orphans --volumes
sudo docker system prune -af --volumes

echo "🔄 Fresh build..."
sudo docker compose up -d --build --force-recreate --no-deps

echo ""
echo "⏰ Waiting for services to start..."
sleep 20

echo "📋 Container status:"
sudo docker compose ps

echo ""
echo "📋 Backend logs (initial):"
sudo docker logs rentalhub-backend --tail 30

echo ""
echo "🔍 Enhanced diagnostics..."

# Test 1: Enhanced debug
echo "1. Running enhanced login diagnostics..."
sudo docker exec rentalhub-backend node /app/debug-login.js 2>/dev/null || echo "⚠️  Debug script failed"

# Test 2: Internal API test  
echo ""
echo "2. Testing internal API endpoints..."
sudo docker exec rentalhub-backend node /app/test-api-internal.js 2>/dev/null || echo "⚠️  API test failed"

# Test 3: External API test
echo ""
echo "3. Testing external API access..."
response=$(curl -s -X POST https://rentcarhub.duckdns.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@rentalhub.com", "password": "admin123"}' 2>/dev/null || echo "API unreachable")

echo "External API response: $response"

# Test 4: Check logs for errors
echo ""
echo "4. Recent backend logs:"
sudo docker logs rentalhub-backend --tail 20

echo ""
echo "🎯 Summary:"
echo "  Frontend: https://rentcarhub.duckdns.org"
echo "  Login: admin@rentalhub.com / admin123"
echo ""
echo "📊 Manual debug commands:"
echo "  Enhanced debug: sudo docker exec rentalhub-backend node /app/debug-login.js"
echo "  API test: sudo docker exec rentalhub-backend node /app/test-api-internal.js"
echo "  Seed data: sudo docker exec rentalhub-backend node /app/production-seed.js" 
echo "  Backend logs: sudo docker logs rentalhub-backend --tail 50"
echo "  Container status: sudo docker compose ps"

echo ""
echo "🔍 If login still fails, check the diagnostic output above for specific errors."