# CampusConnect - Local Setup Guide

## How to Check if All Dependencies Are Installed

### Method 1: Check package.json (After Installation)

Once you've set up your local project, run:

```bash
npm list --depth=0
```

This shows all **top-level** installed packages. Compare with the dependencies list below.

### Method 2: Check for Missing Dependencies

```bash
npm install --dry-run
```

Shows what would be installed without actually installing.

### Method 3: Verify Specific Package

```bash
npm list <package-name>
```

Example: `npm list lucide-react`

### Method 4: Check node_modules Folder

```bash
ls node_modules | grep <package-name>
```

---

## Complete Dependencies List for CampusConnect

### Core Framework
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

### Supabase (Backend & Auth)
```json
{
  "@supabase/supabase-js": "^2.45.0"
}
```

### Tailwind CSS
```json
{
  "tailwindcss": "^4.0.0",
  "@tailwindcss/postcss": "^4.0.0",
  "autoprefixer": "^10.4.20"
}
```

### UI Component Libraries (Radix UI)
```json
{
  "@radix-ui/react-accordion": "^1.2.3",
  "@radix-ui/react-alert-dialog": "^1.1.6",
  "@radix-ui/react-aspect-ratio": "^1.1.2",
  "@radix-ui/react-avatar": "^1.1.3",
  "@radix-ui/react-checkbox": "^1.1.4",
  "@radix-ui/react-collapsible": "^1.1.3",
  "@radix-ui/react-context-menu": "^2.2.6",
  "@radix-ui/react-dialog": "^1.1.6",
  "@radix-ui/react-dropdown-menu": "^2.1.6",
  "@radix-ui/react-hover-card": "^1.1.6",
  "@radix-ui/react-label": "^2.1.2",
  "@radix-ui/react-menubar": "^1.1.6",
  "@radix-ui/react-navigation-menu": "^1.2.5",
  "@radix-ui/react-popover": "^1.1.6",
  "@radix-ui/react-progress": "^1.1.2",
  "@radix-ui/react-radio-group": "^1.2.3",
  "@radix-ui/react-scroll-area": "^1.2.3",
  "@radix-ui/react-select": "^2.1.6",
  "@radix-ui/react-separator": "^1.1.2",
  "@radix-ui/react-slider": "^1.2.3",
  "@radix-ui/react-slot": "^1.1.2",
  "@radix-ui/react-switch": "^1.1.3",
  "@radix-ui/react-tabs": "^1.1.3",
  "@radix-ui/react-toggle": "^1.1.2",
  "@radix-ui/react-toggle-group": "^1.1.2",
  "@radix-ui/react-tooltip": "^1.1.6"
}
```

### Icons & UI Utilities
```json
{
  "lucide-react": "^0.487.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.5"
}
```

### Charts & Data Visualization
```json
{
  "recharts": "^2.15.2"
}
```

### Form Handling & Date Utilities
```json
{
  "react-hook-form": "^7.55.0",
  "react-day-picker": "^8.10.1",
  "date-fns": "^4.1.0"
}
```

### Toast Notifications
```json
{
  "sonner": "^2.0.3"
}
```

### Additional UI Components
```json
{
  "vaul": "^1.1.2",
  "cmdk": "^1.1.1",
  "embla-carousel-react": "^8.6.0",
  "input-otp": "^1.4.2",
  "react-resizable-panels": "^2.1.7"
}
```

---

## Complete package.json File

```json
{
  "name": "campusconnect",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.45.0",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-aspect-ratio": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.3",
    "@radix-ui/react-context-menu": "^2.2.6",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-hover-card": "^1.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-navigation-menu": "^1.2.5",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toggle": "^1.1.2",
    "@radix-ui/react-toggle-group": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.6",
    "lucide-react": "^0.487.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "recharts": "^2.15.2",
    "react-hook-form": "^7.55.0",
    "react-day-picker": "^8.10.1",
    "date-fns": "^4.1.0",
    "sonner": "^2.0.3",
    "vaul": "^1.1.2",
    "cmdk": "^1.1.1",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "react-resizable-panels": "^2.1.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.10",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "eslint": "^9.9.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.9"
  }
}
```

---

## Installation Commands (Copy & Paste)

### Step 1: Initialize Vite Project
```bash
npm create vite@latest campusconnect -- --template react-ts
cd campusconnect
```

### Step 2: Install Core Dependencies
```bash
npm install react@^18.3.1 react-dom@^18.3.1
```

### Step 3: Install Supabase
```bash
npm install @supabase/supabase-js@^2.45.0
```

### Step 4: Install All Radix UI Components (One Command)
```bash
npm install @radix-ui/react-accordion@^1.2.3 @radix-ui/react-alert-dialog@^1.1.6 @radix-ui/react-aspect-ratio@^1.1.2 @radix-ui/react-avatar@^1.1.3 @radix-ui/react-checkbox@^1.1.4 @radix-ui/react-collapsible@^1.1.3 @radix-ui/react-context-menu@^2.2.6 @radix-ui/react-dialog@^1.1.6 @radix-ui/react-dropdown-menu@^2.1.6 @radix-ui/react-hover-card@^1.1.6 @radix-ui/react-label@^2.1.2 @radix-ui/react-menubar@^1.1.6 @radix-ui/react-navigation-menu@^1.2.5 @radix-ui/react-popover@^1.1.6 @radix-ui/react-progress@^1.1.2 @radix-ui/react-radio-group@^1.2.3 @radix-ui/react-scroll-area@^1.2.3 @radix-ui/react-select@^2.1.6 @radix-ui/react-separator@^1.1.2 @radix-ui/react-slider@^1.2.3 @radix-ui/react-slot@^1.1.2 @radix-ui/react-switch@^1.1.3 @radix-ui/react-tabs@^1.1.3 @radix-ui/react-toggle@^1.1.2 @radix-ui/react-toggle-group@^1.1.2 @radix-ui/react-tooltip@^1.1.6
```

