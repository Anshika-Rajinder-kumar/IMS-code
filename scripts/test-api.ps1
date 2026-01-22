# Wissen IMS Backend API Testing Script
# Run this script to test all major API endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Wissen IMS Backend API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api"
$token = ""

# Test 1: Health Check
Write-Host "[TEST 1] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/dashboard/stats" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is responding" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not responding. Make sure Docker containers are running." -ForegroundColor Red
    Write-Host "   Run: docker-compose ps" -ForegroundColor Gray
    exit
}

Write-Host ""

# Test 2: Register Admin User
Write-Host "[TEST 2] Registering Admin User..." -ForegroundColor Yellow
$registerData = @{
    name = "Test Admin"
    email = "admin@wissen.com"
    password = "Admin@123"
    userType = "ADMIN"
    active = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerData -ContentType "application/json" -ErrorAction Stop
    $token = $response.token
    Write-Host "✅ User registered successfully" -ForegroundColor Green
    Write-Host "   Email: admin@wissen.com" -ForegroundColor Gray
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  User already exists, trying login..." -ForegroundColor Yellow
        
        # Test 3: Login
        $loginData = @{
            email = "admin@wissen.com"
            password = "Admin@123"
            userType = "ADMIN"
        } | ConvertTo-Json
        
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
            $token = $response.token
            Write-Host "✅ Login successful" -ForegroundColor Green
            Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
        } catch {
            Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
            exit
        }
    } else {
        Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
        exit
    }
}

Write-Host ""

# Create Authorization Header
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 4: Create College
Write-Host "[TEST 4] Creating a College..." -ForegroundColor Yellow
$collegeData = @{
    name = "IIT Mumbai"
    location = "Mumbai, Maharashtra"
    contactPerson = "Dr. Sharma"
    contactEmail = "sharma@iitmumbai.ac.in"
    contactPhone = "+91-22-1234-5678"
    status = "VISITED"
    visitDate = "2026-01-15T10:00:00"
    notes = "Premier engineering institute"
} | ConvertTo-Json

try {
    $college = Invoke-RestMethod -Uri "$baseUrl/colleges" -Method Post -Body $collegeData -Headers $headers
    $collegeId = $college.id
    Write-Host "✅ College created successfully" -ForegroundColor Green
    Write-Host "   ID: $collegeId | Name: $($college.name)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create college: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Get All Colleges
Write-Host "[TEST 5] Fetching All Colleges..." -ForegroundColor Yellow
try {
    $colleges = Invoke-RestMethod -Uri "$baseUrl/colleges" -Method Get -Headers $headers
    Write-Host "✅ Retrieved $($colleges.Count) college(s)" -ForegroundColor Green
    $colleges | ForEach-Object { 
        Write-Host "   - $($_.name) ($($_.location))" -ForegroundColor Gray 
    }
} catch {
    Write-Host "❌ Failed to fetch colleges: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Create Intern
Write-Host "[TEST 6] Creating an Intern..." -ForegroundColor Yellow
$internData = @{
    name = "Rahul Kumar"
    email = "rahul.kumar@example.com"
    phone = "+91-98765-43210"
    college = @{
        id = $collegeId
    }
    degree = "B.Tech"
    branch = "Computer Science"
    graduationYear = 2026
    cgpa = 8.5
    status = "APPLIED"
    appliedDate = "2026-01-18T09:00:00"
    skills = "Java, Spring Boot, React, PostgreSQL"
} | ConvertTo-Json

try {
    $intern = Invoke-RestMethod -Uri "$baseUrl/interns" -Method Post -Body $internData -Headers $headers
    $internId = $intern.id
    Write-Host "✅ Intern created successfully" -ForegroundColor Green
    Write-Host "   ID: $internId | Name: $($intern.name) | Status: $($intern.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create intern: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Update Intern Status
Write-Host "[TEST 7] Updating Intern Status..." -ForegroundColor Yellow
try {
    $updatedIntern = Invoke-RestMethod -Uri "$baseUrl/interns/$internId/status?status=SHORTLISTED" -Method Patch -Headers $headers
    Write-Host "✅ Intern status updated" -ForegroundColor Green
    Write-Host "   Status: $($updatedIntern.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to update status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Search Interns
Write-Host "[TEST 8] Searching Interns..." -ForegroundColor Yellow
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/interns/search?query=Rahul" -Method Get -Headers $headers
    Write-Host "✅ Found $($searchResults.Count) intern(s)" -ForegroundColor Green
    $searchResults | ForEach-Object { 
        Write-Host "   - $($_.name) ($($_.email))" -ForegroundColor Gray 
    }
} catch {
    Write-Host "❌ Search failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 9: Create Offer
Write-Host "[TEST 9] Creating an Offer..." -ForegroundColor Yellow
$offerData = @{
    intern = @{
        id = $internId
    }
    position = "Software Development Intern"
    department = "Engineering"
    stipend = 25000.00
    currency = "INR"
    duration = 6
    startDate = "2026-03-01"
    endDate = "2026-08-31"
    workMode = "HYBRID"
    location = "Mumbai, India"
    status = "DRAFT"
    benefits = "Meals, Transportation, Learning Resources"
} | ConvertTo-Json

try {
    $offer = Invoke-RestMethod -Uri "$baseUrl/offers" -Method Post -Body $offerData -Headers $headers
    $offerId = $offer.id
    Write-Host "✅ Offer created successfully" -ForegroundColor Green
    Write-Host "   ID: $offerId | Position: $($offer.position) | Stipend: ₹$($offer.stipend)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create offer: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 10: Get Dashboard Stats
Write-Host "[TEST 10] Fetching Dashboard Statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/dashboard/stats" -Method Get -Headers $headers
    Write-Host "✅ Dashboard stats retrieved" -ForegroundColor Green
    Write-Host "   Total Colleges: $($stats.totalColleges)" -ForegroundColor Gray
    Write-Host "   Total Interns: $($stats.totalInterns)" -ForegroundColor Gray
    Write-Host "   Total Offers: $($stats.totalOffers)" -ForegroundColor Gray
    Write-Host "   Active Interns: $($stats.activeInterns)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to fetch stats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Suite Completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Login with: admin@wissen.com / Admin@123" -ForegroundColor White
Write-Host "3. Explore the UI and test all features" -ForegroundColor White
Write-Host ""
