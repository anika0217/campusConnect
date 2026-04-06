# CampusConnect Testing Checklist

Use this checklist to verify all new features are working correctly.

---

## ✅ Past Date Prevention

### Test Steps:
1. Login as Faculty
2. Navigate to Timetable or Monthly view
3. Try to click on a time slot from yesterday or any past date
4. When modal opens, observe:

### Expected Results:
- [ ] Date input field has red background (`bg-red-50`)
- [ ] Red warning text appears: "This date is in the past. Please select a future date."
- [ ] Calendar icon shows in warning message
- [ ] "Confirm Booking" button is disabled
- [ ] Clicking submit shows alert: "Cannot book classes for past dates..."

---

## ✅ Data Persistence (localStorage Fallback)

### Test Steps:
1. Login as Faculty (e.g., `faculty@test.com`)
2. Book an extra class:
   - Select a future date
   - Choose hall: L5
   - Year: Y23, Branch: CSE, Batch: B1
   - Course: "Test Extra Class"
   - Click "Confirm Booking"
3. Observe success notification
4. **Logout** from the system
5. **Login again** as the same faculty
6. Navigate to the same date in timetable

### Expected Results:
- [ ] Success toast shows: "Class booked successfully! (Saved locally)"
- [ ] Console shows: `💾 Booking saved to localStorage`
- [ ] After logout and login, the extra class is still visible
- [ ] Extra class has orange background and "Extra" badge
- [ ] Opening browser DevTools → Application → Local Storage shows `campusconnect_bookings`

---

## ✅ Conflict Prevention

### Test Steps:
1. Login as Faculty A
2. Book an extra class:
   - Date: Tomorrow
   - Time: 10:00
   - Hall: L7
   - Year: Y23, Branch: ECE, Batch: A1
3. Note the booking succeeds
4. **Try to book another class**:
   - Same date: Tomorrow
   - Same time: 10:00
   - Try to select Hall: L7

### Expected Results:
- [ ] L7 appears in "Occupied Halls" section (disabled, grayed out)
- [ ] Shows: "L7 - [Course Name] (Y23 ECE-A1)"
- [ ] Cannot select L7 from dropdown
- [ ] Must choose a different hall
- [ ] If all halls occupied, shows red alert: "All halls are occupied at this time slot"

### Test with Multiple Faculty:
1. Login as Faculty A → Book L5 at 14:00 tomorrow
2. Logout, Login as Faculty B
3. Try to book at same time (14:00 tomorrow)

### Expected Results:
- [ ] Faculty B sees L5 as occupied
- [ ] Faculty B cannot select L5
- [ ] Booking prevents conflict across different faculty accounts

---

## ✅ Dynamic Batch Filtering

### Test Steps:
1. Login as Faculty
2. Open booking modal for any future date
3. **Test Y23 + CSE**:
   - Select Year: Y23
   - Select Branch: CSE
   - Look at Batch dropdown

### Expected Results:
- [ ] Only B1 and B2 appear in Batch dropdown
- [ ] A1, A2, A3, B3 are NOT shown

### Test Y23 + ECE:
4. Change Branch to ECE (keep Year: Y23)

### Expected Results:
- [ ] Batch dropdown updates automatically
- [ ] Only A1 and A2 appear
- [ ] If B1 was previously selected, it auto-changes to A1

### Test Y25 + Any Branch:
5. Change Year to Y25
6. Select any Branch

### Expected Results:
- [ ] All batches shown: A1, A2, A3, B1, B2, B3
- [ ] Full batch selection available

---

## ✅ 4+ Class Warning

### Test Steps:
1. Login as Faculty
2. Find a date where Y23 CSE-B1 already has 4+ classes (check timetable)
3. Try to book an extra class for Y23 CSE-B1 on that date

### Expected Results:
- [ ] Yellow warning alert appears
- [ ] Warning icon (triangle) visible
- [ ] Message: "Warning: This batch currently has 4+ classes. Booking this extra slot may make the day too hectic for students. Confirm?"
- [ ] Warning has yellow background (`bg-yellow-50`)
- [ ] Can still proceed with booking (not blocked, just warned)

### Test Dynamic Update:
4. Start with Year: Y22, Branch: CSE, Batch: B1 (not busy)
5. Change to Year: Y23, Branch: CSE, Batch: B1 (busy)

### Expected Results:
- [ ] Warning appears/disappears dynamically as selections change
- [ ] Warning only shows for specific batch combinations
- [ ] Count is accurate (checks all existing classes)

---

## ✅ Toast Notifications

### Test Scenarios:

#### Success with localStorage:
1. Book a class (Supabase not configured / RLS blocked)

### Expected Results:
- [ ] Green success toast appears top-right
- [ ] Message: "Class booked successfully! (Saved locally)"
- [ ] Toast auto-dismisses after a few seconds
- [ ] Close button (X) present

#### Error Scenario:
1. Try to book without login (manually trigger)

