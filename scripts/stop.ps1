# Wissen IMS - Stop Script
# This script will stop all running containers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Wissen Intern Management System" -ForegroundColor Cyan
Write-Host "  Stopping Application..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop containers
Write-Host "Stopping containers..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ All containers stopped successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to stop containers" -ForegroundColor Red
    exit 1
}

Write-Host ""
$removeVolumes = Read-Host "Remove database data? (y/n) [This will delete all data!]"

if ($removeVolumes -eq 'y' -or $removeVolumes -eq 'Y') {
    Write-Host "Removing volumes..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "✓ Database data removed" -ForegroundColor Green
} else {
    Write-Host "Database data preserved" -ForegroundColor Green
}

Write-Host ""
Write-Host "Application stopped! 🛑" -ForegroundColor Green
