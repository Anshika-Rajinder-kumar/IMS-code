# Automatic Credential Generation System

## Overview
The Wissen IMS now automatically generates and emails login credentials when creating colleges and interns.

## How It Works

### 1. College Account Creation
When an Admin/HR creates a new college:
- ✅ A secure 12-character password is automatically generated
- ✅ A user account is created with `COLLEGE` user type
- ✅ The college email receives login credentials
- ✅ Password contains: uppercase, lowercase, numbers, and special characters

**Process:**
1. Admin navigates to Colleges page
2. Clicks "Add College" and fills in details
3. System creates college record + user account
4. Email sent to college coordinator with:
   - Email (same as college email)
   - Auto-generated password
   - Login URL
   - Instructions

### 2. Intern Account Creation
When an Admin/HR creates a new intern:
- ✅ A secure 12-character password is automatically generated
- ✅ A user account is created with `INTERN` user type
- ✅ The intern email receives login credentials
- ✅ Password contains: uppercase, lowercase, numbers, and special characters

**Process:**
1. Admin navigates to Interns page
2. Clicks "Add Intern" and fills in details
3. System creates intern record + user account
4. Email sent to intern with:
   - Email (same as intern email)
   - Auto-generated password
   - Login URL
   - Instructions

## User Types

### ADMIN
- **Registration:** Manual registration via /register page
- **Access:** Full system access
- **Can Create:** Colleges, Interns, HR users

### HR
- **Registration:** Manual registration via /register page
- **Access:** Manage interns and hiring process
- **Can Create:** Colleges, Interns

### COLLEGE
- **Registration:** Auto-created when college is added
- **Access:** View students' hiring status
- **Dashboard:** Hiring Status page filtered by college

### INTERN
- **Registration:** Auto-created when intern is added
- **Access:** Manage documents, view offers
- **Dashboard:** Documents and Offers pages

## Email Configuration

### Development Mode (Default)
If email is not configured, credentials are printed to console logs:
```
==============================================
EMAIL SERVICE NOT CONFIGURED
College: ABC Engineering College
Login Credentials:
Email: coordinator@abc.edu
Password: aB3$xYz9PqRs
Login URL: http://localhost:3000
==============================================
```

### Production Mode
To enable email sending, configure in `application.properties`:

```properties
# Gmail SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
```

**Gmail App Password Setup:**
1. Enable 2-Factor Authentication
2. Go to Google Account Settings
3. Navigate to Security → 2-Step Verification → App passwords
4. Generate app password for "Mail"
5. Use generated password in `spring.mail.password`

### Other Email Providers

**Outlook/Office365:**
```properties
spring.mail.host=smtp.office365.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

**AWS SES:**
```properties
spring.mail.host=email-smtp.us-east-1.amazonaws.com
spring.mail.port=587
spring.mail.username=your-aws-smtp-username
spring.mail.password=your-aws-smtp-password
```

## Security Features

### Password Generation
- **Length:** 12 characters minimum
- **Complexity:** 
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (!@#$%&*)
- **Randomization:** Cryptographically secure random generation
- **Storage:** Passwords are hashed using BCrypt before storage

### Email Content
- ✉️ Professional email template
- 🔐 Includes security reminder to change password
- 📱 Clear instructions for first-time login
- 🚫 Automated message disclaimer

## Testing

### Create College (via UI or API)
```bash
POST http://localhost:8080/api/colleges
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "name": "Test Engineering College",
  "location": "Mumbai",
  "coordinator": "Dr. Kumar",
  "email": "test@college.edu",
  "phone": "9876543210",
  "visitDate": "2026-03-01",
  "slots": 50,
  "status": "SCHEDULED"
}
```

**Expected Result:**
- College created with ID
- User account created (email: test@college.edu)
- Email sent or logged to console with credentials

### Create Intern (via UI or API)
```bash
POST http://localhost:8080/api/interns
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "emergencyContact": "9876543211",
  "college": 1,
  "collegeName": "ABC College",
  "branch": "Computer Science",
  "cgpa": "8.5",
  "joinDate": "2026-03-01",
  "address": "Mumbai",
  "status": "DOCUMENT_PENDING"
}
```

**Expected Result:**
- Intern created with ID
- User account created (email: john@example.com)
- Email sent or logged to console with credentials

## Login Flow

### College Login
1. Go to http://localhost:3000
2. Select "🏫 College" user type
3. Enter email (from college record)
4. Enter password (from email)
5. Redirected to Hiring Status page

### Intern Login
1. Go to http://localhost:3000
2. Select "👨‍🎓 Intern" user type
3. Enter email (from intern record)
4. Enter password (from email)
5. Redirected to Documents page

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify email configuration in application.properties
3. Check console logs for error messages
4. If in development mode, credentials are logged to console

### Invalid Credentials
1. Ensure correct user type is selected
2. Check for typos in email/password
3. Verify account was created (check users table)
4. Contact admin to resend credentials

### Cannot Send Email
1. Check SMTP configuration
2. Verify firewall/network settings
3. Test SMTP credentials separately
4. Check Gmail "Less secure apps" setting (if using Gmail)

## Database Schema

### User Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL, -- ADMIN, HR, COLLEGE, INTERN
    phone VARCHAR(20),
    college_id BIGINT,  -- Links COLLEGE users to colleges table
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Relationships
- `users.college_id` → `colleges.id` (for COLLEGE user type)
- `users.email` → `colleges.email` (unique constraint)
- `users.email` → `interns.email` (unique constraint)

## Future Enhancements

- [ ] Password reset via email
- [ ] Email verification during registration
- [ ] Bulk import colleges/interns with auto-credential generation
- [ ] Customizable email templates
- [ ] SMS notification as alternative to email
- [ ] Multi-language email support
- [ ] Password expiry policy
- [ ] Account activation workflow

---

**Version:** 1.0.0  
**Last Updated:** January 22, 2026  
**Maintained By:** Wissen IMS Development Team
