Write-Host "Checking production configuration..." -ForegroundColor Yellow

$allGood = $true

# Check frontend env
if (Test-Path "frontend/.env.production") {
    $frontendEnv = Get-Content "frontend/.env.production" -Raw
    if ($frontendEnv -match "VITE_API_URL=http://rentcarhub\.duckdns\.org:5000") {
        Write-Host "✅ Frontend API URL OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend API URL issue" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "❌ Frontend .env.production missing" -ForegroundColor Red
    $allGood = $false
}

# Check backend env
if (Test-Path "backend/.env.production") {
    Write-Host "✅ Backend .env.production exists" -ForegroundColor Green
} else {
    Write-Host "❌ Backend .env.production missing" -ForegroundColor Red
    $allGood = $false
}

# Check docker compose
if (Test-Path "docker-compose.yml") {
    $dockerCompose = Get-Content "docker-compose.yml" -Raw
    if ($dockerCompose -match "VITE_API_URL: http://rentcarhub\.duckdns\.org:5000") {
        Write-Host "✅ Docker compose API URL OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker compose API URL issue" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "❌ docker-compose.yml missing" -ForegroundColor Red
    $allGood = $false
}

if ($allGood) {
    Write-Host ""
    Write-Host "✅ Configuration looks good for production!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Some issues found. Fix them before deploying." -ForegroundColor Red
}