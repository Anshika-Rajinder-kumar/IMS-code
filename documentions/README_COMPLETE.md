# 🎓 Wissen Intern Management System - Complete Stack

A comprehensive full-stack application for managing the complete intern hiring lifecycle at Wissen Technology. Built with React frontend, Spring Boot backend, PostgreSQL database, and fully dockerized.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Development Setup](#development-setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/HR)
- Secure password encryption with BCrypt
- Session management

### 🏛️ College Management
- Track college visits and partnerships
- Manage visit schedules and coordinators
- Monitor available slots
- Search and filter colleges

### 👥 Intern Management
- Complete intern lifecycle tracking
- 8-stage status workflow:
  - Document Pending
  - Document Verification
  - Interview Scheduled
  - Offer Generated
  - Onboarding
  - Active
- Advanced search and filtering
- Emergency contact management

### 📄 Document Management
- Secure document upload and storage
- Document verification workflow
- Support for multiple file types (PDF, DOC, JPG, PNG)
- Document rejection with reasons
- Secure file download

### 📝 Offer Letter Management
- Generate offer letters
- Track offer status (Generated/Sent/Accepted/Rejected/Expired)
- Configure stipend, duration, work mode
- Email notification integration ready

### 📊 Dashboard & Analytics
- Real-time statistics
- Intern status distribution
- Offer acceptance rates
- College visit tracking

## 🛠️ Tech Stack

### Frontend
- **React 19.2.3** - UI framework
- **React Router DOM 7.12.0** - Client-side routing
- **Vite 7.3.1** - Build tool and dev server
- **CSS3** - Custom styling with CSS variables

### Backend
- **Spring Boot 3.2.1** - Java framework
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Database ORM
- **JWT (io.jsonwebtoken)** - Token-based auth
- **PostgreSQL** - Relational database
- **Maven** - Build and dependency management
- **Lombok** - Reduce boilerplate code

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server
- **PostgreSQL 15 Alpine** - Database container

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/HTTPS
                ┌────────────▼──────────────┐
                │   Nginx (Port 3000/80)   │
                │   React Frontend         │
                └────────────┬──────────────┘
                             │ REST API
                ┌────────────▼──────────────┐
                │  Spring Boot (Port 8080)  │
                │  Backend API Server       │
                │  - JWT Authentication     │
                │  - Business Logic         │
                │  - File Management        │
                └────────────┬──────────────┘
                             │ JDBC
                ┌────────────▼──────────────┐
                │  PostgreSQL (Port 5432)   │
                │  Database                 │
                └───────────────────────────┘
```

## 📦 Prerequisites

### For Docker Deployment (Recommended)
- Docker Desktop 4.0+ or Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

### For Development
- **Node.js 20+** and npm 10+
- **Java 17+** (JDK)
- **Maven 3.9+**
- **PostgreSQL 15+**
- **Git**

## 🚀 Quick Start with Docker

### 1. Clone the Repository
```bash
git clone <repository-url>
cd IMS_Frontedn
```

### 2. Build and Run All Services
```bash
docker-compose up --build
```

This single command will:
- Build the React frontend
- Build the Spring Boot backend
- Start PostgreSQL database
- Configure networking between services
- Start all services in the correct order

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Database**: localhost:5432

### 4. Default Login
On first run, you'll need to register a user through the registration page.

### 5. Stop the Application
```bash
docker-compose down
```

### 6. Stop and Remove All Data
```bash
docker-compose down -v
```

## 💻 Development Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install PostgreSQL** (if not using Docker)
   ```bash
   # Windows (using Chocolatey)
   choco install postgresql

   # Or download from https://www.postgresql.org/download/
   ```

3. **Create Database**
   ```sql
   CREATE DATABASE wissen_ims;
   CREATE USER wissen_user WITH PASSWORD 'wissen_password';
   GRANT ALL PRIVILEGES ON DATABASE wissen_ims TO wissen_user;
   ```

4. **Configure Application**
   
   Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/wissen_ims
   spring.datasource.username=wissen_user
   spring.datasource.password=wissen_password
   ```

5. **Build and Run**
   ```bash
   # Using Maven Wrapper (recommended)
   ./mvnw spring-boot:run

   # Or using installed Maven
   mvn spring-boot:run
   ```

   Backend will start on http://localhost:8080

### Frontend Setup

1. **Navigate to root directory**
   ```bash
   cd ..  # From backend directory
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   Frontend will start on http://localhost:3000

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/auth/register`
Register a new user
```json
{
  "fullName": "John Doe",
  "email": "john@wissen.com",
  "password": "secure123",
  "userType": "ADMIN",
  "department": "HR",
  "phone": "9876543210"
}
```

#### POST `/auth/login`
Authenticate user
```json
{
  "email": "john@wissen.com",
  "password": "secure123",
  "userType": "ADMIN"
}
```

Response:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "email": "john@wissen.com",
    "name": "John Doe",
    "userType": "ADMIN"
  }
}
```

### College Endpoints

- `GET /colleges` - Get all colleges
- `GET /colleges/{id}` - Get college by ID
- `GET /colleges/search?term={term}` - Search colleges
- `POST /colleges` - Create new college
- `PUT /colleges/{id}` - Update college
- `DELETE /colleges/{id}` - Delete college

### Intern Endpoints

- `GET /interns` - Get all interns
- `GET /interns/{id}` - Get intern by ID
- `GET /interns/search?term={term}` - Search interns
- `GET /interns/status/{status}` - Filter by status
- `POST /interns` - Create new intern
- `PUT /interns/{id}` - Update intern
- `PATCH /interns/{id}/status?status={status}` - Update status
- `DELETE /interns/{id}` - Delete intern

### Document Endpoints

- `GET /documents` - Get all documents
- `GET /documents/{id}` - Get document by ID
- `GET /documents/intern/{internId}` - Get intern's documents
- `POST /documents/upload` - Upload document (multipart/form-data)
- `PATCH /documents/{id}/verify` - Verify document
- `PATCH /documents/{id}/reject` - Reject document
- `GET /documents/{id}/download` - Download document
- `DELETE /documents/{id}` - Delete document

### Offer Endpoints

- `GET /offers` - Get all offers
- `GET /offers/{id}` - Get offer by ID
- `GET /offers/intern/{internId}` - Get intern's offers
- `POST /offers` - Create new offer
- `PUT /offers/{id}` - Update offer
- `PATCH /offers/{id}/send` - Send offer
- `PATCH /offers/{id}/accept` - Accept offer
- `PATCH /offers/{id}/reject` - Reject offer
- `DELETE /offers/{id}` - Delete offer

### Dashboard Endpoints

- `GET /dashboard/stats` - Get dashboard statistics

## 📁 Project Structure

```
IMS_Frontedn/
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/wissen/ims/
│   │       │   ├── config/          # Security, CORS config
│   │       │   ├── controller/      # REST Controllers
│   │       │   ├── dto/             # Data Transfer Objects
│   │       │   ├── model/           # JPA Entities
│   │       │   ├── repository/      # Database Repositories
│   │       │   ├── security/        # JWT, Auth filters
│   │       │   ├── service/         # Business logic
│   │       │   └── WissenImsApplication.java
│   │       └── resources/
│   │           └── application.properties
│   ├── Dockerfile                   # Backend Docker config
│   └── pom.xml                      # Maven dependencies
├── src/                             # React Frontend
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Colleges.jsx
│   │   ├── Interns.jsx
│   │   ├── Documents.jsx
│   │   └── Offers.jsx
│   ├── services/
│   │   └── api.js                   # API service layer
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── docker-compose.yml               # Multi-container orchestration
├── Dockerfile                       # Frontend Docker config
├── nginx.conf                       # Nginx configuration
├── package.json
├── vite.config.js
├── .env                            # Development environment
├── .env.production                 # Production environment
└── README.md
```

## 🔧 Environment Variables

### Backend (application.properties)
```properties
# Database
spring.datasource.url=jdbc:postgresql://postgres:5432/wissen_ims
spring.datasource.username=wissen_user
spring.datasource.password=wissen_password

