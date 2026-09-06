# ═══════════════════════════════════════════════════════════════════════════
# RentalHub — One-Click Deploy from Windows to EC2
# Run this in PowerShell:  .\deploy\deploy-now.ps1
# ═══════════════════════════════════════════════════════════════════════════

param(
    [string]$KeyPath = ".\your-key.pem"    # ← change to your .pem file path
)

$EC2_IP   = "44.220.153.2"
$EC2_USER = "ubuntu"
$DOMAIN   = "rentcarhub.duckdns.org"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RentalHub — Deploying to $EC2_IP          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check .pem file exists
if (-not (Test-Path $KeyPath)) {
    Write-Host "❌ Key file not found: $KeyPath" -ForegroundColor Red
    Write-Host "   Usage: .\deploy\deploy-now.ps1 -KeyPath 'C:\path\to\your-key.pem'"
    exit 1
}

Write-Host "▶ Connecting to EC2 and deploying..." -ForegroundColor Yellow

$commands = @"
set -e
echo '====== Checking Docker ======'
if ! command -v docker &> /dev/null; then
    echo 'Docker not found — running setup script...'
    cd /home/ubuntu
    git clone https://github.com/Mayur8182/RentalHub.git 2>/dev/null || true
    cd RentalHub
    bash deploy/ec2-setup.sh
else
    echo 'Docker found — updating and restarting...'
    cd /home/ubuntu/RentalHub 2>/dev/null || git clone https://github.com/Mayur8182/RentalHub.git /home/ubuntu/RentalHub && cd /home/ubuntu/RentalHub
    git pull origin main
    sudo docker compose up -d --build --remove-orphans
    sudo docker image prune -f
fi
echo ''
echo '✅ Done! Site: http://rentcarhub.duckdns.org'
sudo docker compose ps
"@

ssh -i $KeyPath -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_IP}" $commands

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "   🌐 http://$DOMAIN" -ForegroundColor Cyan
