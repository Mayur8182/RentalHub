#!/usr/bin/env pwsh

# ═══════════════════════════════════════════════════════════════════════════
# RentalHub Production Configuration Validator
# ═══════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RentalHub Production Config Validator              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Check frontend .env.production
Write-Host "▶ Checking frontend/.env.production..." -ForegroundColor Yellow
if (Test-Path "frontend/.env.production") {
    $frontendEnv = Get-Content "frontend/.env.production" -Raw
    if ($frontendEnv -match "VITE_API_URL=http://rentcarhub\.duckdns\.org:5000") {
        Write-Host "  ✅ Frontend API URL configured correctly" -ForegroundColor Green
    } else {
        $errors += "❌ Frontend VITE_API_URL not configured properly"
    }
} else {
    $errors += "❌ frontend/.env.production file missing"
}

# Check backend .env.production  
Write-Host "▶ Checking backend/.env.production..." -ForegroundColor Yellow
if (Test-Path "backend/.env.production") {
    $backendEnv = Get-Content "backend/.env.production" -Raw
    if ($backendEnv -match "FRONTEND_URL=http://rentcarhub\.duckdns\.org:3000") {
        Write-Host "  ✅ Backend CORS URL configured correctly" -ForegroundColor Green
    } else {
        $errors += "❌ Backend FRONTEND_URL not configured properly"
    }
    if ($backendEnv -match "MONGO_URI=mongodb\+srv://") {
        Write-Host "  ✅ MongoDB URI configured" -ForegroundColor Green
    } else {
        $errors += "❌ MongoDB URI not configured"
    }
} else {
    $errors += "❌ backend/.env.production file missing"
}

# Check docker-compose.yml
Write-Host "▶ Checking docker-compose.yml..." -ForegroundColor Yellow
if (Test-Path "docker-compose.yml") {
    $dockerCompose = Get-Content "docker-compose.yml" -Raw
    if ($dockerCompose -match "VITE_API_URL: http://rentcarhub\.duckdns\.org:5000") {
        Write-Host "  ✅ Docker compose API URL configured correctly" -ForegroundColor Green
    } else {
        $errors += "❌ Docker compose VITE_API_URL not configured properly"
    }
} else {
    $errors += "❌ docker-compose.yml file missing"
}

# Check Fleet.jsx for hardcoded URLs
Write-Host "▶ Checking for hardcoded localhost URLs..." -ForegroundColor Yellow
if (Test-Path "frontend/src/pages/Fleet.jsx") {
    $fleetContent = Get-Content "frontend/src/pages/Fleet.jsx" -Raw
    if ($fleetContent -match "localhost:5000") {
        $errors += "❌ Fleet.jsx still contains hardcoded localhost URLs"
    } else {
        Write-Host "  ✅ No hardcoded localhost URLs found in Fleet.jsx" -ForegroundColor Green
    }
} else {
    $warnings += "⚠️ Fleet.jsx not found"
}

# Check server.js CORS configuration
Write-Host "▶ Checking server.js CORS configuration..." -ForegroundColor Yellow
if (Test-Path "backend/server.js") {
    $serverContent = Get-Content "backend/server.js" -Raw
    if ($serverContent -match "rentcarhub\.duckdns\.org:3000") {
        Write-Host "  ✅ Server CORS includes production frontend URL" -ForegroundColor Green
    } else {
        $errors += "❌ Server CORS not configured for production frontend"
    }
} else {
    $errors += "❌ backend/server.js file missing"
}

Write-Host ""
Write-Host "═══════════════════ VALIDATION RESULTS ═══════════════════" -ForegroundColor Cyan

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "WARNINGS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  $warning" -ForegroundColor Yellow
    }
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "ERRORS:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  $error" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "❌ Configuration validation FAILED" -ForegroundColor Red
    Write-Host "   Fix the errors above before deploying" -ForegroundColor Red
    exit 1
} else {
    Write-Host ""
    Write-Host "✅ All configuration checks PASSED" -ForegroundColor Green
    Write-Host "   Ready for production deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run deployment script with your key file" -ForegroundColor White
    Write-Host "  2. Wait for deployment to complete" -ForegroundColor White
    Write-Host "  3. Test at rentcarhub.duckdns.org" -ForegroundColor White
}

Write-Host ""