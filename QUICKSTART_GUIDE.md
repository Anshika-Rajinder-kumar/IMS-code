# 🚀 Quick Start Guide - Wissen IMS

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Backend API running on port 8080

---

## 🎯 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file in root directory:
```env
VITE_API_URL=http://localhost:8080/api
```

### 3. Start Development Server
```bash
npm run dev
```
Application will run on: `http://localhost:5173`

---

## 👥 User Setup

### First Time Setup
Register your first user via the registration page. You can create users with different roles:
- **Admin/HR**: Full system access
- **College**: View student hiring status
- **Intern**: Manage documents and view offers
- **Role**: Select "Intern"

---

## 🎨 Features by Role

### 🔑 Admin/HR Features
1. **Dashboard** (`/dashboard`)
   - System overview
   - Recent activities
   - Quick actions

2. **Colleges** (`/colleges`)
   - Add/Edit/Delete colleges
   - Schedule campus visits
   - Track partnerships

3. **Hiring Rounds** (`/hiring-rounds`)
   - Manage recruitment pipeline
   - Update candidate status
   - Track through stages: Aptitude → Technical → HR → Selected

4. **Interns** (`/interns`)
   - View all interns
   - Update intern details
   - Track status changes

5. **Documents** (`/documents`)
   - Verify intern documents
   - Approve/Reject with feedback
   - Update verification status

6. **Offers** (`/offers`)
   - Generate offer letters
   - Send to interns
   - Track acceptance

7. **Settings** (`/settings`)
   - Profile management
   - Security settings
   - Notification preferences

---

### 🏫 College Features
1. **Dashboard** (`/dashboard`)
   - Student statistics
   - Hiring status overview

2. **Students** (`/students`)
   - Upload student details
   - Add individual or bulk upload
   - Attach resumes
   - Track student status

3. **Hiring Status** (`/hiring-status`)
   - View students in pipeline
   - Monitor selection progress
   - See round-wise results

---

### 👨‍🎓 Intern Features
1. **Dashboard** (`/dashboard`)
   - Personal overview
   - Quick access to tasks

2. **My Learning** (`/learning`)
   - View learning modules
   - Track progress (%)
   - See assigned projects
   - Check assessment scores
   - Monitor attendance

3. **My Documents** (`/documents`)
   - Upload verification docs
   - View verification status

4. **My Offer** (`/offer`)
   - View offer letter
   - Accept/Reject offer

5. **Profile** (`/profile`)
   - Update personal info
   - Change password

---

## 🎯 Common Tasks

### For Admin: Add a College
1. Navigate to **Colleges** page
2. Click **"➕ Add College Visit"**
3. Fill in college details:
   - Name
   - Location
   - Coordinator
   - Email & Phone
   - Visit Date
   - Available Slots
4. Click **"Create College"**
5. Credentials auto-generated and sent

### For Admin: Manage Hiring Rounds
1. Go to **Hiring Rounds** page
2. See pipeline: Aptitude → Technical 1 → Technical 2 → HR → Selected
3. Click **"Update Status"** on any candidate
4. Select:
   - Round
   - Status (Cleared/Pending/Rejected)
   - Score (optional)
   - Feedback
5. Submit - status updates across system

### For College: Upload Student
1. Navigate to **Students** page
2. Click **"➕ Add Student"**
3. Enter student details:
   - Full Name
   - Email
   - Branch
   - CGPA
   - Graduation Year
   - Skills
4. Upload resume (PDF/DOC)
5. Click **"Upload Student"**

### For Admin: Verify Documents
1. Go to **Documents** page
2. View interns with uploaded docs
3. Click document to review
4. Either:
   - **Verify** - marks as verified
   - **Reject** - provide reason
5. Update intern status to "Document Verified"

### For Admin: Generate Offer
1. Navigate to **Offers** page
2. See list of "Ready to Generate" interns
3. Click **"Generate Offer"** on intern
4. Fill offer details:
   - Position
   - Department
   - Stipend
   - Duration
   - Start Date
   - Location
5. Submit - offer created and sent

### For Intern: Track Learning
1. Go to **My Learning** page
2. View tabs:
   - **Overview**: Progress summary
   - **Modules**: Learning modules with progress
   - **Projects**: Assigned projects
   - **Assessments**: Quiz/test scores
3. Click module to continue learning
4. Submit project work
5. View assessment results

---

## 🎨 UI Navigation Tips

### Sidebar Navigation
- Click any menu item to navigate
- Active page highlighted in purple
- Hover for smooth animations
- Logout button at bottom

### Search & Filter
- Use search boxes to find records quickly
- Filter dropdowns to narrow results
- Click column headers to sort (where available)

### Modal Windows
- Click outside modal to close
- Use ✕ button to close
- ESC key closes modal

### Forms
- Required fields marked with *
- Real-time validation
- Error messages displayed
- Success notifications on save

---

## 📱 Responsive Design

### Desktop (> 1024px)
- Full sidebar visible
- Multi-column layouts
- Extended tables

### Tablet (768px - 1024px)
- Collapsible sidebar
- Adjusted grid layouts
- Optimized spacing

### Mobile (< 768px)
- Hamburger menu
- Single column layout
- Touch-optimized buttons
- Simplified tables

---

## 🐛 Troubleshooting

### Backend Connection Error
```
Error: Failed to fetch
```
**Solution**: Ensure backend is running on port 8080

### Login Not Working
**Solution**: Check credentials and user role selection

### Page Not Loading
**Solution**: Clear browser cache and refresh

### Documents Not Uploading
**Solution**: Check file size (< 5MB) and format (PDF/DOC)

---

## 🎯 Keyboard Shortcuts

- `Tab` - Navigate between fields
- `Enter` - Submit form
- `ESC` - Close modal
- `Ctrl/Cmd + S` - Quick save (in forms)

---

## 📊 Status Indicators

### Intern Status
- 🔴 **Document Pending** - Awaiting document upload
- 🟡 **Document Verification** - Documents under review
- 🟢 **Document Verified** - All documents approved
- 🔵 **Offer Generated** - Offer letter created
- 🟣 **Onboarding** - In onboarding process
- ✅ **Active** - Currently active intern

### Hiring Status
- ⏳ **Pending** - Awaiting evaluation
- ✅ **Cleared** - Passed the round
- ❌ **Rejected** - Did not pass
- ⏸️ **On Hold** - Decision pending

---

## 🎓 Pro Tips

1. **Use filters** to quickly find specific records
2. **Export reports** before monthly reviews
3. **Bulk upload** students to save time
4. **Set notifications** to stay updated
5. **Update profiles** regularly
6. **Track metrics** on dashboard

---

## 📞 Support

For issues or questions:
- Check documentation
- Review error messages
- Contact system administrator
- Email: support@wissen.com

---

## 🎉 You're All Set!

Start managing your intern program efficiently with Wissen IMS!

**Remember**: The system follows the complete workflow from college onboarding → student upload → hiring rounds → selection → document verification → offer generation → learning tracking.

Happy Managing! 🚀