### Expected Results:
- [ ] Red error toast appears
- [ ] Message: "Please login to book a class"

---

## ✅ Student View of Extra Classes

### Test Steps:
1. Login as Faculty
2. Book extra class: Tomorrow, Y23, CSE-B1, "Machine Learning Lab"
3. Logout
4. Login as Student:
   - Email: `student@test.com`
   - Password: `password`
   - Year: Y23, Branch: CSE, Batch: B1
5. Navigate to timetable

### Expected Results:
- [ ] Extra class "Machine Learning Lab" is visible
- [ ] Has orange background (`bg-orange-100`)
- [ ] Shows orange "Extra" badge
- [ ] Hall location shown
- [ ] In monthly view, date has orange highlight
- [ ] Extra class shows in student's personalized schedule

### Test Batch Filtering:
6. Login as different student (Y23 ECE-A1)

### Expected Results:
- [ ] CSE-B1 extra class is NOT visible
- [ ] Only sees classes for ECE-A1
- [ ] Batch filtering works correctly

---

## ✅ Browser Console Messages

### Check Console for Proper Logging:

#### On Login:
```
✅ Loaded N extra classes from localStorage
OR
✅ Loaded N extra classes from database
OR
✅ Loaded N extra classes from database+localStorage
```

#### On Booking Creation:
```
💾 Booking saved to localStorage: [object]
OR
✅ Booking saved to database: [object]
```

#### On RLS Error:
```
⚠️ Database save failed (RLS policy): [error message]
💡 Saving to localStorage instead...
💾 Saving to localStorage (database unavailable)
```

---

## ✅ localStorage Verification

### Check Stored Data:
1. Open browser DevTools (F12)
2. Go to: Application → Storage → Local Storage → your-domain
3. Find key: `campusconnect_bookings`

### Expected Format:
```json
[
  {
    "id": "booking:1731052800000_abc123xyz",
    "hallId": "L5",
    "year": "Y23",
    "branch": "CSE-B1",
    "courseName": "Extra Lab Session",
    "date": "2025-11-15",
    "startTime": "14:00",
    "endTime": "15:00",
    "isExtraClass": true,
    "facultyName": "Dr. Smith",
    "createdBy": "user-uuid",
    "createdAt": "2025-11-08T10:30:00.000Z"
  }
]
```

### Verify:
- [ ] Array structure present
- [ ] All booking fields included
- [ ] Timestamps are ISO format
- [ ] isExtraClass is true
- [ ] branch format is "BRANCH-BATCH"

---

## 🔧 Edge Cases to Test

### Past Date Edge Cases:
- [ ] Today at 23:59 → Can book
- [ ] Yesterday at any time → Cannot book
- [ ] Last week → Cannot book
- [ ] Next month → Can book

### Batch Selection Edge Cases:
- [ ] Switch from CSE to ECE → Batch updates
- [ ] Switch from Y23 to Y25 → More batches available
- [ ] Invalid batch for branch → Auto-corrects

### Hall Occupancy Edge Cases:
- [ ] All 19 halls occupied → Cannot book (error shown)
- [ ] 18 halls occupied → Can select last available hall
- [ ] Hall occupied by timetable class → Shows as occupied
- [ ] Hall occupied by extra class → Shows as occupied

### Conflict Prevention Edge Cases:
- [ ] Same faculty books twice → Second booking sees first as occupied
- [ ] Different faculty books same slot → Conflict prevented
- [ ] Logout and login → Conflicts still detected

---

## 📊 Summary Checklist

- [ ] Past dates are blocked with visual feedback
- [ ] Bookings persist after logout/login
- [ ] localStorage stores data correctly
- [ ] Hall conflicts are prevented
- [ ] Batch filtering matches branch selection
- [ ] 4+ class warnings appear correctly
- [ ] Toast notifications show success/error
- [ ] Students see extra classes with orange badges
- [ ] Console shows appropriate messages
- [ ] Multiple faculty users see each other's bookings

---

## ✅ All Tests Passed?

If all checkboxes above are checked, the system is working correctly! 🎉

If any test fails, check:
1. Browser console for errors
2. localStorage data structure
3. Component state updates
4. Network tab for API calls (if using Supabase)

---

## 🐛 Common Issues & Solutions

### Issue: Extra classes not showing after login
**Solution**: Check browser console for "Loaded N extra classes" message. Verify localStorage has data.

### Issue: Can't book any class (all halls show as occupied)
**Solution**: Check if date/time has 19+ existing bookings. Try different time slot.

### Issue: Batch dropdown shows wrong batches
**Solution**: Verify Year and Branch selections. Should match LoginPage logic.

### Issue: Warning appears for batch with < 4 classes
**Solution**: Count includes both timetable AND extra classes. Check all bookings for that date.

### Issue: Toast notifications don't appear
**Solution**: Verify Toaster component is mounted in App.tsx. Check browser console for errors.
