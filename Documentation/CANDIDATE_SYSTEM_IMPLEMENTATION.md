# Candidate Management System - Implementation Summary

## Overview
Separated **Candidates** (applicants) from **Interns** (selected employees) to properly manage the hiring pipeline.

## Key Changes

### 1. Backend Changes

#### New Entity: Candidate.java
- Located: `backend/src/main/java/com/wissen/ims/model/Candidate.java`
- Fields:
  - Basic info: name, email, phone, emergency contact
  - College info: collegeId, collegeName
  - Academic: branch, cgpa
  - Hiring: hiringRound, hiringStatus, hiringScore
  - Status: APPLIED, SCREENING, INTERVIEW_SCHEDULED, INTERVIEWING, SELECTED, REJECTED, WITHDRAWN
- **Note**: Candidates do NOT have user accounts until converted to interns

#### New Repository: CandidateRepository.java
- Standard CRUD operations
- Search by: status, college, name/email
- Located: `backend/src/main/java/com/wissen/ims/repository/CandidateRepository.java`

#### New Service: CandidateService.java
- **Key Method**: `convertCandidateToIntern(candidateId, joinDate)`
  - Creates Intern record
  - Creates user account with auto-generated credentials
  - Sends credentials via email
  - Updates candidate status to SELECTED
- Located: `backend/src/main/java/com/wissen/ims/service/CandidateService.java`

#### New Controller: CandidateController.java
- Endpoints:
  - `GET /api/candidates` - List all candidates
  - `GET /api/candidates/{id}` - Get candidate details
  - `GET /api/candidates/status/{status}` - Filter by status
  - `GET /api/candidates/college/name/{name}` - Get by college
  - `POST /api/candidates` - Create candidate
  - `PUT /api/candidates/{id}` - Update candidate
  - `DELETE /api/candidates/{id}` - Delete candidate
  - **`POST /api/candidates/{id}/convert-to-intern`** - Convert to intern
- Located: `backend/src/main/java/com/wissen/ims/controller/CandidateController.java`

#### Updated: DashboardController.java
- Added candidate statistics:
  - totalCandidates
  - appliedCandidates
  - interviewingCandidates
  - selectedCandidates

### 2. Frontend Changes

#### New Component: Candidates.jsx
- Features:
  - List all candidates with status badges
  - Add/Edit candidates
  - Search and filter by status
  - **Convert selected candidates to interns** (bulk or individual)
  - Delete candidates
- Located: `src/components/Candidates.jsx`

#### New Styles: Candidates.css
- Modern card-based UI
- Status badges with color coding
- Responsive design
- Located: `src/components/Candidates.css`

#### Updated: StudentUpload.jsx (College View)
- **Changed behavior**: Now creates Candidates instead of Interns
- Colleges upload students as applicants
- No user account created at this stage
- Students enter hiring pipeline as candidates

#### Updated: App.jsx
- Added route: `/candidates` → `<Candidates />`

#### Updated: Sidebar.jsx
- Added "Candidates" menu item for ADMIN/HR

#### Updated: api.js
- Added candidate API methods:
  - getCandidates()
  - createCandidate()
  - updateCandidate()
  - deleteCandidate()
  - convertCandidateToIntern(id, joinDate)
  - And more...

## Workflow

### Previous Flow (Incorrect)
```
College Uploads Student → Creates Intern → Status: DOCUMENT_PENDING
```

### New Flow (Correct)
```
College Uploads Student 
  ↓
Creates Candidate (Status: APPLIED)
  ↓
Admin/HR Reviews & Interviews
  ↓
Admin Updates Status: SCREENING → INTERVIEWING → SELECTED
  ↓
Admin Clicks "Convert to Intern" (provides join date)
  ↓
System:
  1. Creates Intern record
  2. Generates user credentials
  3. Sends email to intern
  4. Updates candidate status to SELECTED
```

## User Roles

### COLLEGE
- Can upload students (creates Candidates)
- Can view hiring status of their students
- **Cannot** access candidate management

### ADMIN/HR
- Full access to Candidates page
- Can update candidate status through hiring pipeline
- Can convert selected candidates to interns
- Must provide join date during conversion

### INTERN
- Account created only after conversion from candidate
- Receives credentials via email
- Can access documents and offers

## Database Schema

