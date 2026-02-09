# Wissen Intern Management System (IMS) - Project Documentation
**Date: February 09, 2026**

## 🌟 Project Overview
The **Wissen Intern Management System (IMS)** is a comprehensive, full-stack enterprise portal designed to manage the entire lifecycle of interns. It bridges the gap between College recruitment, Admin/HR processing, and Intern onboarding/development.

The system is built with a modern tech stack, prioritizing role-based access, real-time tracking, and a premium interactive user experience.

---

## 🏗️ Technical Architecture

### **Backend (Spring Boot)**
- **Language**: Java 17+
- **Framework**: Spring Boot 3.x
- **Security**: JWT (JSON Web Token) based authentication with role-based access control (RBAC).
- **Database**: PostgreSQL 15+
- **Persistence**: Spring Data JPA with Hibernate.
- **Key Modules**:
    - `Auth`: User registration and secure login.
    - `Intern/Candidate`: CORE management of user profiles and hiring status.
    - `Document`: Handles file uploads, metadata storage, and verification workflow.
    - `Offer`: Dynamic offer letter generation and status tracking.
    - `HiringRound`: Tracks recruitment pipeline (Aptitude, Tech rounds, HR).
    - `Learning/Project`: LMS functionality for assigning courses and tracking project progress.

### **Frontend (React)**
- **Framework**: React 18 (Vite-powered)
- **Styling**: Vanilla CSS3 with a heavy focus on CSS Variables for theming, gradients, and responsiveness.
- **Routing**: React Router v6 for protected and role-conditioned routes.
- **API Communication**: Centralized Axios-based service with token interceptors.
- **Design Principles**: 
    - Smooth micro-animations (fade, slide, scale).
    - Skeleton loading states and shimmer effects.
    - Glassmorphism & premium UI components.

### **Infrastructure**
- **Containerization**: Docker & Docker Compose.
- **Reverse Proxy**: Nginx (handling static assets and routing).
- **Storage**: Local persistence for DB data and file uploads (mapped via Docker volumes).

---

## 👥 User Roles & Permissions

### **1. Admin / HR**
The central orchestrator of the system.
- **Dashboard**: High-level metrics (Total Interns, Active, Onboarding, Offers).
- **College Management**: Onboarding and managing college partnerships.
- **Recruitment Pipeline**: 
    - Manage **Hiring Rounds** (Aptitude, Technical, HR).
    - Score candidates and provide feedback.
    - Convert selected candidates to Interns with a single click.
- **Intern Management**: Full lifecycle management of intern records.
- **Document Verification**: Multi-state verification (Pending -> Verified/Rejected).
- **Offer Letter**: Generate personalized offers and track acceptance.
- **LMS Admin**:
    - Manage a **Pool of Courses and Projects**.
    - Assign specific learning paths to interns.
    - Monitor performance and project progress.

### **2. College Partner**
Facilitates student data entry into the system.
- **Dashboard**: Track recruitment success rates for their students.
- **Student Upload**:
    - Single student registration with Resume.
    - **Bulk CSV Upload** for high-volume entry.
- **Hiring Status Tracking**: Real-time visibility into student progress through hiring rounds.

### **3. Intern**
The end-user focus of the system.
- **Dashboard**: Personal progress overview, attendance, and focus areas.
- **Document Portal**: Upload required verification documents (Aadhaar, Degree, etc.).
- **Offer Management**: View, download, and accept/reject the offer letter.
- **Learning Journey**:
    - Access assigned courses and resources.
    - Track progress against modules.
    - View and submit project progress.
- **Profile**: Manage personal and emergency contact information.

---

## 📂 Key Features & Functionalities

### **✅ Hiring & Onboarding**
- **Dynamic Rounds**: Create and customize hiring stages per recruitment drive.
- **Auto-Account Creation**: Upon candidate selection, the system automatically creates intern credentials and sends notification emails.
- **Document Workflow**: Automated status updates from `DOCUMENT_PENDING` to `ACTIVE`.

### **✅ Document Management**
- Secure file upload with file type/size validation.
- Metadata tracking (Uploaded by, Verified by, Timestamp).
- Rejection reason feedback loop.

### **✅ Offer Letter System**
- Personalized offer generation with position, stipend, and duration.
- State management: `GENERATED`, `SENT`, `ACCEPTED`, `REJECTED`.

### **✅ Learning Management (LMS)**
- **Course Pool**: Centralized repository of learning resources.
- **Assignments**: Targeted assignment of courses to specific interns or batches.
- **Progress Tracking**: Visual progress bars and performance ratings.
- **Project Progress**: Form-based updates for interns to report daily/weekly project status.

### **✅ Interactive UI Elements**
- **Sidebar**: Dynamic navigation that adapts to the logged-in user's role.
- **Toast Notifications**: Interactive feedback for every user action.
- **Search & Filters**: Advanced filtering by status, college, or name across all tables.

---

## 🛠️ Data Model Highlights

### **Intern Entity**
```java
- name, email, phone (Basic Info)
- collegeName, branch, cgpa (Academic)
- hiringStatus, hiringRound, hiringScore (Recruitment)
- status (Workflow: ONBOARDING, ACTIVE, COMPLETED, etc.)
- address, emergencyContact (Personal)
```

### **Document Entity**
```java
- name, label, icon
- status (PENDING, VERIFIED, REJECTED)
- filePath, type, size
- rejectionReason
```

---

## 🚀 Setup for Developers

### **Prerequisites**
- Docker & Docker Compose
- Node.js (for local frontend dev)
- JDK 17 (for local backend dev)

### **Quick Start (Docker)**
1. Clone the repository.
2. Run `docker compose up --build`.
3. Frontend: `http://localhost:3000`
4. Backend API: `http://localhost:8080/api`

### **Environment Variables**
- `SPRING_DATASOURCE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secure key for token generation.
- `VITE_API_URL`: Frontend configuration for API endpoint.

---

## 📈 System Metrics (Dashboard)
- **Total Colleges**: Active partner institutions.
- **Total Candidates**: Students uploaded by colleges.
- **Intern Conversion Rate**: % of students successfully selected.
- **Learning Index**: Average progress across all active interns.

---
**End of Knowledge Transfer Documentation**
