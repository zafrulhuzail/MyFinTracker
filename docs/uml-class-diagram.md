# UML/Class Diagram for MyFinTracker

This document provides UML class diagrams for the MyFinTracker application, showing the relationships between different components and data models.

## Data Model Diagram

```
┌───────────────────────────┐                 ┌───────────────────────────┐
│           User            │                 │           Claim            │
├───────────────────────────┤                 ├───────────────────────────┤
│ id: number                │                 │ id: number                │
│ username: string          │                 │ userId: number            │
│ password: string          │                 │ claimType: string         │
│ email: string             │                 │ amount: number            │
│ fullName: string          │                 │ description: string       │
│ nationalId: string        │                 │ status: string            │
│ maraId: string            │                 │ createdAt: Date           │
│ phoneNumber: string       │                 │ updatedAt: Date           │
│ currentAddress: string    │                 │ reviewedBy: number?       │
│ countryOfStudy: string    │                 │ reviewNotes: string?      │
│ university: string        │                 │ attachmentUrl: string?    │
│ course: string            │                 │ selectedClaims: JsonB     │
│ accountNumber: string     ├─────┐     ┌─────┤                           │
│ bankName: string          │     │     │     │                           │
│ role: string              │     │     │     │                           │
│ createdAt: Date           │     │ 1..* │ 1  │                           │
└───────────────────────────┘     └─────┴─────┘───────────────────────────┘
         │ 1                                    
         │                                      
         │ 1..*                                 
┌────────┴──────────────────┐                 ┌───────────────────────────┐
│     AcademicRecord        │                 │       Notification        │
├───────────────────────────┤                 ├───────────────────────────┤
│ id: number                │                 │ id: number                │
│ userId: number            │                 │ userId: number            │
│ semester: string          │                 │ title: string             │
│ year: string              │                 │ message: string           │
│ gpa: number               │                 │ isRead: boolean           │
│ ectsCredits: number       │                 │ createdAt: Date           │
│ isCompleted: boolean      │                 │                           │
│ createdAt: Date           │                 │                           │
│ updatedAt: Date           │                 │                           │
└───────────────────────────┘                 └───────────────────────────┘
         │ 1                                             ▲ *
         │                                               │
         │ *                                             │ 1
┌────────┴──────────────────┐                 ┌─────────┴─────────────────┐
│         Course            │                 │           User            │
├───────────────────────────┤                 │                           │
│ id: number                │                 │                           │
│ academicRecordId: number  │                 │                           │
│ name: string              │                 │                           │
│ credits: number           │                 │                           │
│ grade: string             │                 │                           │
│ status: string            │                 │                           │
└───────────────────────────┘                 └───────────────────────────┘
                                                        │ 1
                                                        │
                                                        │ *
                                              ┌─────────┴─────────────────┐
                                              │       StudyPlan           │
                                              ├───────────────────────────┤
                                              │ id: number                │
                                              │ userId: number            │
                                              │ semester: string          │
                                              │ year: string              │
                                              │ courses: JsonB            │
                                              │ notes: string             │
                                              │                           │
                                              └───────────────────────────┘
```

## Component Class Diagram

