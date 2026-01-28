# Wissen IMS API Testing Guide

This guide provides examples for testing all API endpoints using PowerShell, curl, and Postman.

## Setup

### Base URL
```
http://localhost:8080/api
```

### Authentication
Most endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## PowerShell Examples

### 1. Register User
```powershell
$body = @{
    fullName = "Your Name"
    email = "your-email@domain.com"
    password = "YourSecurePassword123"
    userType = "ADMIN"
    department = "HR"
    phone = "9876543210"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 2. Login
```powershell
$body = @{
    email = "your-email@domain.com"
    password = "YourSecurePassword123"
    userType = "ADMIN"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Save token for future requests
$token = $response.data.token
Write-Host "Token: $token"
```

### 3. Get Dashboard Stats
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard/stats" `
    -Method GET `
    -Headers $headers
```

### 4. Create College
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    name = "IIT Delhi"
    location = "New Delhi, India"
    coordinator = "Dr. Rajesh Kumar"
    email = "placement@iitd.ac.in"
    phone = "9876543210"
    visitDate = "2024-06-15"
    slots = 50
    status = "SCHEDULED"
    notes = "Top tier college for campus recruitment"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/colleges" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### 5. Get All Colleges
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/colleges" `
    -Method GET `
    -Headers $headers
```

### 6. Create Intern
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    name = "Rahul Sharma"
    email = "rahul.sharma@example.com"
    phone = "9876543210"
    emergencyContact = "9876543211"
    collegeName = "IIT Delhi"
    branch = "Computer Science"
    cgpa = 8.5
    joinDate = "2024-07-01"
    address = "123 Main Street, Delhi"
    status = "DOCUMENT_PENDING"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/interns" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### 7. Upload Document
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

# Create multipart form data
$filePath = "C:\path\to\document.pdf"
$form = @{
    internId = "1"
    name = "Resume"
    type = "Resume"
    file = Get-Item -Path $filePath
}

Invoke-RestMethod -Uri "http://localhost:8080/api/documents/upload" `
    -Method POST `
    -Headers $headers `
    -Form $form
```

### 8. Create Offer
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    intern = @{ id = 1 }
    position = "Software Engineer Intern"
    department = "Engineering"
    stipend = 25000
    duration = 6
    startDate = "2024-07-01"
    location = "Bangalore"
    reportingManager = "John Doe"
    workMode = "ONSITE"
    status = "GENERATED"
    generatedBy = "your-email@domain.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/offers" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

## Curl Examples

### 1. Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Your Name",
    "email": "your-email@domain.com",
    "password": "YourSecurePassword123",
    "userType": "ADMIN",
    "department": "HR",
    "phone": "9876543210"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@domain.com",
    "password": "YourSecurePassword123",
    "userType": "ADMIN"
  }'
```

### 3. Get All Interns (with token)
```bash
curl -X GET http://localhost:8080/api/interns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Search Interns
```bash
curl -X GET "http://localhost:8080/api/interns/search?term=rahul" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Update Intern Status
```bash
curl -X PATCH "http://localhost:8080/api/interns/1/status?status=ACTIVE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Verify Document
```bash
curl -X PATCH "http://localhost:8080/api/documents/1/verify?verifiedBy=your-email@domain.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Send Offer
```bash
curl -X PATCH http://localhost:8080/api/offers/1/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Complete PowerShell Test Script

```powershell
# Complete API Test Script
$baseUrl = "http://localhost:8080/api"

Write-Host "===== Wissen IMS API Tests =====" -ForegroundColor Cyan

# 1. Register
Write-Host "`n1. Registering user..." -ForegroundColor Yellow
$registerBody = @{
    fullName = "Test Admin"
    email = "your-email@domain.com"
    password = "YourSecurePassword123"
    userType = "ADMIN"
    department = "HR"
    phone = "9876543210"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method POST -ContentType "application/json" -Body $registerBody
    Write-Host "✓ User registered successfully" -ForegroundColor Green
} catch {
    Write-Host "User already exists, continuing..." -ForegroundColor Yellow
}

# 2. Login
Write-Host "`n2. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "your-email@domain.com"
    password = "YourSecurePassword123"
    userType = "ADMIN"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
    -Method POST -ContentType "application/json" -Body $loginBody
$token = $loginResponse.data.token
Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray

# Set headers for authenticated requests
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3. Dashboard Stats
Write-Host "`n3. Getting dashboard stats..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$baseUrl/dashboard/stats" -Headers $headers
Write-Host "✓ Dashboard stats retrieved" -ForegroundColor Green
Write-Host "Total Colleges: $($stats.data.totalColleges)" -ForegroundColor Gray
Write-Host "Total Interns: $($stats.data.totalInterns)" -ForegroundColor Gray

