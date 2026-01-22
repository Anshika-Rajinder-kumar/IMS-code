# Wissen IMS - Development Mode Startup Script
# This script starts backend and frontend in development mode (without Docker)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Wissen IMS - Development Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Java is installed
Write-Host "Checking Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✓ Java is installed: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Java is not installed!" -ForegroundColor Red
    Write-Host "Please install Java 17+ from https://adoptium.net/" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check if Node is installed
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgRunning = docker ps --filter "name=wissen-postgres" --format "{{.Names}}" 2>$null
if (-not $pgRunning) {
    Write-Host "PostgreSQL not running, starting with Docker..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Start-Sleep -Seconds 5
    Write-Host "✓ PostgreSQL started" -ForegroundColor Green
} else {
    Write-Host "✓ PostgreSQL is already running" -ForegroundColor Green
}
Write-Host ""

# Install frontend dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Start backend in new terminal
Write-Host "Starting backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Starting Spring Boot Backend...' -ForegroundColor Cyan; .\mvnw spring-boot:run"
Write-Host "✓ Backend starting in new terminal" -ForegroundColor Green
Write-Host ""

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Development servers starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend" -ForegroundColor Yellow
Write-Host "Close the backend terminal to stop the backend" -ForegroundColor Yellow
Write-Host ""

npm run dev