### New Table: candidates
```sql
CREATE TABLE candidates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(20),
    college_id BIGINT NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    cgpa VARCHAR(10) NOT NULL,
    address VARCHAR(500),
    hiring_round VARCHAR(100),
    hiring_status VARCHAR(50),
    hiring_score INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);
```

### interns Table (Unchanged)
- Still has join_date field (nullable)
- Status defaults to DOCUMENT_PENDING
- User account created with intern

## Status Enums

### Candidate.CandidateStatus
- APPLIED - Initial application
- SCREENING - Under review
- INTERVIEW_SCHEDULED - Interview set up
- INTERVIEWING - Currently in interviews
- SELECTED - Chosen for internship
- REJECTED - Not selected
- WITHDRAWN - Candidate withdrew

### Candidate.HiringStatus
- NOT_STARTED - Not yet evaluated
- PENDING - Awaiting review
- IN_PROGRESS - Currently being evaluated
- CLEARED - Passed hiring round
- REJECTED - Failed hiring round

## Testing

### 1. College User Flow
1. Login as college user
2. Navigate to "Students" page
3. Click "Add Student"
4. Fill form (name, email, phone, branch, CGPA)
5. Submit
6. **Verify**: Student appears in list
7. **Verify**: No email sent (candidate, not intern yet)

### 2. Admin Conversion Flow
1. Login as admin
2. Navigate to "Candidates" page
3. Find candidate with status "SELECTED"
4. Click "Convert to Intern"
5. Enter join date
6. Submit
7. **Verify**: Candidate status updated to SELECTED
8. **Verify**: New intern created
9. **Verify**: Email sent with credentials
10. **Verify**: Candidate can login with received credentials

### 3. Bulk Conversion
1. Select multiple candidates with status "SELECTED"
2. Click "Convert X to Interns"
3. Enter join date for all
4. **Verify**: All converted successfully
5. **Verify**: Multiple emails sent

## API Testing

### Create Candidate
```http
POST http://localhost:8080/api/candidates
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "collegeId": 1,
  "collegeName": "ABC College",
  "branch": "Computer Science",
  "cgpa": "8.5",
  "status": "APPLIED"
}
```

### Convert to Intern
```http
POST http://localhost:8080/api/candidates/1/convert-to-intern
Content-Type: application/json
Authorization: Bearer <token>

{
  "joinDate": "2026-02-01"
}
```

## Benefits

1. **Clear Separation**: Candidates vs Interns
2. **Proper Hiring Pipeline**: Track application → interview → selection
3. **No Premature Accounts**: User accounts only for selected candidates
4. **Email Notifications**: Automated credential delivery
5. **Bulk Operations**: Convert multiple candidates at once
6. **College Independence**: Colleges upload students without system access
7. **Admin Control**: Full control over who becomes intern

## Migration Notes

### Existing Data
- Existing interns remain unchanged
- Colleges can continue uploading (now creates candidates)
- No data loss or migration required

### Future Enhancements
- Email templates customization
- Interview scheduling integration
- Resume upload for candidates
- Bulk CSV import for candidates
- Automated status transitions
- Notification system for status changes

## Files Modified/Created

### Backend (8 files)
- ✅ Candidate.java (new)
- ✅ CandidateRepository.java (new)
- ✅ CandidateService.java (new)
- ✅ CandidateController.java (new)
- ✅ DashboardController.java (updated)
- ✅ InternService.java (no changes needed)
- ✅ User.java (already has COLLEGE type)
- ✅ EmailService.java (already exists)

### Frontend (6 files)
- ✅ Candidates.jsx (new)
- ✅ Candidates.css (new)
- ✅ StudentUpload.jsx (updated)
- ✅ App.jsx (updated)
- ✅ Sidebar.jsx (updated)
- ✅ api.js (updated)

## Deployment

```bash
# Stop existing containers
docker-compose down

# Rebuild with new Candidate entity
docker-compose up --build -d

# Verify services
docker ps

# Check logs
docker logs wissen-backend
docker logs wissen-frontend
```

## Success Criteria

- ✅ Colleges can upload students
- ✅ Students appear as candidates (not interns)
- ✅ Admin can view all candidates
- ✅ Admin can update candidate status
- ✅ Admin can convert selected candidates to interns
- ✅ Conversion creates user account
- ✅ Conversion sends email with credentials
- ✅ Converted interns can login
- ✅ Dashboard shows candidate statistics

---

**Implementation Date**: January 23, 2026
**Status**: Complete ✅
