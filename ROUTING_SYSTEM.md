# 🚀 Aether Web - Routing System Documentation

## Overview

This document explains our Next.js 15 App Router parallel routes system for role-based dashboards.

## 🏗️ Architecture

### Parallel Routes Structure

```
/dashboard/
├── layout.tsx                    # Main dashboard layout
├── page.tsx                      # Dashboard home
├── not-found.tsx                 # 404 page
│
├── @admin/                       # Admin parallel slot
│   ├── default.tsx               # Default when no specific route
│   └── page.tsx                  # Admin dashboard content
│
├── @editor/                      # Editor parallel slot
│   ├── default.tsx               # Default when no specific route
│   └── page.tsx                  # Editor dashboard content
│
├── @student/                     # Student parallel slot
│   ├── default.tsx               # Default when no specific route
│   └── page.tsx                  # Student dashboard content
│
└── @teacher/                     # Teacher parallel slot
    ├── default.tsx               # Default when no specific route
    ├── page.tsx                  # Teacher dashboard content
    └── class/                    # Teacher class management
        ├── page.tsx              # Classes list
        └── [classId]/
            ├── page.tsx          # Class detail
            └── session/
                ├── page.tsx      # Sessions list
                └── [sessionId]/
                    └── page.tsx  # Attendance page
```

## 🌐 URL Structure

### Clean User URLs (What users see in browser)

```
/dashboard                                  → Role-based dashboard
/dashboard/class                           → Classes list (teacher only)
/dashboard/class/ABC123                    → Class detail (teacher only)
/dashboard/class/ABC123/session            → Sessions list (teacher only)
/dashboard/class/ABC123/session/XYZ789     → Attendance page (teacher only)
```

### How Next.js Routes Behind the Scenes

| User URL                | Teacher Role                        | Student Role        | Admin Role        |
| ----------------------- | ----------------------------------- | ------------------- | ----------------- |
| `/dashboard`            | `@teacher/page.tsx`                 | `@student/page.tsx` | `@admin/page.tsx` |
| `/dashboard/class`      | `@teacher/class/page.tsx`           | ❌ Not accessible   | ❌ Not accessible |
| `/dashboard/class/[id]` | `@teacher/class/[classId]/page.tsx` | ❌ Not accessible   | ❌ Not accessible |

## 🔐 Authentication & Authorization

### Middleware Protection (`src/middleware.ts`)

```typescript
// 1. Authentication check
if (pathname.startsWith("/dashboard") && !session?.user) {
  return NextResponse.redirect(new URL("/", req.url));
}

// 2. Role-based rendering handled automatically by parallel routes
// No URL-based role protection needed since @role slots handle this
```

### Session-Based Role Detection

- User's role stored in session: `session.user.role`
- Dashboard layout automatically renders appropriate parallel slot
- No manual role checking in individual components needed

## 🎯 Navigation Rules

### ✅ Correct Navigation URLs

```tsx
// Use clean URLs - Next.js handles parallel routing automatically
<Link href="/dashboard/class">Classes</Link>
<Link href="/dashboard/class/ABC123">Class Detail</Link>
<Link href="/dashboard/class/ABC123/session">Sessions</Link>

// Or programmatic navigation
router.push('/dashboard/class/ABC123/session/XYZ789');
window.location.href = '/dashboard/class/ABC123';
```

### ❌ Incorrect Navigation URLs

```tsx
// NEVER use @role prefixes in URLs
<Link href="/dashboard/@teacher/class">❌ Wrong</Link>
<Link href="/dashboard/@student/class">❌ Wrong</Link>

// These URLs expose internal implementation details
```

## 🏃‍♂️ How It Works

### 1. User Visits URL

```
User types: /dashboard/class
```

### 2. Next.js Route Resolution

```
1. Checks dashboard layout.tsx
2. Reads user role from session
3. Renders appropriate parallel slot:
   - Teacher → @teacher/class/page.tsx
   - Student → 404 or redirect (no @student/class)
   - Admin → 404 or redirect (no @admin/class)
```

### 3. Clean URL Maintained

```
Browser URL stays: /dashboard/class
Internal rendering: @teacher/class/page.tsx
```

## 📁 File Structure Rules

### ✅ Correct Structure

```
src/app/dashboard/
├── @teacher/class/           # Teacher-specific class routes
├── @student/default.tsx      # Student fallback
├── @admin/default.tsx        # Admin fallback
└── layout.tsx                # Handles role-based slot rendering
```

### ❌ Incorrect Structure (Don't Create)

```
src/app/dashboard/
├── class/                    # ❌ Regular routes not needed
├── teacher/                  # ❌ Role-based folders not needed
└── student/                  # ❌ Role-based folders not needed
```

## 🔄 Data Flow

### Teacher Class Management Flow

```
1. User: Teacher logs in
2. Navigation: Goes to /dashboard/class
3. Rendering: @teacher/class/page.tsx loads
4. API Call: Fetches teacher's classes
5. Display: Shows teacher-specific class list
6. Navigation: Click class → /dashboard/class/ABC123
7. Rendering: @teacher/class/[classId]/page.tsx loads
```

### Role-Based Content

```
Same URL → Different Content

/dashboard → Teacher sees: Class management, attendance tools
/dashboard → Student sees: Enrolled classes, assignments
/dashboard → Admin sees: System overview, user management
/dashboard → Editor sees: Timetable editor, schedule tools
```

## 🛠️ Development Guidelines

### Adding New Teacher Routes

1. Create files under `@teacher/` parallel slot
2. Use clean URLs in navigation
3. No separate route protection needed
4. Test with different user roles

### Adding New Role Features

1. Create new parallel slot: `@newrole/`
2. Add default.tsx for fallback
3. Update layout.tsx if needed
4. Use same clean URL structure

### Database Considerations

- Use nanoid for short IDs: `ABC123`, `XYZ789`
- Maintain proper foreign key constraints with CASCADE
- Session management through NextAuth

## 🚨 Common Mistakes to Avoid

### 1. Exposing @role in URLs

```tsx
❌ href="/dashboard/@teacher/class"
✅ href="/dashboard/class"
```

### 2. Creating Regular Route Duplicates

```
❌ src/app/dashboard/class/page.tsx (alongside @teacher/class/)
✅ Only @teacher/class/page.tsx needed
```

### 3. Manual Role Checking

```tsx
❌ if (role === 'teacher') render(<TeacherClass />)
✅ Let parallel routes handle role-based rendering
```

### 4. Complex Middleware Rules

```tsx
❌ if (pathname.includes('@teacher') && role !== 'teacher') redirect()
✅ Simple auth check, let parallel routes handle role logic
```

## 🎉 Benefits of This System

1. **Clean URLs**: Users see logical, readable URLs
2. **Automatic Role Handling**: No manual role checking needed
3. **Scalable**: Easy to add new roles and features
4. **Type Safe**: Full TypeScript support
5. **SEO Friendly**: Clean URL structure
6. **Maintainable**: Clear separation of role-based logic

## 📝 Quick Reference

| Need               | Do This                          | Don't Do This                      |
| ------------------ | -------------------------------- | ---------------------------------- |
| Teacher class page | Create `@teacher/class/page.tsx` | Create `class/page.tsx`            |
| Navigation link    | `href="/dashboard/class"`        | `href="/dashboard/@teacher/class"` |
| New role feature   | Create `@newrole/` slot          | Create `newrole/` folder           |
| Route protection   | Let parallel routes handle       | Add middleware URL checks          |

---

**Remember**: The parallel routes system handles role-based rendering automatically. Focus on creating great user experiences with clean URLs! 🚀
