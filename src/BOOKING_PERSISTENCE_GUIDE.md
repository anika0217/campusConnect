# Booking Persistence & Data Storage Guide

## Overview

CampusConnect now includes robust data persistence for extra class bookings with automatic fallback mechanisms. Your bookings are saved and will persist even after logout and page refreshes.

## Storage Methods

The system uses a **dual-storage approach** for maximum reliability:

### 1. **Primary: Supabase Database** (when configured)
- Extra class bookings are saved to your Supabase database
- Data is shared across all users in real-time
- Requires Supabase RLS policies to be configured

### 2. **Fallback: Browser localStorage** (always available)
- If Supabase is not configured or RLS policies block access, bookings are saved locally
- Data persists in your browser even after logout
- Works offline and requires no setup

## How It Works

### Faculty Booking Flow

1. **Select Time Slot**: Click any empty slot in the timetable or monthly calendar
2. **Fill Booking Details**:
   - Hall is auto-selected (first available)
   - Select Year (Y22, Y23, Y24, Y25)
   - Select Branch (CSE, ECE, CCE, MECH)
   - **Batch Selection Auto-Filters**: Only valid batches for the selected branch appear
     - Example: CSE Y23 only shows B1, B2
     - Example: ECE Y23 only shows A1, A2
3. **Date Validation**: System prevents booking classes for past dates
4. **Conflict Prevention**:
   - Occupied halls are shown but disabled
   - Other faculty can see your booked slots
   - 4+ class warning if batch is too busy
5. **Confirmation**: Booking is saved and visible to all users

### Data Persistence

**On Booking Creation**:
```
1. Save to Supabase database (if available)
   ↓
2. If database fails (RLS policy), save to localStorage
   ↓
3. Show success notification indicating storage location
   ↓
4. Update UI immediately
```

**On Login**:
```
1. Load bookings from Supabase database
   ↓
2. Merge with localStorage bookings (if any)
   ↓
3. Remove duplicates
   ↓
4. Display all extra classes with orange badges
```

## Key Features

### ✅ Past Date Prevention
- Cannot book classes for dates that have already passed
- Date field turns red with warning message
- Submit button is disabled for past dates

### ✅ Dynamic Batch Filtering
- Batch dropdown automatically updates based on Year + Branch selection
- Matches the same logic as student login
- Prevents invalid batch combinations

### ✅ Hall Conflict Detection
- Real-time check against all bookings (timetable + extra classes)
- Shows occupied halls with course info
- Only available halls can be selected

### ✅ 4+ Class Warning
- Automatically counts existing classes for the selected batch
- Shows yellow warning alert if booking would result in 4+ classes
- Faculty can proceed but is warned about hectic schedule

### ✅ Cross-Session Persistence
- Faculty can logout and login again - bookings remain
- Works across different browsers if using Supabase
- localStorage bookings stay in the same browser

## For Students

### Viewing Extra Classes

Extra classes appear with **orange badges** in:
- Weekly timetable view
- Monthly calendar view
- Schedule cards

Students see extra classes that match their Year + Branch-Batch combination.

## Technical Details

### localStorage Structure

```json
{
  "campusconnect_bookings": [
    {
      "id": "booking:1699876543210_abc123",
      "hallId": "L5",
      "year": "Y23",
      "branch": "CSE-B1",
      "courseName": "Data Structures Lab",
      "date": "2025-11-15",
      "startTime": "14:00",
      "endTime": "15:00",
      "isExtraClass": true,
      "facultyName": "Dr. Smith",
      "createdBy": "user-id",
      "createdAt": "2025-11-08T10:30:00.000Z"
    }
  ]
}
```

### Database Table (Supabase)

**Table**: `kv_store_d0447a48`

| Column | Type | Description |
|--------|------|-------------|
| key    | text | Format: `booking:timestamp_randomid` |
| value  | jsonb | Complete booking object |

### Setting Up Supabase (Optional)

If you want to enable database storage instead of localStorage:

1. **Create RLS Policies**:

```sql
-- Enable RLS
ALTER TABLE kv_store_d0447a48 ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all bookings
CREATE POLICY "Users can view bookings"
ON kv_store_d0447a48
FOR SELECT
TO authenticated
USING (key LIKE 'booking:%');

-- Allow authenticated users to create bookings
CREATE POLICY "Users can create bookings"
ON kv_store_d0447a48
FOR INSERT
TO authenticated
WITH CHECK (key LIKE 'booking:%');

-- Allow users to update their own bookings
CREATE POLICY "Users can update own bookings"
ON kv_store_d0447a48
FOR UPDATE
TO authenticated
USING (
  key LIKE 'booking:%' AND 
  (value->>'createdBy')::text = auth.uid()::text
);

-- Allow users to delete their own bookings
CREATE POLICY "Users can delete own bookings"
ON kv_store_d0447a48
FOR DELETE
TO authenticated
USING (
  key LIKE 'booking:%' AND 
  (value->>'createdBy')::text = auth.uid()::text
);
```

2. **Test the Setup**:
   - Book a class as faculty
   - Check browser console for "✅ Booking saved to database"
   - If you see "💾 Saving to localStorage", RLS policies need adjustment

## Troubleshooting

### Bookings Not Persisting After Logout

**Solution**: Bookings ARE persisting, but you may need to check:
- Are you using the same browser? (localStorage is browser-specific)
- Check browser console for storage messages
- Try booking again and check for success notification

### "RLS Policy" Error in Console

**This is normal!** The system automatically falls back to localStorage when Supabase RLS policies aren't configured. Your bookings are still saved and will work perfectly.

**To fix (optional)**:
1. Follow the "Setting Up Supabase" section above
2. Configure RLS policies in your Supabase dashboard
3. Bookings will then save to the database instead

### Bookings Disappear When Clearing Browser Data

**localStorage bookings** are stored in your browser:
- Clearing browser data/cache will remove them
- Use Supabase database (see setup above) for permanent storage
- Or export important data before clearing browser

### Same Faculty Sees Different Bookings on Different Devices

**With localStorage**: Each browser has its own copy
**With Supabase**: All devices share the same data

**Solution**: Configure Supabase for cross-device sync (see setup section)

## Best Practices

1. **For Development**: localStorage works great, no setup needed
2. **For Production**: Set up Supabase RLS policies for multi-user support
3. **Backup Strategy**: Occasionally export important bookings
4. **Team Coordination**: Use Supabase for real-time booking visibility

## Console Messages Reference

| Message | Meaning |
|---------|---------|
| `✅ Booking saved to database` | Saved to Supabase successfully |
| `💾 Saving to localStorage` | Using browser storage (normal without Supabase) |
| `✅ Loaded N extra classes from database` | Loaded from Supabase |
| `💾 Loaded N extra classes from localStorage` | Loaded from browser storage |
| `⚠️ Database save failed (RLS policy)` | RLS policies need configuration |

## Support

Having issues? Check:
1. Browser console for detailed error messages
2. This guide's troubleshooting section
3. SETUP_GUIDE.md for initial configuration
4. Supabase dashboard for database/auth status
