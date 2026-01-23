# Intern Management Portal – Role-Based Login System

## Overview
The Intern Management Portal is a role-based web application designed to manage the complete lifecycle of college onboarding, student hiring, intern verification, offer generation, and intern learning tracking.

The system supports **three types of logins**:
- Admin
- College
- Intern

Each role has clearly defined responsibilities and access scopes.

---

## User Roles

### 1. Admin
The Admin is the platform owner and has complete control over the system.

### 2. College
The College represents an educational institution that uploads students for hiring.

### 3. Intern
The Intern is a student who gets selected through the hiring process and later joins the organization.

---

## System Flow

### Step 1: College Onboarding (Admin)
- Admin registers a college in the system.
- The system generates:
  - A unique College ID
  - Login credentials for the college
- Login details are sent to the college via email.

---

### Step 2: College Login & Student Upload
- College logs in using the credentials provided by Admin.
- College uploads:
  - Student details
  - Student resumes
- Uploaded students are stored as **candidates** in the system.

---

### Step 3: Hiring Rounds Management (Admin)
- Admin creates multiple hiring rounds (e.g., Aptitude, Technical, HR).
- Admin updates the status of students after each round.
- Student hiring status is visible to:
  - Admin dashboard
  - College dashboard

---

### Step 4: Student Selection & Intern Registration
- When a student is marked as **Selected**:
  - An Intern profile is automatically created.
  - A unique Intern ID and login credentials are generated.
- Login credentials are sent to the intern via email.

---

### Step 5: Intern Login & Document Upload
- Intern logs into the application using received credentials.
- Intern uploads required documents for verification.
- Uploaded documents appear in the Admin dashboard under **Document Verification**.

---

### Step 6: Document Verification (Admin)
- Admin reviews and verifies intern documents.
- Verification status is updated in the system.

---

### Step 7: Offer Letter Generation
- After successful document verification:
  - Admin generates an offer letter.
  - Offer letter is sent to the intern via email.
- Intern accepts the offer letter through the system.

---

### Step 8: Intern Learning & Progress Tracking
- Once the offer is accepted, the Intern dashboard shows:
  - Learning progress
  - Trainings
  - Assigned projects
- Intern can track their journey within the organization.

---

## Role Responsibilities Summary

### Admin
- Register colleges
- Manage hiring rounds
- Update student status
- Verify intern documents
- Generate and send offer letters
- Monitor intern progress

### College
- Login using admin-provided credentials
- Upload students and resumes
- Track student hiring status

### Intern
- Login after selection
- Upload verification documents
- Accept offer letter
- View trainings, projects, and learning progress

---

## Conclusion
This system provides a structured and transparent workflow for managing college onboarding, student hiring, intern verification, and intern development through a centralized portal with role-based access.
