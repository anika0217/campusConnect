# Network Error Troubleshooting Guide

## "Failed to Fetch" Error - Quick Fix

If you're seeing **"TypeError: Failed to fetch"** or **"Cannot connect to server"** errors, don't worry! The app is designed to work even without an active Supabase connection.

---

## What's Happening?

The error occurs when CampusConnect tries to connect to Supabase but the connection fails. This can happen because:

1. **Supabase is not configured** (normal for development)
2. **Internet connection is down**
3. **Supabase service is temporarily unavailable**
4. **Browser is blocking the connection**

---

## Immediate Solution

The app now **automatically falls back to localStorage** when Supabase isn't available:

### ✅ What Still Works:
- ✅ **Booking extra classes** (saves to localStorage)
- ✅ **Viewing timetables** (built-in data)
- ✅ **Student schedules** (from timetable)
- ✅ **All navigation and UI**
- ✅ **Data persistence** (in browser)

### ⚠️ What Doesn't Work Without Supabase:
- ⚠️ **User registration** (requires Supabase Auth)
- ⚠️ **User login** (requires Supabase Auth)
- ⚠️ **Cross-device sync** (requires database)

---

## Quick Fixes by Scenario

### Scenario 1: Testing the App Locally

**If you just want to test the app without authentication:**

1. Comment out the login requirement in `App.tsx`:
```typescript
// Temporary for testing - bypass login
const [isLoggedIn, setIsLoggedIn] = useState(true); // Changed from false
const [currentRole, setCurrentRole] = useState<UserRole>('faculty'); // Set default role
```

2. Reload the app - you'll go straight to the dashboard
3. Booking features will save to localStorage

### Scenario 2: Setting Up Supabase Properly

**If you want full functionality with authentication:**

1. **Check Supabase Connection**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for connection errors

2. **Verify Supabase Configuration**:
   ```bash
   # Check if Supabase project is linked
   # File: utils/supabase/info.tsx
   ```
   - Ensure `projectId` and `publicAnonKey` are set
   - These should match your Supabase project

3. **Test Supabase Connection**:
   - Open your browser console
   - Run:
   ```javascript
   fetch('https://YOUR_PROJECT_ID.supabase.co/rest/v1/')
     .then(r => console.log('Supabase reachable:', r.status))
     .catch(e => console.log('Supabase error:', e))
   ```

### Scenario 3: Network/Firewall Issues

**If Supabase is configured but still can't connect:**

1. **Check Internet Connection**:
   - Try loading other websites
   - Check if you're behind a corporate firewall

2. **Disable Ad Blockers**:
   - Some ad blockers block Supabase requests
   - Whitelist `*.supabase.co` domain

3. **Clear Browser Cache**:
   - Clear site data for the app
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

4. **Try Different Browser**:
   - Test in Chrome, Firefox, or Edge
   - Incognito/Private mode can help identify extension issues

---

## Using the App Without Supabase

CampusConnect is designed to work **fully offline** for booking features:

### 1. Enable Guest Mode

You can modify the app to skip authentication:

**In `/App.tsx`**, change:
```typescript
const [isLoggedIn, setIsLoggedIn] = useState(false);
```

To:
```typescript
const [isLoggedIn, setIsLoggedIn] = useState(true);
const [currentRole] = useState<UserRole>('faculty'); // or 'student' or 'admin'
```

### 2. Use localStorage Bookings

All bookings are saved to localStorage automatically:

- **View bookings**: DevTools → Application → Local Storage → `campusconnect_bookings`
- **Backup bookings**: Copy the JSON data
- **Restore bookings**: Paste back into localStorage

### 3. Export/Import Bookings (Manual)

**Export:**
```javascript
// In browser console
const bookings = localStorage.getItem('campusconnect_bookings');
console.log(bookings);
// Copy this JSON
```

**Import:**
```javascript
// In browser console
localStorage.setItem('campusconnect_bookings', 'PASTE_JSON_HERE');
location.reload();
```

---

## Error Messages Explained

| Error Message | What It Means | What to Do |
|--------------|---------------|------------|
| `TypeError: Failed to fetch` | Can't reach Supabase | Use localStorage mode or fix connection |
| `Cannot connect to authentication service` | Supabase Auth unavailable | Skip auth or fix Supabase setup |
| `Cannot connect to server` | Network/firewall issue | Check internet, disable blockers |
| `⚠️ Supabase client unavailable` | Client creation failed | Check project credentials |
| `🌐 Network request failed` | Fetch timeout (10s) | Slow connection or service down |

---

## Console Messages Guide

### Normal Operation (localStorage mode):

```
⚠️ Supabase client unavailable, using localStorage only
💾 Booking saved to localStorage
💾 Loaded 3 extra classes from localStorage
```

### Normal Operation (Supabase mode):

```
✅ Booking saved to database
✅ Loaded 5 extra classes from database
```

### Mixed Mode:

```
✅ Loaded 5 extra classes from database+localStorage
💾 Saving to localStorage (database unavailable)
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Supabase project is created and linked
- [ ] Environment variables are set correctly
- [ ] RLS policies are configured (see BOOKING_PERSISTENCE_GUIDE.md)
- [ ] Test authentication flow end-to-end
- [ ] Test booking creation and persistence
- [ ] Test across different browsers
- [ ] Test on mobile devices
- [ ] Add proper error boundaries for network failures

---

## Advanced: Network Timeout Configuration

The app uses a 10-second timeout for network requests. To adjust:

**In `/utils/supabase/client.tsx`:**

```typescript
fetch: (url, options = {}) => {
  return fetch(url, {
    ...options,
    // Change timeout (in milliseconds)
    signal: AbortSignal.timeout(10000), // 10 seconds
  })
}
```

---

## Development vs Production

### Development Mode (Current):
- Uses localStorage fallback
- Works without Supabase
- Single-browser persistence
- Great for testing

### Production Mode (Recommended):
- Requires Supabase setup
- Multi-user support
- Cross-device sync
- Real authentication

---

## Getting Help

1. **Check Browser Console** (F12)
   - Look for red error messages
   - Note the full error text

2. **Test Supabase Connection**
   - Visit: `https://YOUR_PROJECT_ID.supabase.co`
   - Should see "404" (means it's reachable)

3. **Verify localStorage**
   - DevTools → Application → Local Storage
   - Check `campusconnect_bookings` exists

4. **Try Different Network**
   - Mobile hotspot
   - Different WiFi
   - VPN if behind firewall

---

## Summary

**The "Failed to fetch" error is not critical!** 

The app is designed with robust fallbacks:
- ✅ Bookings save to localStorage automatically
- ✅ Timetable data is built-in
- ✅ All features work offline
- ✅ No data loss

For full multi-user functionality, properly configure Supabase (see SETUP_GUIDE.md).

For quick testing, use localStorage mode (works immediately, no setup needed).

---

*Last Updated: November 2025*
*CampusConnect v2.1 - Network Error Handling*
