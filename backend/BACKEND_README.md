# Wissen IMS Backend

Complete backend implementation for the Intern Management System with all features matching the UI.

## Features Implemented

### 1. Document Management
- **Document Model** with label, icon, description, and required fields
- **Upload API** with file handling
- **Verification/Rejection APIs** for HR/Admin
- **Download API** for documents
- **Intern-specific document endpoints**

### 2. Offer Management
- **Offer Model** with position, stipend, duration, location, work mode
- **Create/Update/Delete APIs**
- **Status management** (GENERATED, SENT, ACCEPTED, REJECTED)
- **Intern-specific offer endpoints**
- **Latest offer endpoint** for interns

### 3. Hiring Rounds
- **HiringRound Model** with round name, status, score, feedback
- **CRUD APIs** for managing hiring rounds
- **Status tracking** (PENDING, SCHEDULED, CLEARED, REJECTED)
- **Intern history** tracking for hiring process

### 4. Intern Management
- **Enhanced Intern Model** with hiring fields
- **Status management** through hiring pipeline
- **Document verification** status tracking
- **Search and filter APIs**

### 5. Dashboard & Analytics
- **Statistics API** for dashboard
- **College, Intern, and Offer metrics**
- **Status-based filtering**

## API Endpoints

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
```

### Documents
```
GET    /api/documents - Get all documents
GET    /api/documents/{id} - Get document by ID
GET    /api/documents/intern/{internId} - Get documents by intern
POST   /api/documents/upload - Upload document
PUT    /api/documents/{id}/verify - Verify document
PUT    /api/documents/{id}/reject - Reject document
GET    /api/documents/{id}/download - Download document
DELETE /api/documents/{id} - Delete document
```

### Offers
```
GET    /api/offers - Get all offers
GET    /api/offers/{id} - Get offer by ID
GET    /api/offers/intern/{internId} - Get offers by intern
GET    /api/offers/intern/{internId}/latest - Get latest offer for intern
POST   /api/offers - Create offer
PUT    /api/offers/{id} - Update offer
PATCH  /api/offers/{id}/send - Send offer
PATCH  /api/offers/{id}/accept - Accept offer
PATCH  /api/offers/{id}/reject - Reject offer
DELETE /api/offers/{id} - Delete offer
```

### Hiring Rounds
```
GET    /api/hiring-rounds - Get all hiring rounds
GET    /api/hiring-rounds/{id} - Get hiring round by ID
GET    /api/hiring-rounds/intern/{internId} - Get rounds by intern
POST   /api/hiring-rounds - Create hiring round
PUT    /api/hiring-rounds/{id} - Update hiring round
PATCH  /api/hiring-rounds/{id}/status - Update round status
DELETE /api/hiring-rounds/{id} - Delete hiring round
```

### Interns
```
GET    /api/interns - Get all interns
GET    /api/interns/{id} - Get intern by ID
GET    /api/interns/status/{status} - Get interns by status
POST   /api/interns - Create intern
PUT    /api/interns/{id} - Update intern
PATCH  /api/interns/{id}/status - Update intern status
DELETE /api/interns/{id} - Delete intern
```

### Colleges
```
GET    /api/colleges - Get all colleges
GET    /api/colleges/{id} - Get college by ID
POST   /api/colleges - Create college
PUT    /api/colleges/{id} - Update college
DELETE /api/colleges/{id} - Delete college
```

### Dashboard
```
GET /api/dashboard/stats - Get dashboard statistics
```

## Models

### Document
```java
- id: Long
- intern: Intern
- name: String
- label: String (e.g., "Aadhaar Card")
- icon: String (e.g., "🆔")
- description: String
- required: Boolean
- type: String (PDF, JPG, PNG, etc.)
- filePath: String
- size: String
- status: DocumentStatus (PENDING, VERIFIED, REJECTED)
- rejectionReason: String
- verifiedBy: String
- verifiedAt: LocalDateTime
- uploadedAt: LocalDateTime
```

### Offer
```java
- id: Long
- intern: Intern
- position: String
- department: String
- stipend: Integer
- duration: String
- startDate: LocalDate
- location: String
- reportingManager: String
- workMode: WorkMode (ONSITE, REMOTE, HYBRID)
- status: OfferStatus (GENERATED, SENT, ACCEPTED, REJECTED, EXPIRED)
- generatedBy: Long
- sentAt: LocalDateTime
- generatedAt: LocalDateTime
```

### HiringRound
```java
- id: Long
- intern: Intern
- roundName: String
- status: RoundStatus (PENDING, SCHEDULED, CLEARED, REJECTED)
- score: Integer
- feedback: String
- interviewer: String
- scheduledAt: LocalDateTime
- completedAt: LocalDateTime
- duration: Integer
```

### Intern
```java
- id: Long
- name: String
- email: String
- phone: String
- collegeName: String
- branch: String
- cgpa: String
- hiringRound: String
- hiringStatus: HiringStatus
- hiringScore: Integer
- status: InternStatus (DOCUMENT_PENDING, DOCUMENT_VERIFICATION, etc.)
```

## Configuration

### Database
PostgreSQL database configuration in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://postgres:5432/wissen_ims
spring.datasource.username=wissen_user
spring.datasource.password=wissen_password
```

