# 🎓 CampusConnect - Lecture Hall Management System

> A comprehensive, production-ready timetable and booking system for universities with role-based access control, smart scheduling constraints, and flexible data import options.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Status](https://img.shields.io/badge/status-production--ready-green)
![Auth](https://img.shields.io/badge/auth-supabase-orange)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Quick Start](#-quick-start)
- [User Roles](#-user-roles)
- [Import Timetable Data](#-import-timetable-data)
- [Documentation](#-documentation)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Security](#-security)
- [Support](#-support)

---

## 🌟 Overview

**CampusConnect** is a 5th semester project built for comprehensive lecture hall management across multiple batches, branches, and departments. It features three distinct user roles with granular permissions, smart booking constraints to prevent overloading students, and a powerful timetable import system supporting CSV, JSON, and manual entry.

### Built For
- **Universities** managing multiple departments
- **Colleges** with 4+ batches and branches
- **Institutions** needing secure, role-based access
- **Administrators** requiring bulk data import capabilities

---

## ✨ Key Features

### 🔐 Security & Authentication
- ✅ **Role-Based Access Control (RBAC)** - Students, Faculty, and Admins each see only their authorized views
- ✅ **Supabase Authentication** - Production-ready auth with session management
- ✅ **Always-Visible Logout** - Accessible even when sidebar is collapsed
- ✅ **No Role Switching** - Users locked to their assigned role for security

### 📊 Admin Capabilities
- ✅ **View All Timetables** - Complete visibility across batches and branches
- ✅ **Three Import Methods:**
  - **Manual Entry** - Add 1-10 classes via intuitive form
  - **CSV Upload** - Bulk import from Excel/Google Sheets
  - **JSON Import** - Programmatic data import for developers
- ✅ **Template Downloads** - Pre-formatted CSV and JSON templates
- ✅ **Hall Management** - Manage 19 lecture halls (L1-L19)
- ✅ **Metrics Dashboard** - Track bookings, conflicts, and usage

### 👩‍🏫 Faculty Features
- ✅ **Book Extra Classes** - Request additional sessions
- ✅ **Smart Constraints** - System warns when booking would result in 4+ classes/day for a batch
- ✅ **Conflict Detection** - Prevents double-booking same hall/time
- ✅ **Waiting List** - Automatic queue for occupied slots
- ✅ **Personal Schedule View** - See your teaching timetable

### 🧑‍🎓 Student Features
- ✅ **Personalized Schedule** - See only your batch and branch classes
- ✅ **Extra Class Highlights** - Differentiated display for additional sessions
- ✅ **Read-Only Access** - Secure view-only permissions
- ✅ **Date/Subject Filters** - Easy schedule navigation

### 🎨 Modern UI/UX
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Glassmorphism Effects** - Modern, professional appearance
- ✅ **Gray/Black Theme** - Clean, non-distracting color palette
- ✅ **Collapsible Sidebar** - Maximizes screen real estate
- ✅ **Toast Notifications** - Real-time feedback for all actions

---

## 🚀 Quick Start

### 1. Create Your Account

```
1. Open CampusConnect
2. Click "Register" tab
3. Fill in:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Role (Student/Faculty/Admin)
4. Click "Create Account"
```

### 2. Login

```
1. Switch to "Login" tab
2. Enter email and password
3. Click "Login to Dashboard"
4. Redirected to your role-specific dashboard
```

### 3. For Admins: Import Timetable

```
1. Click "Import Timetable" button
2. Choose method:
   - Manual Entry (1-10 classes)
   - CSV Upload (bulk import - recommended)
   - JSON Import (developers)
3. Download template (CSV or JSON)
4. Fill with your data
5. Upload and verify
```

**See:** `TIMETABLE_IMPORT_GUIDE.md` for detailed instructions

---

## 👥 User Roles

| Role | Dashboard Access | Can Book | Can Import | Can Approve |
|------|-----------------|----------|------------|-------------|
| **Admin** | All batches/branches | ✅ | ✅ | ✅ |
| **Faculty** | Personal schedule | ✅ | ❌ | ❌ |
| **Student** | Own batch/branch | ❌ | ❌ | ❌ |

### Admin
- Full system control
- Import timetables (CSV/JSON/Manual)
- Manage halls and bookings
- Approve faculty requests
- View all schedules

### Faculty
- View teaching schedule
- Book extra classes
- See constraint warnings
- Join waiting lists
- Check available slots

### Student
- View personalized timetable
- See regular and extra classes
- Filter by date/subject
- Read-only access
- Batch/branch specific

**See:** `ROLE_BASED_ACCESS.md` for complete details

---

## 📥 Import Timetable Data

### Method 1: CSV Upload (Recommended)

**Best for:** Bulk import of 10-1000 classes

**Flexible Format Support:**
```csv
# Comments allowed (lines starting with #)
date,startTime,endTime,hallId,subject,faculty,batch,branch,type
# 12-hour format
2025-10-27,08:30 AM - 09:25 AM,09:25 AM,L1,Data Structures,Dr. Smith,Y23,CSE,regular
# 24-hour format (auto-converted)
2025-10-27,08:00,09:00,L2,DBMS,Dr. Jones,Y24 IC,PC,regular
# Quoted values for commas in subject/faculty
2025-10-27,09:00,10:00,L3,"Advanced Topics","Dr. A, Dr. B",Y25 Repeaters,PE,regular
```

**Auto-mapping:**
- ✅ Branch codes: IC/PC→CSE, PE→ECE, OE→CCE, ME→MECH
- ✅ Batch extraction: "Y23 Repeaters" → Y23
- ✅ Time conversion: "08:00" → "08:00 AM - 09:00 AM"
- ✅ Comment lines (starting with #) are skipped

**Steps:**
1. Download CSV template from Import dialog
2. Fill with your schedule data (flexible format!)
3. Upload in Admin Dashboard
4. System validates and imports

**See:** `CSV_FORMAT_GUIDE.md` for detailed format documentation

### Method 2: JSON Import

**Best for:** Developers and API integration

```json
[
  {
    "date": "2025-10-27",
    "startTime": "08:30 AM - 09:25 AM",
    "endTime": "09:25 AM",
    "hallId": "L1",
    "subject": "Data Structures",
    "faculty": "Dr. John Smith",
    "batch": "Y23",
    "branch": "CSE",
    "type": "regular"
  }
]
```

### Method 3: Manual Entry

**Best for:** Adding 1-10 classes quickly

Form-based interface with:
- Date picker
- Time slot dropdown
- Hall, batch, branch selectors
- Subject and faculty inputs

**See:** `IMPORT_QUICK_REFERENCE.md` for cheat sheet

---

## 📚 Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| **README.md** | This file - project overview | Everyone |
| **QUICK_START.md** | Getting started guide | New users |
| **FEATURES_OVERVIEW.md** | Complete feature list | Everyone |
| **TIMETABLE_IMPORT_GUIDE.md** | Detailed import instructions | Admins |
| **CSV_FORMAT_GUIDE.md** | **NEW! Flexible CSV format guide** | **Admins** |
| **IMPORT_QUICK_REFERENCE.md** | Import cheat sheet | Admins |
| **ROLE_BASED_ACCESS.md** | RBAC documentation | Admins, Security |
| **SECURITY_SUMMARY.md** | Security features | Everyone |
| **DATABASE_SETUP.md** | Backend integration | Developers |

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Shadcn/ui** - Component library
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Database and authentication
- **Hono** - Edge function framework
- **Deno** - Runtime environment

### Key Libraries
- `react-hook-form@7.55.0` - Form handling
- `date-fns` - Date manipulation
- `motion/react` - Animations

---

## 🖼️ Screenshots

### Login Page
- Compact centered card design
- Gray/black professional theme
- Campus background with overlay
- Register and Login tabs

### Admin Dashboard
- Metrics cards (Halls, Bookings, Conflicts)
- **Import Timetable** button (prominent)
- Hall management table
- Complete timetable grid

### Faculty Dashboard
- Personal teaching schedule
- **Book Extra Class** button
- Constraint warning system
- Waiting list interface

### Student Dashboard
- Personalized timetable
- Extra class highlights
- Date and subject filters
- Read-only schedule view

---

## 🔒 Security

### Implemented Security Features

✅ **Authentication**
- Supabase-backed user accounts
- Secure password hashing
- Token-based sessions

✅ **Authorization**
- Role-based access control
- No cross-role dashboard access
- Protected API endpoints

✅ **Session Management**
- Automatic session refresh
- Persistent login across tabs
- Secure logout (always visible)
- Clean state reset

✅ **Data Protection**
- Service role key never exposed to frontend
- User tokens validated on backend
- Role stored in secure auth metadata

**See:** `SECURITY_SUMMARY.md` for complete details

---

## 📊 System Data

### Supported Configurations

**Batches:** Y22, Y23, Y24, Y25 (4 batches)  
**Branches:** CSE, ECE, CCE, MECH (4 branches)  
**Halls:** L1 through L19 (19 lecture halls)  
**Time Slots:** 8 predefined slots per day

### Time Slots
```
08:30 AM - 09:25 AM
09:25 AM - 10:20 AM
10:40 AM - 11:35 AM
11:35 AM - 12:30 PM
01:30 PM - 02:25 PM
02:25 PM - 03:20 PM
03:30 PM - 04:25 PM
04:25 PM - 05:20 PM
```

---

## 🎯 Use Cases

### Scenario 1: Semester Start
**Problem:** Need to import 500+ classes for new semester  
**Solution:** 
1. Export schedule from Excel as CSV
2. Admin clicks "Import Timetable"
3. Upload CSV file
4. System imports in seconds
5. All students/faculty see updated schedules

### Scenario 2: Extra Class Booking
**Problem:** Faculty needs to schedule makeup class  
**Solution:**
1. Faculty opens booking modal
2. Selects date, time, hall, batch
3. System checks: "Warning: 4 classes on this day"
4. Faculty confirms or chooses different slot
5. Admin approves booking

### Scenario 3: Student Schedule Check
**Problem:** Student needs to see today's classes  
**Solution:**
1. Student logs in
2. Dashboard shows personalized schedule
3. Only Y23 CSE classes visible
4. Extra classes highlighted
5. Can filter by date

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** "Invalid credentials" on login  
**Solution:** Verify email and password, ensure you've registered first

**Issue:** CSV import failing  
**Solution:** Use provided template, check all required fields are filled

**Issue:** Classes not showing  
**Solution:** Verify batch/branch match, check date filter

**Issue:** Cannot book class  
**Solution:** Check if you're logged in as Faculty, verify hall availability

**Issue:** Logout button not visible  
**Solution:** Button is always visible now (both sidebar states)

**See:** Individual documentation files for detailed troubleshooting

---

## 🚀 Deployment

### Development Mode
```bash
# Clone repository
git clone <repo-url>

# Install dependencies (if using npm/yarn)
npm install

# Start development server
npm run dev
```

### Production
- Configure Supabase project
- Set environment variables
- Deploy to hosting platform (Vercel, Netlify, etc.)
- See `DATABASE_SETUP.md` for backend configuration

---

## 🤝 Contributing

This is a 5th semester academic project. For educational use.

### Project Team
- Role-based access implementation
- Timetable import system
- UI/UX design
- Backend integration
- Documentation

---

## 📝 License

Educational Use - 5th Semester Project

---

## 📞 Support

### Getting Help

1. **Read Documentation** - Check the relevant .md file for your question
2. **Check Console** - Browser console shows detailed error messages
3. **Test with Templates** - Use provided CSV/JSON templates
4. **Review Examples** - Documentation includes working examples

### Documentation Quick Links

- 🚀 New User? → `QUICK_START.md`
- 📥 Importing Data? → `TIMETABLE_IMPORT_GUIDE.md`
- 🔒 Security Question? → `SECURITY_SUMMARY.md`
- 🛠️ Developer? → `DATABASE_SETUP.md`
- ❓ General Info? → `FEATURES_OVERVIEW.md`

---

## ✅ Feature Checklist

### Core Functionality ✅
- [x] User authentication (register/login)
- [x] Role-based dashboards
- [x] Timetable display
- [x] Extra class booking
- [x] Smart constraints
- [x] Waiting lists

### Data Management ✅
- [x] Manual entry import
- [x] CSV bulk import
- [x] JSON import
- [x] Template downloads
- [x] Real-time validation

### Security ✅
- [x] RBAC implementation
- [x] Protected routes
- [x] Session management
- [x] Secure logout
- [x] No role switching

### UI/UX ✅
- [x] Responsive design
- [x] Mobile-friendly
- [x] Collapsible sidebar
- [x] Toast notifications
- [x] Professional theme

---

## 🎉 Ready to Use!

CampusConnect is **production-ready** and includes:

✅ Complete authentication system  
✅ Three distinct user roles  
✅ Multiple data import methods  
✅ Smart booking constraints  
✅ Comprehensive documentation  
✅ Modern, responsive UI  
✅ Secure logout feature  
✅ Database integration  

**Start managing your lecture halls today!**

---

**Version:** 2.0  
**Last Updated:** October 24, 2025  
**Status:** Production Ready  
**Built with** ❤️ **for Educational Excellence**

---

### Quick Links

- 📖 [Full Documentation](#-documentation)
- 🚀 [Quick Start Guide](#-quick-start)
- 📥 [Import Instructions](#-import-timetable-data)
- 🔒 [Security Features](#-security)
- 👥 [User Roles](#-user-roles)
- 🛠️ [Tech Stack](#-tech-stack)

---

**Have questions?** Check the documentation files or review the code comments. Everything you need is included!
