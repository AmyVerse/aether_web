# Aether Web - Project Structure & Architecture

## Overview

Aether Web is a modern educational platform built with Next.js 14, featuring role-based authentication, dashboard management, and comprehensive UI components.

## Project Architecture

### 🔐 Security & Authentication

- **NextAuth.js** integration with JWT and database sessions
- **Role-based access control** (Admin, Teacher, Student, Editor)
- **API route protection** with middleware and authentication helpers
- **Secure password hashing** with bcrypt (12 rounds)
- **Rate limiting** on sensitive endpoints (OTP, password verification)
- **Cryptographically secure OTP** generation (6 digits, 10 min expiry)

### 🎨 UI Component Architecture

#### Core UI Components (`src/components/ui/`)

- **`avatar.tsx`** - Profile images with Next.js Image optimization
- **`badge.tsx`** - Status indicators with multiple variants
- **`button.tsx`** - Consistent button styling with variants
- **`card.tsx`** - Container component for content sections

#### Layout Components (`src/components/layout/`)

- **`dashboard-layout.tsx`** - Main dashboard wrapper with sidebar
- **`sidebar.tsx`** - Navigation sidebar with role-based menu items
- **`top-header.tsx`** - Header with user profile and notifications

#### Dashboard Components (`src/components/dashboard/`)

- **`profile-card.tsx`** - User profile information display
- **`calendar-widget.tsx`** - Calendar integration for events
- **`upcoming-classes.tsx`** - Class schedule display
- **`stats-widgets.tsx`** - Statistics cards and quick actions
- **`working-hours.tsx`** - Teacher work hours visualization
- **`group-chats.tsx`** - Chat interface for teacher-student communication
- **`student-tests.tsx`** - Test management and grading interface

### 📊 Dashboard Structure

#### Role-Based Dashboards

- **Admin Dashboard** (`/dashboard/admin`)
  - System statistics and management
  - User management overview
  - Recent activity tracking
- **Teacher Dashboard** (`/dashboard/teacher`)
  - Class management and statistics
  - Student progress tracking
  - Working hours visualization
  - Group chat interface
  - Test management system
- **Student Dashboard** (`/dashboard/student`)
  - Class schedule and assignments
  - Grade tracking
  - Upcoming events
- **Editor Dashboard** (`/dashboard/editor`)
  - Content management interface
  - Publishing tools

### 🔧 API Routes & Security

#### Authentication Routes (`/api/auth/`)

- **`send-otp`** - Secure OTP generation and sending
- **`verify-otp`** - OTP verification with rate limiting
- **`signup`** - User registration with validation
- **`check-email`** - Email availability checking
- **`[...nextauth]`** - NextAuth.js configuration

#### Protected Routes

- **`/api/update-profile`** - User profile updates
- **`/api/verify-password`** - Password verification
- **`/api/attendance/[sessionId]`** - Attendance management
- **`/api/teacher/[id]`** - Teacher-specific data

### 🛡️ Security Features

#### API Protection

- **Input validation** using Zod schemas
- **Rate limiting** on sensitive endpoints
- **Secure error handling** without information leakage
- **CSRF protection** via NextAuth.js
- **SQL injection prevention** via Drizzle ORM

#### Session Management

- **JWT tokens** with role and roleId propagation
- **Secure session cookies** with httpOnly and secure flags
- **Automatic session refresh** and expiry handling
- **Role-based route protection** via middleware

### 📱 Responsive Design

- **Mobile-first approach** with Tailwind CSS
- **Responsive grid layouts** for dashboards
- **Touch-friendly interfaces** for mobile devices
- **Optimized images** with Next.js Image component

### 🗃️ Database Integration

- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** database with proper indexing
- **Migration system** for schema changes
- **Connection pooling** for performance

## Key Features

### Authentication System

- Multi-provider authentication (credentials, OAuth)
- Secure password reset via OTP
- Email verification system
- Role-based access control

### Dashboard Management

- Role-specific dashboards with appropriate tools
- Real-time data visualization
- Interactive widgets and components
- Responsive design for all devices

### Teacher Tools

- Attendance tracking system
- Student progress monitoring
- Group chat functionality
- Test creation and grading
- Working hours tracking

### Student Features

- Class schedule management
- Assignment submission
- Grade tracking
- Communication tools

### Admin Controls

- User management
- System monitoring
- Analytics and reporting
- Configuration management

## Development Guidelines

### Component Organization

- Shared UI components in `components/ui/`
- Layout components in `components/layout/`
- Feature-specific components in `components/dashboard/`
- Page components in `app/` directory

### Security Best Practices

- Always validate input on both client and server
- Use prepared statements for database queries
- Implement proper error handling
- Follow principle of least privilege
- Regular security audits

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions
- Component documentation
- Comprehensive error handling

## Environment Variables

See `.env.example` for required environment variables including:

- Database connection strings
- NextAuth configuration
- Email service credentials
- API keys and secrets

## Security Documentation

Detailed security practices and guidelines are documented in `SECURITY.md`.

---

This architecture provides a solid foundation for a scalable, secure, and maintainable educational platform with role-based access control and comprehensive dashboard functionality.