```
┌───────────────────────────┐         ┌───────────────────────────┐
│         Component         │         │          React            │
├───────────────────────────┤         ├───────────────────────────┤
│ props: any                │         │ useState()                │
│ state: any                │         │ useEffect()               │
│ render(): ReactNode       │         │ useContext()              │
└───────────────────────────┘         │ useRef()                  │
             ▲                        └───────────────────────────┘
             │                                    ▲
             │                                    │
             │                                    │
┌───────────┴───────────────┐         ┌──────────┴────────────────┐
│       ReactComponent      │         │       TanStack Query      │
├───────────────────────────┤         ├───────────────────────────┤
│ useState()                │         │ useQuery()                │
│ useEffect()               │         │ useMutation()             │
│ useContext()              │         │ useQueryClient()          │
│ useRef()                  │         │ invalidateQueries()       │
└───────────────────────────┘         └───────────────────────────┘
             ▲                                    ▲
             │                                    │
             │                                    │
┌───────────┴───────────────┐         ┌──────────┴────────────────┐
│       Layout              │         │         ApiHooks           │
├───────────────────────────┤         ├───────────────────────────┤
│ children: ReactNode       │         │ useClaims()               │
│ sidebar: boolean          │         │ useClaimById()            │
│ header: boolean           │         │ useCreateClaim()          │
└───────────────────────────┘         │ useUsers()                │
                                      │ useAcademicRecords()      │
                                      │ useNotifications()        │
                                      └───────────────────────────┘

┌───────────────────────────┐         ┌───────────────────────────┐
│        ClaimForm          │         │        ClaimList          │
├───────────────────────────┤         ├───────────────────────────┤
│ selectedClaims: array     │         │ claims: Claim[]           │
│ amounts: object           │         │ isLoading: boolean        │
│ description: string       │         │ handleSelect(id): void    │
│ attachment: File?         │         │                           │
│ errors: object            │         │                           │
│ handleSubmit(): void      │         │                           │
│ handleClaimSelect(): void │         │                           │
│ handleAmountChange(): void│         │                           │
│ calculateTotal(): number  │         │                           │
└───────────────────────────┘         └───────────────────────────┘
             ▲                                    ▲
             │                                    │
             │                                    │
┌───────────┴───────────────┐         ┌──────────┴────────────────┐
│     MultiClaimSelection   │         │         ClaimCard          │
├───────────────────────────┤         ├───────────────────────────┤
│ claimTypes: string[]      │         │ claim: Claim              │
│ selectedTypes: string[]   │         │ onClick: function         │
│ amounts: object           │         │ formatDate(date): string  │
│ handleSelect(type): void  │         │ formatStatus(status)      │
│ handleAmount(type): void  │         │                           │
└───────────────────────────┘         └───────────────────────────┘

┌───────────────────────────┐         ┌───────────────────────────┐
│   AcademicRecordForm      │         │   NotificationSystem      │
├───────────────────────────┤         ├───────────────────────────┤
│ semester: string          │         │ notifications: array      │
│ year: string              │         │ unreadCount: number       │
│ gpa: number               │         │ isOpen: boolean           │
│ ectsCredits: number       │         │ toggleOpen(): void        │
│ isCompleted: boolean      │         │ markAsRead(id): void      │
│ handleSubmit(): void      │         │ markAllAsRead(): void     │
└───────────────────────────┘         └───────────────────────────┘

┌───────────────────────────┐         ┌───────────────────────────┐
│      StudyPlanForm        │         │        AuthProvider       │
├───────────────────────────┤         ├───────────────────────────┤
│ semester: string          │         │ user: User | null         │
│ year: string              │         │ isLoading: boolean        │
│ courses: array            │         │ error: Error | null       │
│ notes: string             │         │ loginMutation             │
│ handleSubmit(): void      │         │ logoutMutation            │
│ addCourse(): void         │         │ registerMutation          │
│ removeCourse(): void      │         │                           │
└───────────────────────────┘         └───────────────────────────┘
```

## Storage Interface Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                           IStorage                              │
├────────────────────────────────────────────────────────────────┤
│ // User operations                                              │
│ getUser(id: number): Promise<User | undefined>                  │
│ getUserByUsername(username: string): Promise<User | undefined>  │
│ getUserByEmail(email: string): Promise<User | undefined>        │
│ getUserByMaraId(maraId: string): Promise<User | undefined>      │
│ getAllUsers(): Promise<User[]>                                  │
│ createUser(user: InsertUser): Promise<User>                     │
│ updateUser(id, data): Promise<User | undefined>                 │
│                                                                 │
│ // Claim operations                                             │
│ getClaim(id: number): Promise<Claim | undefined>                │
│ getClaimsByUser(userId: number): Promise<Claim[]>               │
│ getAllClaims(): Promise<Claim[]>                                │
│ getClaimsByStatus(status: string): Promise<Claim[]>             │
│ createClaim(claim: InsertClaim): Promise<Claim>                 │
│ updateClaimStatus(id, data, reviewedBy): Promise<Claim>         │
│                                                                 │
│ // Academic record operations                                   │
│ getAcademicRecord(id): Promise<AcademicRecord | undefined>      │
│ getAcademicRecordsByUser(userId): Promise<AcademicRecord[]>     │
│ createAcademicRecord(record): Promise<AcademicRecord>           │
│ updateAcademicRecord(id, data): Promise<AcademicRecord>         │
│                                                                 │
│ // Course operations                                            │
│ getCourse(id: number): Promise<Course | undefined>              │
│ getCoursesByAcademicRecord(recordId): Promise<Course[]>         │
│ createCourse(course: InsertCourse): Promise<Course>             │
│ updateCourse(id, data): Promise<Course | undefined>             │
│                                                                 │
│ // Study plan operations                                        │
│ getStudyPlan(id: number): Promise<StudyPlan | undefined>        │
│ getStudyPlansByUser(userId: number): Promise<StudyPlan[]>       │
│ createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>      │
│                                                                 │
│ // Notification operations                                      │
│ getNotification(id): Promise<Notification | undefined>          │
│ getNotificationsByUser(userId): Promise<Notification[]>         │
│ createNotification(notification): Promise<Notification>         │
│ markNotificationAsRead(id): Promise<Notification | undefined>   │
└────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │
                ┌─────────────┴──────────────┐
                │                            │
