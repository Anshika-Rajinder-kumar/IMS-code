# Wissen Intern Management System

A comprehensive and interactive React-based Intern Management System for managing the complete intern hiring lifecycle.

## Features

### 🔐 Authentication
- Login and Registration pages for Admin and HR users
- Role-based access control
- Secure session management

### 📊 Dashboard
- Real-time hiring and onboarding metrics
- Quick stats overview (Total Interns, Active Onboarding, Colleges Visited, Offers Generated)
- Recent interns activity feed
- Upcoming college visits calendar
- Quick action shortcuts

### 🏫 College Management
- Add and track colleges visited for hiring
- Manage campus visit schedules
- Store coordinator contact information
- Track available slots per college
- Filter and search functionality
- Beautiful card-based layout

### 👥 Intern Management
- Add and track interns throughout the hiring lifecycle
- Multiple view modes (Grid and List view)
- Comprehensive intern profiles with:
  - Personal information
  - Educational details
  - Contact information
  - Status tracking
- Advanced filtering and search
- Status indicators (Active, Onboarding, Document Verification, etc.)

### 📁 Document Verification System
- Centralized document management
- Visual progress tracking for each intern
- Document status management:
  - ✅ Verified
  - ⏳ Pending
  - ❌ Rejected (with reason)
- Multiple document types support (PDF, JPG, PNG, DOC)
- Quick verify/reject actions
- Document preview and download options

### 📄 Offer Letter Generation
- Professional offer letter templates
- Dynamic form with customizable fields:
  - Position and Department
  - Stipend and Duration
  - Start Date and Location
  - Work Mode (On-site/Remote/Hybrid)
  - Reporting Manager
- Real-time preview before sending
- Download as PDF
- Send directly via email
- Track offer status (Ready, Generated, Sent)

## Design Features

- ✨ Clean and professional UI
- 📱 Fully responsive design (Desktop, Tablet, Mobile)
- 🎨 Modern gradient backgrounds
- 🌈 Intuitive color-coded status indicators
- 💫 Smooth animations and transitions
- 🎯 Easy navigation with fixed sidebar
- 📊 Data visualization with progress bars and stats
- 🔔 Clear status tracking throughout workflows

## Tech Stack

- **Frontend Framework**: React 19.2.3
- **Routing**: React Router DOM 7.12.0
- **Build Tool**: Vite 7.3.1
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Emoji-based icons for better accessibility

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Project Structure

```
IMS_Frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Login.css
│   │   ├── Register.jsx
│   │   ├── Register.css
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   ├── Sidebar.jsx
│   │   ├── Colleges.jsx
│   │   ├── Colleges.css
│   │   ├── Interns.jsx
│   │   ├── Interns.css
│   │   ├── Documents.jsx
│   │   ├── Documents.css
│   │   ├── Offers.jsx
│   │   └── Offers.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## Usage

### Login
- Navigate to `/login`
- Select user type (Admin or HR)
- Enter credentials and sign in

### Dashboard
- View hiring metrics and statistics
- Quick access to all modules
- Monitor recent activities

### Managing Colleges
1. Navigate to Colleges section
2. Click "Add College Visit"
3. Fill in college and coordinator details
4. Save to schedule visit

### Managing Interns
1. Navigate to Interns section
2. Click "Add Intern"
3. Enter intern details
4. Track their progress through the hiring lifecycle

### Verifying Documents
1. Navigate to Documents section
2. Select an intern from the list
3. Review uploaded documents
4. Verify or reject with comments

### Generating Offer Letters
1. Navigate to Offer Letters section
2. Select intern from "Ready for Offer" list
3. Fill in offer details
4. Preview the generated letter
5. Download or send via email

## Color Scheme

- **Primary Blue**: #1e40af (Trust, Professional)
- **Secondary Green**: #10b981 (Success, Active)
- **Warning Orange**: #f59e0b (Pending, Attention)
- **Danger Red**: #ef4444 (Rejected, Critical)
- **Text Primary**: #1f2937 (Main content)
- **Text Secondary**: #6b7280 (Supporting text)

## Key Features Highlights

1. **Smooth Workflow**: Streamlined process from college visit to offer generation
2. **Status Tracking**: Real-time status updates throughout the hiring lifecycle
3. **Document Management**: Centralized and organized document verification
4. **Professional Templates**: Ready-to-use offer letter templates
5. **Responsive Design**: Works seamlessly on all devices
6. **User-Friendly**: Intuitive interface with minimal learning curve

## Future Enhancements

- Email integration for automated notifications
- Advanced reporting and analytics
- Bulk operations support
- Interview scheduling module
- Performance tracking post-onboarding
- Integration with HRMS systems
- Multi-language support

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

ISC

---

Built with ❤️ for Wissen Technology
