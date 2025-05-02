# MyFinTracker Documentation

Welcome to the comprehensive documentation for MyFinTracker, a web-based student allowance claim management system designed to simplify and modernize the MARA sponsorship application process.

## Table of Contents

1. [Application Overview](#application-overview)
2. [Architecture](#architecture)
3. [Component Structure](#component-structure)
4. [User Roles and Authentication](#user-roles-and-authentication)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Testing](#testing)
8. [Development Guide](#development-guide)

## Application Overview

MyFinTracker is a web application that allows MARA-sponsored students to submit allowance claims digitally. The system replaces paper forms with an intuitive digital interface where students can:

- Submit multiple types of allowance claims
- Track claim status (pending, approved, rejected, completed)
- Manage academic records across semesters
- Create study plans for future semesters
- Receive notifications about claim status changes

Administrators can:
- Review and approve/reject student claims
- Monitor student academic progress
- Communicate with students through the notification system
- Access detailed reporting and analytics

## Architecture

MyFinTracker follows a modern full-stack JavaScript architecture:

```
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│   Frontend    │         │    Backend    │         │   Database    │
│  (React.js)   │ ◄────► │  (Express.js)  │ ◄────► │ (PostgreSQL)  │
└───────────────┘         └───────────────┘         └───────────────┘
      ▲                          ▲                         ▲
      │                          │                         │
      │                          │                         │
      ▼                          ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│     State     │         │      API      │         │  Data Models  │
│  Management   │         │   Endpoints   │         │   (Drizzle)   │
│ (React Query) │         │               │         │               │
└───────────────┘         └───────────────┘         └───────────────┘
```

### Technology Stack

- **Frontend**:
  - React.js with TypeScript
  - TanStack Query (React Query) for state management
  - Tailwind CSS for styling
  - Shadcn UI components

- **Backend**:
  - Node.js with Express.js
  - TypeScript for type safety

- **Database**:
  - PostgreSQL
  - Drizzle ORM for database operations

- **Authentication**:
  - Session-based authentication
  - Role-based access control

- **Testing**:
  - Vitest for unit and integration testing
  - Testing Library for component testing
  - MSW for API mocking

## Component Structure

The application is organized into the following main components:

### Layout Components
- `Layout`: Main application layout with navigation
- `Sidebar`: Navigation sidebar with links to different sections
- `Header`: Top navigation bar with user profile and notifications
- `Footer`: Application footer with links and copyright information

### Authentication Components
- `LoginForm`: User login form
- `RegisterForm`: New user registration form
- `ProtectedRoute`: Route wrapper that requires authentication

### Claim Components
- `ClaimForm`: Form for creating new claims
- `ClaimList`: List of user's claims
- `ClaimCard`: Individual claim card in the list
- `ClaimDetails`: Detailed view of a single claim
- `MultiClaimSelection`: UI for selecting multiple claim types

### Academic Components
- `AcademicRecordForm`: Form for adding academic records
- `AcademicRecordList`: List of user's academic records
- `CourseForm`: Form for adding courses to an academic record
- `CourseList`: List of courses in an academic record

### Study Plan Components
- `StudyPlanForm`: Form for creating study plans
- `StudyPlanList`: List of user's study plans

### Notification Components
- `NotificationDropdown`: Dropdown menu showing notifications
- `NotificationList`: List of all notifications
- `NotificationItem`: Individual notification item

### Admin Components
- `AdminDashboard`: Overview dashboard for administrators
- `UserList`: List of all users for administrators
- `ClaimApproval`: Interface for approving/rejecting claims

## User Roles and Authentication

The application has two main user roles:

### Student
- Can register and login
- Can create and view claims
- Can add academic records and courses
- Can create study plans
- Can view notifications

### Administrator
- Can login (admin accounts are pre-created)
- Can view all students and their claims
- Can approve or reject claims
- Can send notifications to students
- Can access reporting and analytics

Authentication is handled through sessions, with protected routes ensuring only authenticated users can access certain parts of the application.

## Database Schema

The database consists of the following tables:

### Users Table
Stores user information including authentication details.

| Field           | Type         | Description                       |
|-----------------|--------------|-----------------------------------|
| id              | integer      | Primary key                       |
| username        | varchar      | Unique username                   |
| password        | varchar      | Hashed password                   |
| email           | varchar      | User's email address              |
| fullName        | varchar      | User's full name                  |
| nationalId      | varchar      | National ID number                |
| maraId          | varchar      | MARA identification number        |
| phoneNumber     | varchar      | Contact phone number              |
| currentAddress  | text         | Current residential address       |
| countryOfStudy  | varchar      | Country where studying            |
| university      | varchar      | Name of university                |
| course          | varchar      | Course of study                   |
| accountNumber   | varchar      | Bank account number               |
| bankName        | varchar      | Name of bank                      |
| role            | varchar      | User role (student/admin)         |
| createdAt       | timestamp    | When the account was created      |

### Claims Table
Stores information about student allowance claims.

| Field           | Type         | Description                       |
|-----------------|--------------|-----------------------------------|
| id              | integer      | Primary key                       |
| userId          | integer      | Foreign key to users table        |
| claimType       | varchar      | Type of claim                     |
| amount          | numeric      | Total claim amount                |
| description     | text         | Claim description                 |
| status          | varchar      | Claim status                      |
| createdAt       | timestamp    | When the claim was created        |
| updatedAt       | timestamp    | When the claim was last updated   |
| reviewedBy      | integer      | ID of admin who reviewed claim    |
| reviewNotes     | text         | Notes from claim review           |
| attachmentUrl   | varchar      | URL to attached document          |
| selectedClaims  | jsonb        | Array of claim types with amounts |

### Academic Records Table
Stores student academic semester records.

| Field           | Type         | Description                       |
|-----------------|--------------|-----------------------------------|
| id              | integer      | Primary key                       |
| userId          | integer      | Foreign key to users table        |
| semester        | varchar      | Semester name                     |
| year            | varchar      | Academic year                     |
| gpa             | numeric      | Grade point average               |
| ectsCredits     | integer      | Total credits earned              |
| isCompleted     | boolean      | Whether semester is completed     |
| createdAt       | timestamp    | When the record was created       |
| updatedAt       | timestamp    | When the record was last updated  |

### Courses Table
Stores courses taken in each academic record.

| Field           | Type         | Description                       |
|-----------------|--------------|-----------------------------------|
| id              | integer      | Primary key                       |
| academicRecordId| integer      | Foreign key to academic_records   |
| name            | varchar      | Course name                       |
| credits         | integer      | Course credit hours               |
| grade           | varchar      | Grade received                    |
| status          | varchar      | Course status                     |

### Study Plans Table
Stores student's future study plans.

| Field           | Type         | Description                       |
|-----------------|--------------|-----------------------------------|
| id              | integer      | Primary key                       |
| userId          | integer      | Foreign key to users table        |
| semester        | varchar      | Planned semester                  |
| year            | varchar      | Planned year                      |
| courses         | jsonb        | Array of planned courses          |
| notes           | text         | Additional notes                  |

### Notifications Table
Stores system notifications.

| Field           | Type         | Description                       |
|-----------------|--------------|-----------------------------------|
| id              | integer      | Primary key                       |
| userId          | integer      | Foreign key to users table        |
| title           | varchar      | Notification title                |
| message         | text         | Notification message              |
| isRead          | boolean      | Whether notification was read     |
| createdAt       | timestamp    | When notification was created     |

## API Endpoints

The application exposes the following API endpoints:

### Authentication Endpoints

| Endpoint        | Method | Description                | Authentication |
|-----------------|--------|----------------------------|---------------|
| /api/auth/login | POST   | User login                 | None          |
| /api/auth/logout| POST   | User logout                | Required      |
| /api/auth/me    | GET    | Get current user           | Required      |

### User Endpoints

| Endpoint        | Method | Description                | Authentication |
|-----------------|--------|----------------------------|---------------|
| /api/users      | POST   | Create a new user (register)| None         |
| /api/users      | GET    | Get all users              | Admin         |
| /api/users/:id  | PUT    | Update user profile        | Required      |

### Claim Endpoints

| Endpoint               | Method | Description                | Authentication |
|------------------------|--------|----------------------------|---------------|
| /api/claims            | POST   | Create a new claim         | Required      |
| /api/claims            | GET    | Get all claims for user    | Required      |
| /api/claims/:id        | GET    | Get a specific claim       | Required      |
| /api/claims/:id/status | PUT    | Update claim status        | Admin         |

### Academic Record Endpoints

| Endpoint                         | Method | Description                | Authentication |
|----------------------------------|--------|----------------------------|---------------|
| /api/academic-records            | POST   | Create academic record     | Required      |
| /api/academic-records            | GET    | Get user academic records  | Required      |
| /api/academic-records/:id/courses| GET    | Get courses for record     | Required      |

### Course Endpoints

| Endpoint        | Method | Description                | Authentication |
|-----------------|--------|----------------------------|---------------|
| /api/courses    | POST   | Add a course to record     | Required      |

### Study Plan Endpoints

| Endpoint        | Method | Description                | Authentication |
|-----------------|--------|----------------------------|---------------|
| /api/study-plans| POST   | Create study plan          | Required      |
| /api/study-plans| GET    | Get user study plans       | Required      |

### Notification Endpoints

| Endpoint              | Method | Description                | Authentication |
|-----------------------|--------|----------------------------|---------------|
| /api/notifications    | GET    | Get user notifications     | Required      |
| /api/notifications/:id/read | PUT | Mark notification as read | Required     |

### File Upload Endpoints

| Endpoint                | Method | Description                | Authentication |
|-------------------------|--------|----------------------------|---------------|
| /api/upload             | POST   | Upload a file              | Required      |
| /api/file-lookup/:filename | GET  | Get file by filename      | Required      |

## Testing

MyFinTracker includes a comprehensive testing suite with:

### Unit Tests
Tests for individual functions and small components:
- Form validation logic
- Utility functions
- UI components like ClaimCard

### Integration Tests
Tests for interactions between components:
- Multi-claim selection
- Notification system
- Form submissions

### API Tests
Tests for backend API endpoints:
- Claims API
- Authentication API
- User management API

### End-to-End Tests
Tests for complete user flows:
- Claim submission process
- Authentication flow

### Running Tests

Tests can be run using the `run-tests.sh` script:

```bash
# Run all tests
./run-tests.sh all

# Run specific test categories
./run-tests.sh unit
./run-tests.sh integration
./run-tests.sh api
./run-tests.sh e2e

# Run tests for specific features
./run-tests.sh claim-card
./run-tests.sh form-validation
./run-tests.sh multi-claim
./run-tests.sh notifications

# Run a specific test file
./run-tests.sh single path/to/test.tsx
```

## Development Guide

### Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Access the application at `http://localhost:5000`

### Login Credentials

For testing, use these credentials:

- **Admin**:
  - Username: admin
  - Password: admin123

- **Student**:
  - Username: student1
  - Password: student123

### Adding New Features

When adding new features, follow these steps:

1. Update the data model in `shared/schema.ts` if needed
2. Add new API endpoints in `server/routes.ts`
3. Create new React components in `client/src/components`
4. Add new pages in `client/src/pages`
5. Register new routes in `client/src/App.tsx`
6. Write tests for the new features

### Common Tasks

- **Adding a new page**: Create the page component in `client/src/pages` and add it to the routes in `App.tsx`
- **Creating a new component**: Add the component in `client/src/components` in the appropriate subdirectory
- **Adding a new API endpoint**: Add the endpoint handler in `server/routes.ts`
- **Updating the database schema**: Modify `shared/schema.ts` and run database migrations