# Wissen Intern Management System (IMS) - Technical Documentation

## 🚀 Project Overview
The Wissen Intern Management System (IMS) is a full-stack enterprise application designed to streamline the end-to-end recruitment and onboarding process for interns. It covers everything from college campus visits to document verification and offer letter generation.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.x with Vite 7.x
- **Routing**: React Router DOM 7.x
- **Styling**: Vanilla CSS with CSS Variables (Modern, Responsive, Animated)
- **State Management**: React Hooks & LocalStorage
- **Icons**: Emoji-based and CSS-styled UI elements

### Backend
- **Framework**: Spring Boot 3.x (Java 17)
- **Data Access**: Spring Data JPA with Hibernate
- **Database**: PostgreSQL 15
- **Security**: JWT-based Authentication & BCrypt Password Encoding
- **File Handling**: Multipart file uploads for document verification

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (serving the React production build)
- **Environment**: Cross-platform support via PowerShell scripts (`dev.ps1`, `start.ps1`)

---

## 📑 Core Modules & Features

### 1. Authentication & RBAC
- Role-based Access Control for **Admin** and **HR** roles.
- Secure login and registration flows.
- Protected routes on the frontend to prevent unauthorized access.

### 2. Intelligent Dashboard
- Real-time analytics cards: Total Interns, Active Onboarding, Colleges Visited, Offers Generated.
- Recent activity feed showing latest intern status changes.
- Quick action shortcuts for common tasks like "Add Intern" or "Generate Offer".

### 3. College Management
- Track campus recruitment drives.
- Store detailed college profiles, coordinator contacts, and visit schedules.
- Status tracking for visits (Scheduled vs Completed).

### 4. Intern Lifecycle Management
- Manage interns through a multi-stage pipeline.
- Dual view modes: **Grid View** (card-based) and **List View** (table-based).
- Advanced filtering by status, college, name, or CGPA.

### 5. Document Verification System
- Dynamic document upload and status tracking.
- HR can **Verify** or **Reject** documents with specific reasons.
- Progress visualization using circular indicators.
- Supports PDF, JPG, PNG, and DOC formats.

### 6. Offer Letter System
- Workflow-driven offer generation for interns who cleared verification.
- Customizable templates including position, stipend, duration, and work mode (Hybrid/Remote/On-site).
- Live preview and PDF generation.
- Offer status tracking: `GENERATED` ➡️ `SENT` ➡️ `ACCEPTED`.

---

## 🏗️ System Architecture

### Data Models (Backend Entities)
- **User**: Authentication details and roles.
- **Intern**: Profile, education, and overall hiring status.
- **College**: Recruitment source information.
- **Document**: File metadata, verification status, and rejection logs.
- **Offer**: Contract details, status, and generated timestamps.
- **HiringRound**: Results and feedback for specific interview stages.

### API Architecture
- **Auth**: `/api/auth/*` (login, register)
- **Interns**: `/api/interns/*` (CRUD, status updates)
- **Documents**: `/api/documents/*` (upload, download, verify)
- **Offers**: `/api/offers/*` (generate, track status)
- **Colleges**: `/api/colleges/*` (CRUD)
- **Dashboard**: `/api/dashboard/stats` (analytics)

---

## 📁 Project Structure

```text
IMS-code/
├── backend/               # Spring Boot Application
│   ├── src/main/java/     # Models, Controllers, Services, Repositories
│   ├── src/main/resources/ # Configuration (application.properties)
│   └── pom.xml            # Maven dependencies
├── src/                   # React Frontend (Vite)
│   ├── components/        # UI Components (Dashboard, Interns, etc.)
│   ├── App.jsx            # Router and Global Logic
│   └── main.jsx           # Entry Point
├── Dockerfile             # Multi-stage build for React/Nginx
├── docker-compose.yml     # Full-stack orchestration
└── start.ps1              # Easy startup script for Windows
```

---

## 🔌 Setup & Installation

### Option 1: Docker Compose (Recommended)
Automatically sets up PostgreSQL, Backend, and Frontend.
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`

### Option 2: Manual Development
1. **Backend**:
   - Ensure PostgreSQL is running and a database `wissen_ims` exists.
   - Update `backend/src/main/resources/application.properties` with credentials.
   - Run: `cd backend && mvn spring-boot:run`
2. **Frontend**:
   - Run: `npm install`
   - Run: `npm run dev`

---

## 🔐 Configuration Highlights
- **JWT Secret**: Configurable via `.env` or Docker environment.
- **CORS**: Restricted to frontend origin in production, permissive in dev.
- **File Storage**: Documents are stored in a persistent volume (configured in Docker Compose).

---

##  Hiring Workflow Summary
1. **College Visit**: Schedule and complete a visit.
2. **Shortlisting**: Add selected interns to the platform.
3. **Documents**: Interns/HR upload required documents (Aadhaar, Marksheets, etc.).
4. **Verification**: HR reviews and verifies documents.
5. **Interview**: (Optional) Tracks rounds through the HiringRound module.
6. **Offer**: Generate and send the final offer letter.
7. **Onboarding**: Move intern to `ACTIVE` status upon acceptance.

---
*Built for Wissen Technology Intern Management | 2026*