### File Upload
```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=/app/uploads
```

### JWT
```properties
jwt.secret=wissenImsSecretKeyForJwtTokenGenerationAndValidation2026SecureKeyWith512BitsForHS512Algorithm
jwt.expiration=86400000
```

### CORS
```properties
cors.allowed-origins=http://localhost:3000,http://frontend:3000
```

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher
- PostgreSQL 14 or higher
- Docker (optional)

### Local Development

1. **Clone the repository**
```bash
cd backend
```

2. **Configure database**
```bash
# Create database
createdb wissen_ims

# Or use Docker
docker run --name postgres -e POSTGRES_DB=wissen_ims -e POSTGRES_USER=wissen_user -e POSTGRES_PASSWORD=wissen_password -p 5432:5432 -d postgres:14
```

3. **Build the project**
```bash
mvn clean install
```

4. **Run the application**
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080/api`

### Docker Deployment

```bash
# Build image
docker build -t wissen-ims-backend .

# Run container
docker run -p 8080:8080 --name ims-backend wissen-ims-backend
```

### Using Docker Compose

From the root directory:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 8080
- Frontend on port 3000

## Testing

### Using cURL

**Upload Document:**
```bash
curl -X POST http://localhost:8080/api/documents/upload \
  -F "internId=1" \
  -F "name=aadhaar.pdf" \
  -F "label=Aadhaar Card" \
  -F "icon=🆔" \
  -F "description=Government issued identity proof" \
  -F "type=PDF" \
  -F "file=@/path/to/aadhaar.pdf"
```

**Verify Document:**
```bash
curl -X PUT http://localhost:8080/api/documents/1/verify
```

**Create Offer:**
```bash
curl -X POST http://localhost:8080/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "intern": {"id": 1},
    "position": "Software Engineering Intern",
    "department": "Technology",
    "stipend": 25000,
    "duration": "6 months",
    "startDate": "2026-03-01",
    "location": "Bangalore",
    "reportingManager": "Rajesh Kumar",
    "workMode": "HYBRID"
  }'
```

## Database Schema

The application uses JPA with Hibernate for automatic schema generation. On first run, tables will be created automatically.

### Main Tables
- `users` - User authentication
- `interns` - Intern information
- `colleges` - College information
- `documents` - Document storage metadata
- `offers` - Offer letters
- `hiring_rounds` - Hiring process tracking

## Security

- **JWT Authentication** for API endpoints
- **CORS** configured for frontend access
- **Password encryption** using BCrypt
- **File upload validation** for security
- **All endpoints** currently permit all (for development)

## Status Enums

### DocumentStatus
- PENDING - Document uploaded, awaiting verification
- VERIFIED - Document verified by HR
- REJECTED - Document rejected

### InternStatus
- DOCUMENT_PENDING - Waiting for document upload
- DOCUMENT_VERIFICATION - Documents under review
- DOCUMENT_VERIFIED - All documents verified
- INTERVIEW_SCHEDULED - Interview scheduled
- OFFER_GENERATED - Offer letter generated
- ONBOARDING - Onboarding in progress
- ACTIVE - Active intern
- COMPLETED - Internship completed
- TERMINATED - Internship terminated

### HiringStatus
- NOT_STARTED - Not started
- PENDING - Pending
- IN_PROGRESS - In progress
- CLEARED - Cleared
- REJECTED - Rejected
- ON_HOLD - On hold

### OfferStatus
- GENERATED - Offer generated
- SENT - Offer sent to intern
- ACCEPTED - Offer accepted
- REJECTED - Offer rejected
- EXPIRED - Offer expired

### RoundStatus
- PENDING - Round pending
- SCHEDULED - Round scheduled
- IN_PROGRESS - Round in progress
- CLEARED - Round cleared
- REJECTED - Round rejected
- CANCELLED - Round cancelled

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in application.properties
- Ensure database exists

### File Upload Issues
- Check upload directory permissions
- Verify max file size configuration
- Ensure disk space available

### CORS Issues
- Verify frontend URL in cors.allowed-origins
- Check browser console for CORS errors
- Ensure PATCH method is allowed

## Development

### Adding New Endpoints
1. Create/update Model in `model/` package
2. Create Repository interface in `repository/` package
3. Create Service in `service/` package
4. Create Controller in `controller/` package
5. Add DTO if needed in `dto/` package

### Code Structure
```
backend/
├── src/main/java/com/wissen/ims/
│   ├── config/          # Configuration classes
│   ├── controller/      # REST controllers
│   ├── dto/             # Data transfer objects
│   ├── model/           # Entity models
│   ├── repository/      # JPA repositories
│   ├── security/        # Security components
│   └── service/         # Business logic
└── src/main/resources/
    └── application.properties
```

## License

Copyright © 2026 Wissen Technology
