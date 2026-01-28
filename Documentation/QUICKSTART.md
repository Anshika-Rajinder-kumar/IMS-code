# 🚀 Quick Start Guide - Wissen IMS

Complete setup guide to run the Intern Management System with frontend and backend.

## Prerequisites

- **Java 17+** - Backend runtime
- **Node.js 18+** - Frontend runtime  
- **PostgreSQL 14+** - Database
- **Maven 3.6+** - Build tool
- **Docker** (optional) - For containerized deployment

## Option 1: Docker Compose (Recommended)

### Single Command Setup

```powershell
# From project root
docker-compose up -d
```

This starts:
- ✅ PostgreSQL on port 5432
- ✅ Backend API on port 8080
- ✅ Frontend on port 3000

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Database**: localhost:5432

### Initial Setup

After deployment, you'll need to:
1. Register your first admin user via the registration page
2. Use the registration endpoint to create users with appropriate roles (ADMIN, HR, COLLEGE, INTERN)
3. Admin users can then manage other users through the application

### Stop Services

```powershell
docker-compose down
```

### View Logs

```powershell
docker-compose logs -f
```

## Option 2: Local Development

### Step 1: Setup Database

```powershell
# Start PostgreSQL
docker run --name postgres `
  -e POSTGRES_DB=wissen_ims `
  -e POSTGRES_USER=wissen_user `
  -e POSTGRES_PASSWORD=wissen_password `
  -p 5432:5432 `
  -d postgres:14
```

### Step 2: Start Backend

```powershell
cd backend
mvn clean install
mvn spring-boot:run
```

Backend starts on: **http://localhost:8080/api**

### Step 3: Load Test Data (Optional)

```powershell
psql -U wissen_user -d wissen_ims -f backend/src/main/resources/test-data.sql
```

### Step 4: Start Frontend

```powershell
cd ..
npm install
npm run dev
```

Frontend starts on: **http://localhost:3000**

## Option 3: Using PowerShell Scripts

### Windows Quick Start

```powershell
# Start everything
.\start.ps1

# Development mode (frontend only)
.\dev.ps1

# Stop everything
.\stop.ps1
```

## Getting Started

Your Wissen Intern Management System is now running! 🎉

### Access the Application

Open your browser and navigate to: **http://localhost:3000**

## Initial User Setup

To get started:
1. Navigate to the registration page
2. Register your first admin user with:
   - Full Name
   - Email
   - Password (min 8 characters)
   - User Type: ADMIN
   - Department
   - Phone Number
3. Login with your registered credentials
4. Admin users can create other users (HR, College, Intern) as needed

## Navigation Guide

### 1. **Login Page** (/)
- Select your user type (Admin/HR)
- Enter your credentials
- Click "Sign In"

### 2. **Dashboard** (/dashboard)
- View key metrics at a glance
- See recent intern activities
- Check upcoming college visits
- Access quick actions

### 3. **Colleges** (/colleges)
- View all colleges visited
- Add new college visits
- Edit college information
- Track visit schedules

### 4. **Interns** (/interns)
- Switch between Grid and List views
- Add new interns
- Search and filter interns
- Track intern status

### 5. **Documents** (/documents)
- Select an intern from the sidebar
- View all uploaded documents
- Verify or reject documents
- Track document completion progress

### 6. **Offer Letters** (/offers)
- Generate new offer letters
- Preview offer letters before sending
- Download as PDF
- Send via email

## Features to Explore

✨ **Interactive Dashboard**
- Real-time metrics
- Activity feeds
- Quick action buttons

🏫 **College Management**
- Beautiful card layout
- Filter by status
- Search functionality

👥 **Intern Tracking**
- Multiple view modes
- Status badges
- Progress tracking

📁 **Document Verification**
- Visual completion circles
- One-click verify/reject
- Document type indicators

📄 **Offer Generation**
- Professional templates
- Live preview
- Customizable fields

## Tips

1. **Responsive Design**: Try resizing your browser window - the UI adapts beautifully!
2. **Status Colors**: 
   - 🟢 Green = Success/Verified/Active
   - 🟡 Yellow = Pending/Warning
   - 🔵 Blue = Info/In Progress
   - 🔴 Red = Rejected/Error
3. **Navigation**: Use the sidebar for quick navigation between modules
4. **Search**: Use the search boxes to quickly find colleges or interns

## Development Commands

- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Preview Production**: `npm run preview`

## Browser Support

For the best experience, use:
- Chrome (Recommended)
- Firefox
- Safari
- Edge

---

Enjoy exploring your Wissen Intern Management System! 🎓
