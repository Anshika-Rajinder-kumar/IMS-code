# Wissen IMS - Startup Script
# This script will start the complete application stack

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Wissen Intern Management System" -ForegroundColor Cyan
Write-Host "  Starting Application Stack..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "ERROR: docker-compose.yml not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# Stop existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null
Write-Host "✓ Stopped existing containers" -ForegroundColor Green
Write-Host ""

# Build images
Write-Host "Building Docker images (this may take a few minutes)..." -ForegroundColor Yellow
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to build Docker images!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Built Docker images successfully" -ForegroundColor Green
Write-Host ""

# Start services
Write-Host "Starting services..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start services!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Started all services" -ForegroundColor Green
Write-Host ""

# Wait for services to be healthy
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Service Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker-compose ps

# Display access information
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Application is Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor White
Write-Host "  Frontend:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend API:  http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "  Database:     localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs:" -ForegroundColor White
Write-Host "  docker-compose logs -f" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop the application:" -ForegroundColor White
Write-Host "  docker-compose down" -ForegroundColor Yellow
Write-Host ""
Write-Host "First time setup:" -ForegroundColor White
Write-Host "  1. Navigate to http://localhost:3000" -ForegroundColor Yellow
Write-Host "  2. Click 'Register' to create an admin account" -ForegroundColor Yellow
Write-Host "  3. Login with your credentials" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Open browser (optional)
$openBrowser = Read-Host "Open application in browser? (y/n)"
if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
    Start-Process "http://localhost:3000"
}

Write-Host "Done! 🚀" -ForegroundColor Green