### Step 5: Install UI Utilities & Icons
```bash
npm install lucide-react@^0.487.0 class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^2.5.5
```

### Step 6: Install Charts & Additional UI
```bash
npm install recharts@^2.15.2 vaul@^1.1.2 cmdk@^1.1.1 embla-carousel-react@^8.6.0 input-otp@^1.4.2 react-resizable-panels@^2.1.7
```

### Step 7: Install Form Handling & Dates
```bash
npm install react-hook-form@^7.55.0 react-day-picker@^8.10.1 date-fns@^4.1.0
```

### Step 8: Install Toast Notifications
```bash
npm install sonner@^2.0.3
```

### Step 9: Install Tailwind CSS (Dev Dependencies)
```bash
npm install -D tailwindcss@^4.0.0 @tailwindcss/postcss@^4.0.0 autoprefixer@^10.4.20 postcss@^8.4.47
```

### Step 10: Install TypeScript Types (Dev Dependencies)
```bash
npm install -D @types/react@^18.3.3 @types/react-dom@^18.3.0 typescript@^5.5.3
```

---

## One-Line Install (All at Once)

```bash
npm install react@^18.3.1 react-dom@^18.3.1 @supabase/supabase-js@^2.45.0 @radix-ui/react-accordion@^1.2.3 @radix-ui/react-alert-dialog@^1.1.6 @radix-ui/react-aspect-ratio@^1.1.2 @radix-ui/react-avatar@^1.1.3 @radix-ui/react-checkbox@^1.1.4 @radix-ui/react-collapsible@^1.1.3 @radix-ui/react-context-menu@^2.2.6 @radix-ui/react-dialog@^1.1.6 @radix-ui/react-dropdown-menu@^2.1.6 @radix-ui/react-hover-card@^1.1.6 @radix-ui/react-label@^2.1.2 @radix-ui/react-menubar@^1.1.6 @radix-ui/react-navigation-menu@^1.2.5 @radix-ui/react-popover@^1.1.6 @radix-ui/react-progress@^1.1.2 @radix-ui/react-radio-group@^1.2.3 @radix-ui/react-scroll-area@^1.2.3 @radix-ui/react-select@^2.1.6 @radix-ui/react-separator@^1.1.2 @radix-ui/react-slider@^1.2.3 @radix-ui/react-slot@^1.1.2 @radix-ui/react-switch@^1.1.3 @radix-ui/react-tabs@^1.1.3 @radix-ui/react-toggle@^1.1.2 @radix-ui/react-toggle-group@^1.1.2 @radix-ui/react-tooltip@^1.1.6 lucide-react@^0.487.0 class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^2.5.5 recharts@^2.15.2 react-hook-form@^7.55.0 react-day-picker@^8.10.1 date-fns@^4.1.0 sonner@^2.0.3 vaul@^1.1.2 cmdk@^1.1.1 embla-carousel-react@^8.6.0 input-otp@^1.4.2 react-resizable-panels@^2.1.7 && npm install -D tailwindcss@^4.0.0 @tailwindcss/postcss@^4.0.0 autoprefixer@^10.4.20 postcss@^8.4.47 @types/react@^18.3.3 @types/react-dom@^18.3.0 typescript@^5.5.3
```

---

## Verification Checklist

After installation, verify each category:

### ✅ Core Framework
- [ ] `npm list react`
- [ ] `npm list react-dom`

### ✅ Backend
- [ ] `npm list @supabase/supabase-js`

### ✅ UI Framework
- [ ] `npm list lucide-react`
- [ ] `npm list @radix-ui/react-dialog`
- [ ] `npm list @radix-ui/react-select`

### ✅ Styling
- [ ] `npm list tailwindcss`
- [ ] `npm list class-variance-authority`

### ✅ Data & Forms
- [ ] `npm list recharts`
- [ ] `npm list react-hook-form`

### ✅ Notifications
- [ ] `npm list sonner`

---

## Common Installation Issues

### Issue 1: Peer Dependency Warnings
```bash
npm install --legacy-peer-deps
```

### Issue 2: Package Not Found
Update npm registry:
```bash
npm config set registry https://registry.npmjs.org/
npm cache clean --force
```

### Issue 3: Version Conflicts
Delete and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Testing Dependencies Work

Create a test file `test-imports.tsx`:

```tsx
import React from 'react';
import { Button } from './components/ui/button';
import { Calendar } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// If this file compiles, all major dependencies are installed
```

Run:
```bash
npm run type-check
```

If no errors → All dependencies installed correctly! ✅

---

## Quick Dependency Audit

```bash
# Check for security vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check outdated packages
npm outdated
```

---

## File Structure Check

Ensure these files exist after setup:

```
campusconnect/
├── node_modules/          ← Should have 500+ folders
├── package.json           ← Dependencies listed here
├── package-lock.json      ← Locked versions
├── tsconfig.json          ← TypeScript config
├── vite.config.ts         ← Vite config
├── tailwind.config.js     ← Tailwind config
└── src/
    ├── App.tsx
    ├── main.tsx
    └── components/
```

---

## Need Help?

If dependencies are missing after following this guide:

1. Check Node.js version: `node -v` (Should be 18+ or 20+)
2. Check npm version: `npm -v` (Should be 9+ or 10+)
3. Clear npm cache: `npm cache clean --force`
4. Reinstall: `rm -rf node_modules && npm install`

---

**Last Updated:** Based on your current CampusConnect project
**Total Dependencies:** 46 production + 10 dev dependencies
