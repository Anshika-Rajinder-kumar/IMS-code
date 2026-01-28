# 📖 Complete User Guide - Wissen IMS

## Table of Contents
1. [Getting Started](#getting-started)
2. [Login & Registration](#login--registration)
3. [Dashboard Navigation](#dashboard-navigation)
4. [College Management](#college-management)
5. [Intern Management](#intern-management)
6. [Document Verification](#document-verification)
7. [Offer Letter Generation](#offer-letter-generation)
8. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Screen resolution: 1024x768 or higher (works on all sizes)
- mvn clean install (use this to install everything automatically dependencies)

### First Time Access
1. Open your browser
2. Navigate to: `http://localhost:3000`
3. You'll see the Login page
4. If you don't have an account, click "Register"

---

## Login & Registration

### How to Login

1. **Select User Type**
   - Choose between "Admin" or "HR" from dropdown
   - Admin: Full system access
   - HR: Focused on recruitment tasks

2. **Enter Credentials**
   - Email: Your registered email address
   - Password: Your secure password
   - Optional: Check "Remember me" for convenience

3. **Sign In**
   - Click the "Sign In" button
   - You'll be redirected to the Dashboard

### How to Register

1. **Click "Register"** on the login page

2. **Fill in Personal Information**
   - Full Name: Your complete name
   - Email: Valid email address
   - Phone: Contact number (optional)

3. **Set User Type & Department**
   - User Type: Admin or HR
   - Department: Your department name

4. **Create Password**
   - Password: At least 6 characters
   - Confirm Password: Must match

5. **Accept Terms**
   - Check the terms and conditions box

6. **Create Account**
   - Click "Create Account"
   - Wait for success message
   - You'll be redirected to login

---

## Dashboard Navigation

### Understanding the Dashboard

**Left Sidebar:**
- 📊 Dashboard - Home page with metrics
- 🏫 Colleges - Manage college visits
- 👥 Interns - Track all interns
- 📁 Documents - Verify documents
- 📄 Offer Letters - Generate offers
- 📈 Reports - View analytics
- ⚙️ Settings - System preferences

**Top Section:**
- Page title and description
- Action buttons (context-sensitive)
- Search and filters

**Main Content:**
- Statistics cards
- Data tables or grids
- Forms and modals

**User Profile (Bottom Sidebar):**
- Your name and role
- Logout button

### Key Metrics Explained

**Total Interns:** All interns in the system
**Active Onboarding:** Currently in onboarding process
**Colleges Visited:** Total campus recruitment drives
**Offers Generated:** Total offer letters created

---

## College Management

### Viewing Colleges

1. Click **"Colleges"** in the sidebar
2. You'll see all colleges in a grid layout
3. Each card shows:
   - College name and icon
   - Location
   - Visit date
   - Coordinator details
   - Contact information
   - Available slots
   - Status badge

### Searching Colleges

- Type in the search box at the top
- Search works on:
  - College name
  - Location
  - Any text visible

### Filtering Colleges

- Use the "Status" dropdown
- Options:
  - All (shows everything)
  - Scheduled (upcoming visits)
  - Completed (past visits)

### Adding a College Visit

1. **Click "➕ Add College Visit"** button

2. **Fill in College Details:**
   - College Name: Full official name
   - Location: City, State
   - Coordinator Name: Placement officer name
   - Email: Official placement email
   - Phone: Contact number

3. **Set Visit Details:**
   - Visit Date: Scheduled recruitment date
   - Available Slots: Number of students expected

4. **Optional Notes:**
   - Add any special instructions or information

5. **Save:**
   - Click "Add College Visit"
   - The college appears in your list

### Editing College Information

- Click "✏️ Edit" on any college card
- Modify the required fields
- Save changes

### Viewing College Details

- Click "👁️ View Details"
- See complete information
- View associated interns
- Check visit history

---

## Intern Management

### Understanding View Modes

**Grid View (⊞):**
- Cards with photos
- Visual and easy to scan
- Best for browsing

**List View (☰):**
- Detailed table format
- Shows more information at once
- Better for bulk operations

### Adding a New Intern

1. **Click "➕ Add Intern"** button

2. **Personal Information:**
   - Full Name: Complete name
   - Email: Contact email
   - Phone: Primary contact number
   - Emergency Contact: Optional backup number

3. **Educational Details:**
   - College: Institution name
   - Branch: Department/Specialization
   - CGPA: Academic score (out of 10)

4. **Joining Information:**
   - Expected Join Date: Tentative start date
   - Address: Current address (optional)

5. **Submit:**
   - Click "Add Intern"
   - Intern appears with "Document Pending" status

### Searching Interns

Search works across:
- Intern name
- College name
- Email address

Just type in the search box!

### Filtering by Status

Use the status dropdown to filter:
- **All Status:** Show everyone
- **Active:** Currently working
- **Onboarding:** In joining process
- **Document Verification:** Docs being checked
- **Offer Generated:** Offer letter created
- **Interview Scheduled:** Interview pending
- **Document Pending:** Waiting for documents

### Understanding Intern Statuses

📊 **Status Flow:**
```
Document Pending
      ↓
Document Verification
      ↓
Interview Scheduled
      ↓
Offer Generated
      ↓
Onboarding
      ↓
Active
```

### Viewing Intern Details

- Click "👁️ View" on any intern card
- See complete profile
- Access linked documents
- View offer letter (if generated)

---

## Document Verification

### Navigation

1. Click **"Documents"** in sidebar
2. See two panels:
   - Left: List of interns
   - Right: Document details

### Selecting an Intern

1. Click on any intern from the left panel
2. See their completion percentage
3. Progress bar shows document status
4. Pending documents show as a badge number

### Understanding Document Status

**✅ Verified (Green):**
- Document is approved
- Ready for next step
- No action needed

**⏳ Pending (Yellow):**
- Awaiting verification
- Requires your review
- Action needed

**❌ Rejected (Red):**
- Document not acceptable
- Reason provided
- Needs resubmission

### Verifying Documents

1. **Select an Intern**
2. **For each document:**
   - Click "👁️ View" to preview
   - Review the content
   - If acceptable: Click "✓ Verify"
   - Document turns green

3. **Completion:**
   - Progress circle updates
   - When 100%, intern is ready for offer

### Rejecting Documents

1. **Click "✗ Reject"** on problematic document
2. **Enter Reason:**
   - Be specific and clear
   - Explain what's wrong
   - Suggest correction
3. **Confirm:**
   - Document marked as rejected
   - Reason is visible
   - Intern can resubmit

### Downloading Documents

- Click "⬇️ Download" on any document
- File downloads to your computer
- Keep for records if needed

### Document Types Supported

- 📄 **PDF:** Certificates, forms, letters
- 🖼️ **JPG/PNG:** Photos, ID cards
- 📝 **DOC/DOCX:** Additional documents

### Typical Documents Required

1. ✅ Resume/CV
2. ✅ Degree Certificate
3. ✅ Photo ID (Aadhar, PAN, etc.)
4. ✅ Address Proof
5. ✅ Bank Details (for stipend)
6. ⚪ Additional documents as needed

---

## Offer Letter Generation

### Prerequisites

Before generating an offer, ensure:
- ✅ Intern is added to system
- ✅ All documents are verified
- ✅ Interview is completed
- ✅ Intern status shows "Ready"

### Finding Ready Interns

1. Navigate to **"Offer Letters"**
2. Look at **"Interns Ready for Offer"** section
3. These interns have completed all steps
4. Ready for offer generation

### Generating an Offer

1. **Select Intern:**
   - Click "✍️ Generate Offer" on ready intern

2. **Fill Offer Details:**
   
   **Position Information:**
   - Position: Job title (e.g., "Software Engineering Intern")
   - Department: Working department (e.g., "Technology")
   
   **Compensation:**
   - Monthly Stipend: Amount in ₹ (e.g., "25000")
   - Duration: Length of internship (e.g., "6 months")
   
   **Work Details:**
   - Start Date: First day of internship
   - Location: Office location
   - Work Mode: On-site/Remote/Hybrid
   
   **Management:**
   - Reporting Manager: Supervisor name

3. **Generate:**
   - Click "Generate Offer Letter"
   - Offer is created
   - Status changes to "Generated"

### Previewing Offer Letters

1. **Find the Offer:**
   - Go to "Generated Offers" table
   - Locate the intern's offer

2. **Click "👁️ Preview"**

3. **Review Content:**
   - Check all details are correct
   - Verify formatting
   - Ensure no errors
   - Professional appearance

4. **Offer Letter Structure:**
   - Company letterhead
   - Date
   - Intern address
   - Subject line
   - Welcome message
   - Position details table
   - Terms & conditions
   - Signature block
   - Acceptance section

### Downloading Offers

- **Click "⬇️ Download PDF"** in preview
- PDF file is saved
- Use for printing or records
- Can be attached to emails

### Sending Offers via Email

1. **In Preview Mode:**
   - Click "📧 Send via Email"

2. **Confirmation:**
   - System confirms sending
   - Status updates to "Sent"
   - Intern receives email

3. **Email Contains:**
   - Offer letter attachment
   - Instructions for acceptance
   - Contact information
   - Deadline for response

### Tracking Offer Status

**Status Indicators:**
- 🔵 **Ready:** Eligible for offer generation
- 🟡 **Generated:** Offer created but not sent
- 🟢 **Sent:** Offer emailed to intern

### Managing Multiple Offers

**In the Offers Table:**
- View all generated offers
- Sort by date
- Filter by status
- Quick actions available
- Track acceptance status

---

## Tips & Best Practices

### General Navigation

✅ **Use Keyboard Shortcuts:**
- Tab: Navigate through form fields
- Enter: Submit forms
- Esc: Close modals

✅ **Save Regularly:**
- Forms auto-validate
- Complete required fields
- Don't leave forms half-filled

✅ **Use Search Effectively:**
- Be specific in searches
- Use partial names if unsure
- Combine with filters

### College Management

✅ **Plan Ahead:**
- Add college visits well in advance
- Keep coordinator info updated
- Note special requirements

✅ **Track Slots:**
- Monitor available positions
- Update after recruitment
- Coordinate with teams

### Intern Management

✅ **Consistent Status Updates:**
- Update status promptly
- Keep information current
- Use notes for special cases

✅ **Regular Follow-ups:**
- Check pending documents
- Remind interns of deadlines
- Track progress weekly

### Document Verification

✅ **Thorough Review:**
- Check document clarity
- Verify information accuracy
- Ensure completeness

✅ **Clear Rejection Reasons:**
- Be specific about issues
- Provide actionable feedback
- Maintain professional tone

✅ **Quick Processing:**
- Review documents promptly
- Don't let them pile up
- Set aside dedicated time

### Offer Generation

✅ **Double-Check Details:**
- Verify all information
- Check dates carefully
- Confirm stipend amount
- Validate location

✅ **Professional Tone:**
- Use formal language
- Check spelling
- Review formatting

✅ **Timely Sending:**
- Send offers promptly
- Set acceptance deadlines
- Follow up if no response

### Performance Tips

✅ **Close Unused Tabs:**
- Keep browser responsive
- Avoid memory issues

✅ **Regular Logout:**
- Secure your session
- Refresh data
- Clear cache if needed

✅ **Use Filters:**
- Reduce data load
- Find information faster
- Focus on relevant items

### Workflow Efficiency

**Recommended Daily Routine:**

1. **Morning:**
   - Check Dashboard for overview
   - Review pending documents
   - Check new intern applications

2. **Midday:**
   - Verify documents
   - Update intern statuses
   - Generate due offers

3. **Evening:**
   - Review completed tasks
   - Plan next college visits
   - Send pending communications

### Common Workflows

**Intern Onboarding Flow:**
```
1. Add Intern (after college visit)
2. Wait for Documents Upload
3. Verify Documents (one by one)
4. Generate Offer Letter
5. Send Offer via Email
6. Track Acceptance
7. Update to Onboarding
8. Finally mark as Active
```

**College Recruitment Flow:**
```
1. Add College Visit (schedule)
2. Coordinate with Coordinator
3. Conduct Campus Drive
4. Add Selected Interns
5. Mark College Visit as Completed
6. Begin Intern Processing
```

### Troubleshooting

**If something doesn't load:**
- Refresh the page (F5)
- Clear browser cache
- Check internet connection

**If form won't submit:**
- Check all required fields (marked with *)
- Ensure valid email format
- Verify date formats
- Look for error messages

**If you're logged out:**
- Session may have expired
- Login again
- Data is preserved

### Security Best Practices

✅ **Protect Your Account:**
- Use strong passwords
- Don't share credentials
- Logout when done
- Don't save passwords on shared computers

✅ **Data Privacy:**
- Handle intern data responsibly
- Don't share sensitive information
- Follow company policies

### Getting Help

**Need Assistance?**
- Check this user guide
- Review tooltips in app
- Contact system administrator
- Refer to company policies

---

## Quick Reference Card

### Common Actions

| Action | Where | Button/Link |
|--------|-------|-------------|
| Login | Login Page | Sign In |
| Add College | Colleges | ➕ Add College Visit |
| Add Intern | Interns | ➕ Add Intern |
| Verify Document | Documents | ✓ Verify |
| Generate Offer | Offers | ✍️ Generate Offer |
| Preview Offer | Offers Table | 👁️ Preview |
| Download | Various | ⬇️ Download |
| Logout | Sidebar Bottom | 🚪 Logout |

### Status Colors

| Color | Meaning |
|-------|---------|
| 🟢 Green | Success, Verified, Active, Sent |
| 🟡 Yellow | Pending, Warning, In Progress |
| 🔴 Red | Rejected, Error, Failed |
| 🔵 Blue | Info, Processing, Scheduled |
| ⚪ Gray | Inactive, Neutral |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Next field |
| Shift+Tab | Previous field |
| Enter | Submit form |
| Esc | Close modal |
| Ctrl+F | Search (browser) |

---

## Conclusion

This user guide covers all aspects of the Wissen Intern Management System. With regular use, you'll become proficient in managing the entire intern lifecycle efficiently.

**Remember:**
- Save your work regularly
- Keep information updated
- Follow the workflow
- Use filters and search
- Logout when done

**Happy Managing! 🎓**

---

*Last Updated: January 19, 2026*
*Version: 1.0.0*
*For questions or support, contact your system administrator*
