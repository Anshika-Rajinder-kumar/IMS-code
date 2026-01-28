# 🧪 Testing Backend with Postman

## Quick Start

### 1️⃣ Import Collection into Postman

1. Open **Postman**
2. Click **Import** button (top left)
3. Select file: `Wissen-IMS-Postman-Collection.json`
4. Collection will be imported with all 43 endpoints

### 2️⃣ Test in Order

**Follow this sequence for best results:**

#### Step 1: Register Admin
```
POST /auth/register
```
- Creates admin user
- Automatically saves JWT token
- Email: your-email@domain.com
- Password: YourSecurePassword

#### Step 2: Login (if registration fails)
```
POST /auth/login
```
- Use same credentials
- Gets new JWT token

#### Step 3: Create College
```
POST /colleges
```
- Creates a college
- Saves `collegeId` automatically

#### Step 4: Create Intern
```
POST /interns
```
- Creates intern linked to college
- Saves `internId` automatically

#### Step 5: Update Intern Status
```
PATCH /interns/{internId}/status?status=SHORTLISTED
```

#### Step 6: Upload Document
```
POST /documents/upload?internId={internId}&documentType=RESUME
```
- Select any PDF file
- Saves `documentId`

#### Step 7: Create Offer
```
POST /offers
```
- Creates offer for intern
- Saves `offerId`

#### Step 8: Send Offer
```
PUT /offers/{offerId}/send
```

#### Step 9: Get Dashboard Stats
```
GET /dashboard/stats
```

---

## 📝 Collection Features

### Automatic Variable Management
The collection automatically saves:
- ✅ `token` - JWT authentication token
- ✅ `collegeId` - Created college ID
- ✅ `internId` - Created intern ID
- ✅ `documentId` - Uploaded document ID
- ✅ `offerId` - Created offer ID

### All Endpoints Included

**Authentication (2)**
- Register
- Login

**Colleges (6)**
- Get All, Create, Get by ID, Update, Search, Filter by Status, Delete

**Interns (7)**
- Get All, Create, Get by ID, Update, Update Status, Search, Filter by Status, Delete

**Documents (7)**
- Get All, Get by Intern, Upload, Verify, Reject, Download, Filter by Status, Delete

**Offers (9)**
- Get All, Create, Get by ID, Get by Intern, Update, Send, Accept, Reject, Filter by Status, Delete

**Dashboard (1)**
- Get Stats

**Total: 43 Endpoints**

---

## 🔐 Authentication

All endpoints (except auth) require JWT token:

```
Header: Authorization
Value: Bearer <your-token>
```

The collection automatically adds this header after login/register.

---

## 📊 Sample Test Data

### College
```json
{
  "name": "IIT Mumbai",
  "location": "Mumbai, Maharashtra",
  "contactPerson": "Dr. Sharma",
  "contactEmail": "sharma@iitmumbai.ac.in",
  "contactPhone": "+91-22-1234-5678",
  "status": "VISITED",
  "visitDate": "2026-01-15T10:00:00",
  "notes": "Premier engineering institute"
}
```

### Intern
```json
{
  "name": "Rahul Kumar",
  "email": "rahul.kumar@example.com",
  "phone": "+91-98765-43210",
  "college": { "id": 1 },
  "degree": "B.Tech",
  "branch": "Computer Science",
  "graduationYear": 2026,
  "cgpa": 8.5,
  "status": "APPLIED",
  "appliedDate": "2026-01-18T09:00:00",
  "skills": "Java, Spring Boot, React, PostgreSQL"
}
```

### Offer
```json
{
  "intern": { "id": 1 },
  "position": "Software Development Intern",
  "department": "Engineering",
  "stipend": 25000.00,
  "currency": "INR",
  "duration": 6,
  "startDate": "2026-03-01",
  "endDate": "2026-08-31",
  "workMode": "HYBRID",
  "location": "Mumbai, India",
  "status": "DRAFT",
  "benefits": "Meals, Transportation, Learning Resources"
}
```

---

## 🎯 Status Values Reference

### College Status
- `PLANNED`
- `VISITED`
- `PARTNERSHIP_SIGNED`

### Intern Status
- `NEW`
- `APPLIED`
- `SHORTLISTED`
- `INTERVIEW_SCHEDULED`
- `INTERVIEWED`
- `SELECTED`
- `OFFER_SENT`
- `OFFER_ACCEPTED`

### Document Status
- `PENDING`
- `VERIFIED`
- `REJECTED`

### Document Types
- `RESUME`
- `ID_PROOF`
- `MARKSHEET`
- `CERTIFICATE`
- `OTHER`

### Offer Status
- `DRAFT`
- `SENT`
- `ACCEPTED`
- `REJECTED`
- `EXPIRED`

### Work Mode
- `REMOTE`
- `ONSITE`
- `HYBRID`

---

## ⚡ Quick Tips

1. **Run requests in order** - Some requests depend on IDs from previous requests
2. **Check variables** - View saved variables in Collection Variables tab
3. **Watch console** - Check Postman Console for detailed request/response info
4. **Test scripts** - Collection auto-saves IDs after successful POST requests
5. **Environment** - You can also create an Environment for different setups (dev/prod)

---

## 🐛 Troubleshooting

### 401 Unauthorized
- Token expired or invalid
- Run Login request again

### 404 Not Found
- Check if ID variables are set
- Verify the resource was created

### 500 Server Error
- Check backend logs: `docker-compose logs backend`
- Verify database is running: `docker-compose ps`

### Cannot connect to localhost:8080
- Ensure Docker containers are running
- Run: `docker-compose ps`
- Restart if needed: `docker-compose restart backend`

---

## 📦 File Upload Testing

For document upload:
1. Go to "Upload Document" request
2. Click **Body** tab
3. Click **Select Files** next to `file` field
4. Choose any PDF, DOC, or image file
5. Click **Send**

---

## 🎓 Example Test Flow

```
1. POST /auth/register          → Get token
2. POST /colleges               → Get collegeId
3. POST /interns                → Get internId (uses collegeId)
4. PATCH /interns/{id}/status   → Update to SHORTLISTED
5. POST /documents/upload       → Upload resume (uses internId)
6. PUT /documents/{id}/verify   → Verify document
7. POST /offers                 → Create offer (uses internId)
8. PUT /offers/{id}/send        → Send offer to intern
9. PUT /offers/{id}/accept      → Accept the offer
10. GET /dashboard/stats        → View statistics
```

---

## ✅ Expected Results

After completing the test flow:
- ✅ 1 college created
- ✅ 1 intern added
- ✅ Intern status: SHORTLISTED
- ✅ 1 document uploaded and verified
- ✅ 1 offer sent and accepted
- ✅ Dashboard shows: 1 college, 1 intern, 1 offer

---

**Happy Testing! 🚀**