# 4. Create College
Write-Host "`n4. Creating college..." -ForegroundColor Yellow
$collegeBody = @{
    name = "Test College $(Get-Random)"
    location = "Test City"
    coordinator = "Test Coordinator"
    email = "test@college.com"
    phone = "9876543210"
    visitDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    slots = 50
    status = "SCHEDULED"
    notes = "Test college"
} | ConvertTo-Json

$college = Invoke-RestMethod -Uri "$baseUrl/colleges" `
    -Method POST -Headers $headers -Body $collegeBody
Write-Host "✓ College created with ID: $($college.data.id)" -ForegroundColor Green

# 5. Get All Colleges
Write-Host "`n5. Getting all colleges..." -ForegroundColor Yellow
$colleges = Invoke-RestMethod -Uri "$baseUrl/colleges" -Headers $headers
Write-Host "✓ Found $($colleges.data.Count) colleges" -ForegroundColor Green

# 6. Create Intern
Write-Host "`n6. Creating intern..." -ForegroundColor Yellow
$internBody = @{
    name = "Test Intern $(Get-Random)"
    email = "testintern$(Get-Random)@example.com"
    phone = "9876543210"
    emergencyContact = "9876543211"
    college = @{ id = $college.data.id }
    collegeName = $college.data.name
    branch = "Computer Science"
    cgpa = 8.5
    joinDate = (Get-Date).AddDays(60).ToString("yyyy-MM-dd")
    address = "Test Address"
    status = "DOCUMENT_PENDING"
} | ConvertTo-Json

$intern = Invoke-RestMethod -Uri "$baseUrl/interns" `
    -Method POST -Headers $headers -Body $internBody
Write-Host "✓ Intern created with ID: $($intern.data.id)" -ForegroundColor Green

# 7. Update Intern Status
Write-Host "`n7. Updating intern status..." -ForegroundColor Yellow
$updatedIntern = Invoke-RestMethod -Uri "$baseUrl/interns/$($intern.data.id)/status?status=ACTIVE" `
    -Method PATCH -Headers $headers
Write-Host "✓ Intern status updated to: $($updatedIntern.data.status)" -ForegroundColor Green

# 8. Create Offer
Write-Host "`n8. Creating offer..." -ForegroundColor Yellow
$offerBody = @{
    intern = @{ id = $intern.data.id }
    position = "Software Engineer Intern"
    department = "Engineering"
    stipend = 25000
    duration = 6
    startDate = (Get-Date).AddDays(60).ToString("yyyy-MM-dd")
    location = "Bangalore"
    reportingManager = "Test Manager"
    workMode = "ONSITE"
    status = "GENERATED"
    generatedBy = "your-email@domain.com"
} | ConvertTo-Json

$offer = Invoke-RestMethod -Uri "$baseUrl/offers" `
    -Method POST -Headers $headers -Body $offerBody
Write-Host "✓ Offer created with ID: $($offer.data.id)" -ForegroundColor Green

# 9. Get Intern's Offers
Write-Host "`n9. Getting intern's offers..." -ForegroundColor Yellow
$internOffers = Invoke-RestMethod -Uri "$baseUrl/offers/intern/$($intern.data.id)" `
    -Headers $headers
Write-Host "✓ Found $($internOffers.data.Count) offers for intern" -ForegroundColor Green

Write-Host "`n===== All Tests Completed Successfully! =====" -ForegroundColor Green
```

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Wissen IMS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"fullName\": \"Your Name\",\n  \"email\": \"your-email@domain.com\",\n  \"password\": \"YourSecurePassword123\",\n  \"userType\": \"ADMIN\",\n  \"department\": \"HR\",\n  \"phone\": \"9876543210\"\n}"
            },
            "url": "{{baseUrl}}/auth/register"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"your-email@domain.com\",\n  \"password\": \"YourSecurePassword123\",\n  \"userType\": \"ADMIN\"\n}"
            },
            "url": "{{baseUrl}}/auth/login"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": ["pm.collectionVariables.set('token', pm.response.json().data.token);"]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Colleges",
      "item": [
        {
          "name": "Get All Colleges",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": "{{baseUrl}}/colleges"
          }
        },
        {
          "name": "Create College",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"IIT Delhi\",\n  \"location\": \"New Delhi\",\n  \"coordinator\": \"Dr. Kumar\",\n  \"email\": \"placement@iitd.ac.in\",\n  \"phone\": \"9876543210\",\n  \"visitDate\": \"2024-06-15\",\n  \"slots\": 50,\n  \"status\": \"SCHEDULED\",\n  \"notes\": \"Top tier college\"\n}"
            },
            "url": "{{baseUrl}}/colleges"
          }
        }
      ]
    }
  ]
}
```

Save this test script as `test-api.ps1` and run:
```powershell
.\test-api.ps1
```