# JWT
jwt.secret=wissenImsSecretKeyForJwtTokenGenerationAndValidation2026
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:3000,http://frontend:80

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=./uploads
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api
```

### Frontend (.env.production)
```env
VITE_API_URL=http://backend:8080/api
```

## 🌐 Deployment

### Docker Production Deployment

1. **Clone on Server**
   ```bash
   git clone <repository-url>
   cd IMS_Frontedn
   ```

2. **Update Environment Variables**
   - Edit `.env.production` for frontend
   - Edit `application.properties` for backend
   - Update `docker-compose.yml` for production database credentials

3. **Deploy**
   ```bash
   docker-compose up -d --build
   ```

4. **Check Logs**
   ```bash
   docker-compose logs -f
   ```

5. **Scale Services** (if needed)
   ```bash
   docker-compose up -d --scale backend=3
   ```

### Manual Deployment

#### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/wissen-ims-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
npm run build
# Deploy dist/ folder to nginx or static hosting
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
npm run test
```

## 📊 Database Schema

### Tables
- **users** - User authentication and profiles
- **colleges** - College information and visits
- **interns** - Intern details and status
- **documents** - Document metadata and verification
- **offers** - Offer letter information

### Relationships
- Intern ↔ College (Many-to-One)
- Document ↔ Intern (Many-to-One)
- Offer ↔ Intern (Many-to-One)

## 🔒 Security Features

- JWT token-based authentication
- BCrypt password hashing
- CORS protection
- SQL injection prevention (JPA)
- XSS protection headers
- Secure file upload validation
- Role-based access control

## 🐛 Troubleshooting

### Docker Issues

**Port Already in Use**
```bash
# Find process using port
netstat -ano | findstr :8080
# Kill process
taskkill /PID <process_id> /F
```

**Container Won't Start**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Restart specific service
docker-compose restart backend
```

### Database Issues

**Connection Refused**
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check database credentials in application.properties
- Verify network connectivity: `docker network inspect ims_frontedn_wissen-network`

### API Issues

**401 Unauthorized**
- Check if JWT token is valid
- Verify token is included in Authorization header
- Check token expiration (24 hours default)

**CORS Errors**
- Update `cors.allowed-origins` in application.properties
- Ensure frontend URL is whitelisted

## 📝 License

This project is proprietary software of Wissen Technology.

## 👥 Contributors

- Wissen Technology Development Team

## 📧 Support

For support, email support@wissen.com or create an issue in the repository.

---

**Built with ❤️ by Wissen Technology**
