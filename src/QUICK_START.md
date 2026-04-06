# Quick Start Guide - CampusConnect Faculty Booking

Get started booking extra classes in 2 minutes! 🚀

---

## 📝 Prerequisites

1. Have a faculty account created
2. Be logged into CampusConnect
3. Know the Year, Branch, and Batch for your class

---

## 🎯 Booking Your First Extra Class

### Step 1: Navigate to Booking Interface

**Option A: Timetable View** (Recommended)
- Click on "Timetable" tab in Faculty Dashboard
- See the weekly college timetable
- Click any **empty slot** (white/gray box with "Click to book")

**Option B: Monthly View**
- Click on "Monthly View" tab
- Select a date from the calendar
- Click "Book Extra Class" button

### Step 2: Fill the Booking Form

When the booking modal opens, you'll see:

#### 📅 Date & Time
- **Pre-filled** with your selected date and time
- **Red background?** You selected a past date - choose a future date instead

#### 🏛️ Hall ID
- **Auto-selected** to first available hall
- **Dropdown shows**:
  - ✅ **Available Halls** (green, can select)
  - 🔒 **Occupied Halls** (grayed out, shows what's there)

#### 📚 Year/Batch
- Select student year: Y22, Y23, Y24, or Y25

#### 🏢 Branch
- Select: CSE, ECE, CCE, or MECH

#### 👥 Batch
- **Automatically filters** based on your Branch selection
- Example: CSE Y23 only shows B1, B2

#### 📖 Course Name
- Type your course name (e.g., "Data Structures Lab")

#### ☑️ Extra Class Checkbox
- Keep this **checked** (it's an extra class!)

### Step 3: Review Warnings (If Any)

#### 🔴 Red Alert: All Halls Occupied
- **Means**: No halls available at this time
- **Action**: Choose a different time slot

#### 🟡 Yellow Warning: 4+ Classes
- **Means**: This batch already has 4+ classes that day
- **Note**: You can still book, but students may have a hectic day

### Step 4: Confirm Booking

1. Click **"Confirm Booking"** button
2. Wait for success notification (green toast, top-right)
3. Modal closes automatically
4. Your extra class appears with **orange badge**

---

## ✨ What Happens After Booking?

### Immediate Effects:
- ✅ Class appears in timetable with **orange background**
- ✅ Hall is marked as **occupied** for other faculty
- ✅ Students in that batch can see the extra class
- ✅ Booking is **saved automatically**

### Data Persistence:
- 💾 Saved to **localStorage** (browser storage)
- ☁️ Or **Supabase database** (if configured)
- 🔒 Survives logout and page refresh
- 🌐 Visible to other faculty members

---

## 👀 Viewing Your Booked Classes

### In Timetable View:
- Look for **orange boxes** with "Extra" badge
- Your extra classes stand out from regular classes (blue)

### In Monthly View:
- Dates with extra classes have **orange highlighting**
- Click a date to see all classes that day

---

## 🎓 What Students See

Students with matching Year+Branch+Batch will see:
- Your extra class in their personalized schedule
- **Orange badge** indicating it's an extra class
- Hall location and time
- Course name you entered

---

## 🚫 Common Mistakes to Avoid

### ❌ Don't Book Past Dates
- System blocks this automatically
- Always select future dates

### ❌ Don't Ignore Warnings
- 4+ class warning = students may be overwhelmed
- Consider their schedule load

### ❌ Don't Book Occupied Halls
- System prevents this
- Choose from available halls only

### ❌ Don't Forget Course Name
- Required field
- Be specific so students know what class it is

---

## 🔧 Troubleshooting Quick Fixes

### "Cannot book this date"
→ You selected a past date. Choose tomorrow or later.

### "All halls are occupied"
→ Pick a different time slot. Try an hour earlier or later.

### Batch dropdown shows wrong options
→ Check your Branch selection. CSE Y23 only has B1, B2.

### Booking doesn't appear after refresh
→ Should appear automatically. Check:
- Same browser?
- Logged in as same faculty?
- Check localStorage in DevTools

### Success toast says "Saved locally"
→ Normal! Supabase isn't configured. Your booking is safe in localStorage.

---

## 💡 Pro Tips

### Efficient Booking:
1. **Use Timetable View** - See all existing classes at a glance
2. **Book in advance** - Don't wait until last minute
3. **Check batch schedule** - See if they're already busy that day
4. **Pick off-peak times** - 08:00-09:00 or after 16:00

### Avoiding Conflicts:
1. **Filter timetable** by batch first
2. **Count existing classes** before adding more
3. **Use monthly view** to see overall schedule
4. **Coordinate with colleagues** about popular time slots

### Batch Selection:
- **Y23 CSE** → B1, B2 only
- **Y23 ECE** → A1, A2 only
- **Y25 All Branches** → All batches available
- **Other combinations** → Check dropdown for options

---

## 📱 Mobile Booking

Works great on mobile! Just:
1. Tap on time slot
2. Fill form (same as desktop)
3. Tap "Confirm Booking"

---

## 🎉 Success Indicators

You'll know booking succeeded when you see:

1. ✅ **Green toast notification**
   - Top-right corner
   - Says "Class booked successfully!"

2. 🟧 **Orange class box**
   - In timetable view
   - Shows your course name

3. 🏷️ **"Extra" badge**
   - Orange colored
   - On your class box

4. 📝 **Console message** (for tech users)
   - F12 to open console
   - See "Booking saved to..."

---

## 📞 Need Help?

### Check These Resources:
- **TESTING_CHECKLIST.md** - Verify features work
- **BOOKING_PERSISTENCE_GUIDE.md** - Data storage details
- **RECENT_IMPROVEMENTS.md** - Feature explanations
- **Browser Console** - Check for error messages

### Still Stuck?
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Application → Local Storage → campusconnect_bookings
4. Verify you're logged in as Faculty role

---

## 🚀 Ready to Go!

You're all set! Start booking extra classes for your students.

**Remember**: 
- Choose future dates only
- Check hall availability
- Mind the 4+ class warning
- Your bookings are saved automatically

**Happy booking!** 🎓✨

---

*Last Updated: November 2025*
*CampusConnect v2.1*