┌───────────────┴────────────┐  ┌────────────┴───────────────┐
│        MemStorage          │  │      DatabaseStorage        │
├───────────────────────────┬┤  ├────────────────────────────┤
│ users: Map<number, User>  ││  │ db: DrizzleORM             │
│ claims: Map<>             ││  │                            │
│ academicRecords: Map<>    ││  │ // Implements all methods  │
│ courses: Map<>            ││  │ // from IStorage interface │
│ studyPlans: Map<>         ││  │ // using database queries  │
│ notifications: Map<>      ││  │                            │
└────────────────────────────┘  └────────────────────────────┘
```

## API Routes Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                        Express Server                          │
└───────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                         API Router                             │
└───────────────────────────────────────────────────────────────┘
                              │
                              │
              ┌───────────────┼───────────────┬───────────────┐
              │               │               │               │
              ▼               ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  ┌─────────────┐
│  Auth Routes    │  │   User Routes   │  │ Claim Routes│  │Academic Routes│
├─────────────────┤  ├─────────────────┤  ├─────────────┤  ├─────────────┤
│ POST /login     │  │ POST /users     │  │ POST /claims│  │ POST /records│
│ POST /logout    │  │ GET /users      │  │ GET /claims │  │ GET /records │
│ GET /me         │  │ PUT /users/:id  │  │ GET /:id    │  │ GET /:id     │
└─────────────────┘  └─────────────────┘  │ PUT /:id    │  └─────────────┘
                                          └─────────────┘        
                                                                 
              ┌───────────────┬───────────────┬───────────────┐
              │               │               │               │
              ▼               ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  ┌─────────────┐
│  Course Routes  │  │ Study Plan Routes│  │ Notification│  │ File Routes │
├─────────────────┤  ├─────────────────┤  ├─────────────┤  ├─────────────┤
│ POST /courses   │  │ POST /plans     │  │ GET /notif.  │  │ POST /upload│
│ GET /:recordId  │  │ GET /plans      │  │ PUT /:id/read│  │ GET /:filename│
└─────────────────┘  └─────────────────┘  └─────────────┘  └─────────────┘
```

## React Components Hierarchy

```
┌───────────────────────────────────────────────────────────────┐
│                            App                                 │
└───────────────────────────────────────────────────────────────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
┌────────────────────────┐     ┌────────────────────────┐
│    Protected Routes    │     │     Public Routes      │
└────────────────────────┘     └────────────────────────┘
          │                              │
┌─────────┼─────────────┐               │
│         │             │               │
▼         ▼             ▼               ▼
┌─────┐ ┌─────┐ ┌───────────┐  ┌───────────────┐
│Home │ │Claim│ │Academic   │  │     Auth      │
│Page │ │Pages│ │Pages      │  │     Page      │
└─────┘ └─────┘ └───────────┘  └───────────────┘
  │       │          │                  │
  │       │          │                  │
  ▼       ▼          ▼                  ▼
┌─────┐ ┌─────┐ ┌───────────┐  ┌───────────────┐
│Dash-│ │Claim│ │Academic   │  │ Login/Register│
│board│ │Form │ │RecordForm │  │     Forms     │
└─────┘ └─────┘ └───────────┘  └───────────────┘
```

## Authentication State Flow

```
┌───────────────────────────────────────────────────────────────┐
│                        AuthProvider                            │
├───────────────────────────────────────────────────────────────┤
│ user: User | null                                              │
│ isLoading: boolean                                             │
│ error: Error | null                                            │
│                                                                │
│ loginMutation()                                                │
│ logoutMutation()                                               │
│ registerMutation()                                             │
└───────────────────────────────────────────────────────────────┘
                              │
                              │ Context API
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                          useAuth()                             │
├───────────────────────────────────────────────────────────────┤
│ Returns the auth context with all values and mutations         │
└───────────────────────────────────────────────────────────────┘
                              │
                              │
         ┌──────────────────┬─┴───────────────┬──────────────────┐
         │                  │                 │                  │
         ▼                  ▼                 ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│  ProtectedRoute │ │   LoginForm  │ │ RegisterForm │ │ UserProfilePage  │
└─────────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘
```

## State Management Flow

```
┌───────────────────────────────────────────────────────────────────┐
│                      TanStack Query Client                         │
├───────────────────────────────────────────────────────────────────┤
│ queryCache                                                         │
│ mutationCache                                                      │
└───────────────────────────────────────────────────────────────────┘
                                 │
                                 │
       ┌──────────────────┬─────┴─────┬──────────────────┐
       │                  │           │                  │
       ▼                  ▼           ▼                  ▼
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  useQuery  │    │useMutation │    │queryClient │    │  Queries   │
│            │    │            │    │invalidate  │    │  prefetch  │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
       │                  │                                  
       │                  │                                  
┌────────────┐    ┌────────────┐                            
│ Component  │    │ Component  │                            
│   Data     │    │   Create/  │                            
│  Display   │    │   Update   │                            
└────────────┘    └────────────┘                            
```

## Request/Response Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│ React       │────►│ TanStack    │────►│ Express     │────►│ Database    │
│ Component   │     │ Query       │     │ API         │     │ Storage     │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       ▲                   ▲                   ▲                   │
       │                   │                   │                   │
       │                   │                   │                   │
       └───────────────────┴───────────────────┘◄──────────────────┘
                        Response Data
```

These UML diagrams provide a visual representation of the structure, relationships, and interactions within the MyFinTracker application. They help illustrate how different components work together, how data flows through the system, and how the application is organized.