 COMPLETE PROJECT WALKTHROUGH: Task + Time Tracker
STEP 1: PROJECT OVERVIEW
What Does This Project Do? (Simple Explanation)
This is a personal productivity application that helps you:
Track Tasks - One-time things you need to do (like "Finish report")
Build Good Habits - Things you want to do daily (like "Read 10 pages")
Break Bad Habits - Things you want to stop doing (like "Avoid junk food")
Track Professional Goals - Work-related recurring tasks with time tracking
Think of it as a combination of a to-do list + habit tracker + time tracker.
Tech Stack (The Tools Used)
Layer	Technology	Purpose
Frontend	Next.js 16 + React 19	The web pages you see
Styling	Tailwind CSS 4	Makes things look pretty
Backend API	tRPC	Type-safe communication between frontend and backend
Database	PostgreSQL (Neon)	Stores all your data
ORM	Prisma 7	Talks to the database in TypeScript
Auth	Clerk	Login/logout, user management
State Management	React Query (TanStack)	Caches data, manages loading states
Validation	Zod	Validates data shapes
Language	TypeScript	Type-safe JavaScript
Folder Structure
plaintext
task-tracker/
├── app/                    # 🌐 FRONTEND - All pages and UI components
│   ├── api/trpc/          # API endpoint for tRPC
│   ├── components/        # Reusable UI components
│   ├── reports/           # Analytics pages
│   ├── layout.tsx         # Root layout (wraps everything)
│   ├── page.tsx           # Main home page
│   └── providers.tsx      # React Query + tRPC setup
│
├── server/                 # 🖥️ BACKEND - API logic
│   ├── routers/           # API endpoints (procedures)
│   ├── queries/           # Database queries
│   ├── db.ts              # Database connection
│   ├── trpc.ts            # tRPC initialization
│   └── index.ts           # Combines all routers
│
├── hooks/                  # 🎣 Custom React hooks (reusable logic)
├── lib/                    # 📚 Shared utilities and configs
│   ├── config/            # Mode configurations (task types)
│   └── utils/             # Helper functions (dates, filters, etc.)
│
├── types/                  # 📝 TypeScript type definitions
├── utils/                  # 🔧 Client-side utilities (tRPC client)
├── prisma/                 # 🗄️ Database schema and migrations
└── middleware.ts           # 🔒 Clerk authentication middleware
STEP 2: APPLICATION ENTRY FLOW
Where Does the App Start?
Step 1: User visits the website
plaintext
Browser → middleware.ts → app/layout.tsx → app/page.tsx
The Initialization Chain
1. middleware.ts - The Gatekeeper
typescript
import { clerkMiddleware } from "@clerk/nextjs/server";
export default clerkMiddleware();
What: Runs BEFORE every request
Why: Checks if user is authenticated
How: Clerk middleware intercepts requests and manages auth cookies
2. app/layout.tsx - The Shell
typescript
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>           // Provides auth context
      <html lang="en">
        <body>
          <Providers>         // Provides data fetching context
            {children}        // Your actual page content
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
What: Wraps the entire application
Why: Sets up authentication + data fetching for all pages
How: Nests providers so all child components can access them
3. app/providers.tsx - The Data Layer Setup
typescript
"use client"; // Must run in browser

export function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient({...}));
    const [trpcClient] = useState(() => trpc.createClient({...}));
    
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}
What: Creates the tRPC client and React Query client
Why: Enables data fetching with caching and type safety
How: Creates singleton instances, wraps children with context
4. app/page.tsx - The Main Page
typescript
"use client";

function HomeContent() {
  const { data: tasks, isLoading, refetch } = trpc.task.getTasks.useQuery({...});
  // Fetch tasks from backend, show loading state, render UI
}
What: The actual content users see
Why: Displays tasks, handles navigation
How: Uses tRPC hooks to fetch data, renders components
Environment Variables
Located in .env.local (not committed to git):
Variable	Purpose
DATABASE_URL	PostgreSQL connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY	Clerk frontend key
CLERK_SECRET_KEY	Clerk backend secret
Frontend ↔ Backend Connection
plaintext
┌─────────────────────┐     HTTP POST      ┌──────────────────────┐
│    React Component  │ ─────────────────► │  /api/trpc endpoint  │
│    (uses trpc hook) │                    │  (handles request)   │
└─────────────────────┘                    └──────────────────────┘
         │                                           │
         │ trpc.task.getTasks.useQuery()             │ Calls taskRouter
         ▼                                           ▼
┌─────────────────────┐                    ┌──────────────────────┐
│   utils/trpc.ts     │                    │  server/routers/     │
│   (client config)   │                    │  task.ts             │
└─────────────────────┘                    └──────────────────────┘
                                                     │
                                                     │ Uses Prisma
                                                     ▼
                                           ┌──────────────────────┐
                                           │   PostgreSQL DB      │
                                           └──────────────────────┘
STEP 3: DATABASE LAYER (VERY DETAILED)
Database: PostgreSQL via Neon
Neon is a serverless PostgreSQL database. The app uses Prisma to talk to it.
Schema File: prisma/schema.prisma
This file defines the shape of your data. Think of it as the blueprint.
The 4 Main Tables (Models)
1. Task - The Main Entity
prisma
model Task {
  id          String   @id @default(cuid())  // Unique identifier
  title       String                          // "Read 10 pages"
  type        String   @default("task")       // "task" | "habit" | "time"
  habitType   String   @default("")           // "" | "time" | "amount" | "both"
  userId      String   @default("")           // Clerk user ID
  
  // Scheduling
  repeatMode  String   @default("none")       // "none" | "daily" | "weekly"
  weekdays    Int[]                           // [1,3,5] = Mon, Wed, Fri
  startDate   DateTime?
  endDate     DateTime?
  
  // Categorization
  category    String   @default("task")       // "task" | "make_habit" | "break_habit" | "professional"
  priority    String   @default("medium")     // "low" | "medium" | "high"
  
  // Progress tracking
  requiredMinutes Int? @default(0)            // Daily time goal (for time habits)
  requiredAmount  Int? @default(0)            // Daily count goal (for amount habits)
  subtasks        String[]                    // ["Buy milk", "Call mom"]
  
  // State
  isCompleted Boolean @default(false)
  isArchived  Boolean @default(false)
  
  // Relations
  logs          TimeLog[]                     // Time tracking entries
  statuses      TaskStatus[]                  // Daily status entries
  timerSessions TimerSession[]                // Timer sessions
}
2. TimeLog - Legacy Time Tracking
prisma
model TimeLog {
  id       String   @id
  seconds  Int      @default(0)    // How many seconds worked
  date     DateTime               // Which day
  taskId   String                 // Links to Task
  
  @@unique([taskId, date])        // One log per task per day
}
3. TaskStatus - Daily Progress
prisma
model TaskStatus {
  id                String   @id
  taskId            String
  date              DateTime
  status            Status   @default(NONE)  // NONE | FAIL | HALF | SUCCESS
  completedSubtasks String[] @default([])    // ["Buy milk"] - which subtasks done
  dailySubtasks     String[] @default([])    // Snapshot of subtasks for that day
  progressLevel     Int      @default(0)     // 0-4 progress level
  
  @@unique([taskId, date])                   // One status per task per day
}
4. TimerSession - Active Timer Tracking
prisma
model TimerSession {
  id        String    @id
  taskId    String
  startTime DateTime
  endTime   DateTime?
  date      DateTime  // Day this belongs to (2AM cutoff)
  seconds   Int       @default(0)
  isActive  Boolean   @default(true)  // Is timer currently running?
}
Table Relationships
plaintext
┌─────────────┐
│    Task     │
│─────────────│
│ id (PK)     │◄─────────────────────────────────────┐
│ title       │                                      │
│ category    │                                      │
│ ...         │                                      │
└─────────────┘                                      │
      │                                              │
      │ 1:Many                                       │
      ▼                                              │
┌─────────────┐     ┌─────────────┐     ┌───────────┴─────┐
│  TimeLog    │     │ TaskStatus  │     │  TimerSession   │
│─────────────│     │─────────────│     │─────────────────│
│ taskId (FK) │     │ taskId (FK) │     │ taskId (FK)     │
│ date        │     │ date        │     │ startTime       │
│ seconds     │     │ status      │     │ seconds         │
└─────────────┘     │ progressLvl │     │ isActive        │
                    └─────────────┘     └─────────────────┘
Relationships:
One Task → Many TimeLogs (daily time entries)
One Task → Many TaskStatuses (daily progress entries)
One Task → Many TimerSessions (timer start/stop entries)
How Data Flows
Creating a Task:
plaintext
UI Form → trpc.task.createTask.mutate() → server/routers/task.ts → prisma.task.create() → PostgreSQL
Fetching Tasks:
plaintext
PostgreSQL → prisma.task.findMany() → server/routers/task.ts → trpc response → React Query cache → UI
Migrations
Located in prisma/migrations/. Each migration is a folder with SQL:
plaintext
prisma/migrations/
├── 20251214110934_add_performance_indexes/
│   └── migration.sql    # ALTER TABLE ADD INDEX...
└── 20251215160940_init/
    └── migration.sql    # CREATE TABLE...
Commands:
npx prisma migrate dev - Apply pending migrations
npx prisma generate - Generate Prisma Client from schema
npm run seed - Populate with sample data
STEP 4: BACKEND / SERVER LOGIC
API Architecture: tRPC
tRPC provides type-safe API calls. No REST endpoints to manage manually.
File Structure
plaintext
server/
├── trpc.ts      # Initialize tRPC, define procedures
├── index.ts     # Combine all routers, export AppRouter type
├── db.ts        # Prisma client singleton
├── routers/
│   └── task.ts  # All task-related procedures (685 lines!)
└── queries/
    └── tasks.ts # Reusable query logic
tRPC Initialization (server/trpc.ts)
typescript
const t = initTRPC.context<Context>().create({
  transformer: superjson,  // Handles Date, Map, Set serialization
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
Two Types of Procedures:
publicProcedure - Anyone can call (not used in this app)
protectedProcedure - Must be logged in (all endpoints use this)
The Task Router (server/routers/task.ts)
This is the heart of the backend. Key procedures:
Procedure	Type	Purpose
getTasks	Query	Fetch all tasks for current month
createTask	Mutation	Create a new task
updateStatus	Mutation	Update daily status (NONE/FAIL/HALF/SUCCESS)
updateProgress	Mutation	Update progress level (0-4)
deleteTask	Mutation	Delete a task
startTimer	Mutation	Start timing a task
stopTimer	Mutation	Stop timer, save duration
editTask	Mutation	Update task details
Example: getTasks Procedure
typescript
getTasks: protectedProcedure
  .input(z.object({                    // Validate input with Zod
    month: z.number().optional(),
    year: z.number().optional()
  }).optional())
  .query(async ({ input, ctx }) => {   // Query = fetching data
    const tasks = await prisma.task.findMany({
      where: {
        userId: ctx.userId,            // Only user's tasks!
        // Complex filtering for relevant tasks...
      },
      select: {                        // Only select needed fields
        id: true,
        title: true,
        logs: { where: { date: {...} } },      // Include related logs
        statuses: { where: { date: {...} } },  // Include statuses
        timerSessions: {...},
      }
    });
    return tasks;
  }),
Authentication Flow
plaintext
1. User logs in via Clerk UI
2. Clerk sets secure cookie
3. Request comes to /api/trpc
4. route.ts extracts userId from Clerk:
   
   createContext: async () => {
     const { userId } = await auth();
     return { userId: userId || null };
   }
   
5. protectedProcedure checks if userId exists
6. If not, throws UNAUTHORIZED error
7. If yes, proceeds with database query
Validation with Zod
Every input is validated:
typescript
.input(z.object({
  taskId: z.string(),
  date: z.string(),
  status: z.enum(["NONE", "FAIL", "HALF", "SUCCESS"]).optional(),
  completedSubtasks: z.array(z.string()).optional(),
}))
If validation fails, tRPC returns an error automatically.
Error Handling
typescript
if (!task) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Task not found or access denied",
  });
}
Errors are typed and caught by the frontend automatically.
STEP 5: FRONTEND FLOW
UI Architecture
Next.js 16 uses React Server Components by default, but this app uses "use client" for interactive components.
State Management
React Query (TanStack) handles:
Data fetching (useQuery)
Mutations (useMutation)
Caching (data stays fresh for 5 minutes)
Optimistic updates (UI updates before server confirms)
Data Fetching Pattern
typescript
// In any component
const { data: tasks, isLoading, refetch } = trpc.task.getTasks.useQuery({
  month: 11,
  year: 2024
});

// data = the tasks array
// isLoading = true while fetching
// refetch = function to manually refetch
Component Hierarchy
plaintext
app/page.tsx (HomeContent)
├── MainTabs              # Task | Make Habit | Break Habit | Professional
├── SubTabs               # Active | Archived | Completed
├── TaskListContainer     # Filters and displays tasks
│   └── TaskCard          # Individual task display
│       ├── StatusBadge   # Shows progress %
│       ├── ProgressBoxes # 4-level progress indicator
│       ├── TaskTimer     # Start/stop timer
│       ├── SubtaskList   # Checkable subtasks
│       └── AddSubtask    # Add new subtask button
├── AddTask               # Form to create new task
│   ├── AddTaskHeader     # Title input + submit
│   ├── TaskDetails       # Habit type, dates, priority
│   └── AdditionalInfo    # Subtasks, notes
└── DeleteSelectedButton  # Multi-delete
Major Components
1. TaskCard.tsx (The Most Complex - 408 lines)
Displays a single task with all its features:
Title and badges
Progress indicator
Timer controls
Subtask list with completion tracking
Edit/Delete buttons
Uses multiple custom hooks:
typescript
const { deleteTask, updateStatus, updateProgress } = useTaskActions(refetch);
const { localSeconds, isRunning, start, stop } = useTimerSession({ taskId });
const { activeSubtasks, completedSubtasks, toggleSubtask } = useTaskSubtasks(task);
2. AddTask.tsx - Task Creation Form
Dynamically shows different fields based on task type:
Task: Title, priority, due date, subtasks
Make Habit: Title, repeat mode, dates, habit type
Break Habit: Title, limit, trigger time
Professional: Title, dates, priority, category, subtasks
Uses modeConfig.ts to determine which fields to show.
3. HabitGrid.tsx - Monthly Calendar View
Shows 30+ day boxes for habit tracking. Each box is clickable to toggle status.
Custom Hooks (Reusable Logic)
Hook	Purpose
useTaskActions	Provides mutation functions (delete, update status, update progress)
useTimerSession	Manages timer state (start, stop, local seconds)
useTaskSubtasks	Manages subtask completion state
useAddTaskForm	Manages form state for task creation
useHabitGrid	Logic for the monthly habit grid
Form and Events Flow
Example: Completing a Subtask
plaintext
1. User clicks checkbox next to "Buy milk"
2. toggleSubtask("Buy milk") called
3. Local state updates immediately (optimistic)
4. updateStatus.mutate({ completedSubtasks: [...] }) called
5. tRPC sends request to server
6. Server updates database
7. Server responds with success
8. React Query updates cache
9. UI confirms change
STEP 6: END-TO-END DATA FLOW
Feature: Creating a Professional Habit with Subtasks
Let's trace "Create a habit called 'Daily Standup' with subtasks 'Review tickets, Update Jira'"
Step 1: User Opens Add Form
plaintext
User clicks "Professional" tab
→ MainTabs updates URL to ?tab=professional
→ AddTask reads activeTab prop
→ getModeConfig("professional") returns professional config
→ Form renders with Professional styling and fields
Step 2: User Fills Form
plaintext
User types "Daily Standup" in title
→ updateForm("title", "Daily Standup")
→ form state updates: { title: "Daily Standup", ... }

User types "Review tickets, Update Jira" in subtasks
→ updateForm("subtasksStr", "Review tickets, Update Jira")
Step 3: User Submits
typescript
// In useAddTaskForm.ts
createTask.mutate({
  title: "Daily Standup",
  category: "professional",
  subtasks: ["Review tickets", "Update Jira"],
  // ... other fields
});
Step 4: Request to Server
plaintext
POST /api/trpc
Body: { procedure: "task.createTask", input: {...} }
Step 5: Server Processing
typescript
// server/routers/task.ts
createTask: protectedProcedure
  .input(z.object({ title: z.string(), ... }))
  .mutation(async ({ input, ctx }) => {
    // Verify user is logged in (ctx.userId)
    // Validate input with Zod
    
    const newTask = await prisma.task.create({
      data: {
        title: input.title,
        category: "professional",
        subtasks: ["Review tickets", "Update Jira"],
        userId: ctx.userId,
        // ...
      }
    });
    
    return newTask;
  });
Step 6: Database Insert
sql
INSERT INTO "Task" (id, title, category, subtasks, userId, ...)
VALUES ('cuid123', 'Daily Standup', 'professional', '{"Review tickets","Update Jira"}', 'user_abc', ...);
Step 7: Response to Client
json
{
  "result": {
    "data": {
      "id": "cuid123",
      "title": "Daily Standup",
      "category": "professional",
      "subtasks": ["Review tickets", "Update Jira"]
    }
  }
}
Step 8: UI Updates
plaintext
1. createTask.onSuccess() called
2. Form resets to empty
3. utils.task.getTasks.invalidate() marks cache as stale
4. getTasks query refetches automatically
5. TaskListContainer re-renders with new task
6. New TaskCard appears showing "Daily Standup"
STEP 7: ADVANCED CONCEPTS
Optimistic Updates
The app updates UI before server confirms:
typescript
// In useTaskActions.ts
updateProgress: trpc.task.updateProgress.useMutation({
  onMutate: async (variables) => {
    // 1. Cancel outgoing refetches
    await utils.task.getTasks.cancel();
    
    // 2. Save current state (for rollback)
    const previousTasks = utils.task.getTasks.getData();
    
    // 3. Immediately update cache
    utils.task.getTasks.setData(queryInput, (old) => {
      return old.map(task => {
        if (task.id === variables.taskId) {
          return { ...task, progressLevel: variables.progressLevel };
        }
        return task;
      });
    });
    
    return { previousTasks };
  },
  onError: (err, variables, context) => {
    // 4. If error, rollback to previous state
    utils.task.getTasks.setData(queryInput, context.previousTasks);
  },
});
2AM Day Boundary
Days reset at 2AM, not midnight. This allows late-night work to count toward "today":
typescript
// lib/utils/date.ts
export function get2AMBoundaries(date: Date) {
  const start = new Date(date);
  if (start.getHours() < 2) {
    start.setDate(start.getDate() - 1);
  }
  start.setHours(2, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  
  return { start, end };
}
Server Components vs Client Components
Type	Markers	Use Case
Server Component	No directive	Static content, data fetching without hooks
Client Component	"use client"	Interactive, uses useState/useEffect
Most components in this app are Client Components due to interactivity.
Caching Strategy
typescript
// In providers.tsx
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000,     // Data fresh for 5 min
    gcTime: 10 * 60 * 1000,       // Keep in cache 10 min
    refetchOnWindowFocus: false,   // Don't refetch on tab switch
  }
}
Security Considerations
All procedures are protected - Must be logged in
User isolation - Every query filters by userId: ctx.userId
Input validation - Zod validates all inputs
Clerk middleware - Runs on every request
STEP 8: PROJECT WEAKNESSES & IMPROVEMENTS
Issues Found
1. No Error Boundary
If a component crashes, the whole app breaks.Fix: Add React Error Boundary:
typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
2. No Unit Tests
No test files exist.Fix: Add Jest + React Testing Library:
plaintext
npm install --save-dev jest @testing-library/react
3. Large TaskCard Component
408 lines is too big.Fix: Extract into smaller components:
TaskCardHeader
TaskCardProgress
TaskCardTimer
TaskCardSubtasks
4. Unused Code
TasksListServer.tsx and TasksListServerRSC.tsx seem unused
lib/utils/memo.ts may be unused
Fix: Remove dead code.
5. No Loading States for Mutations
Some buttons don't show loading.Fix: Use isPending from mutations:
typescript
<button disabled={mutation.isPending}>
  {mutation.isPending ? "Saving..." : "Save"}
</button>
6. No Offline Support
App doesn't work without internet.Fix: Add Service Worker / PWA support.
7. No Data Export
Users can't export their data.Fix: Add CSV/JSON export endpoint.
Suggested Improvements
Add tests for critical paths (create task, complete subtask)
Add rate limiting to prevent abuse
Add activity logging for debugging
Add data backup functionality
Add keyboard shortcuts for power users
STEP 9: VISUAL UNDERSTANDING (PlantUML Diagrams)
1. High-Level System Architecture
plantuml
@startuml
!theme plain

package "Browser" {
  [React App]
  [React Query Cache]
}

package "Next.js Server" {
  [Middleware\n(Clerk Auth)]
  [API Route\n/api/trpc]
  [tRPC Router]
}

package "External Services" {
  [Clerk\nAuth Service]
  [Neon\nPostgreSQL]
}

[React App] --> [Middleware\n(Clerk Auth)] : HTTP Request
[Middleware\n(Clerk Auth)] --> [Clerk\nAuth Service] : Verify Token
[Middleware\n(Clerk Auth)] --> [API Route\n/api/trpc] : Authenticated Request
[API Route\n/api/trpc] --> [tRPC Router] : Handle Procedure
[tRPC Router] --> [Neon\nPostgreSQL] : Prisma Query
[React App] <--> [React Query Cache] : Cache Data

@enduml
2. Frontend ↔ Backend ↔ Database Flow
plantuml
@startuml
!theme plain

actor User
participant "React Component" as RC
participant "tRPC Client\n(utils/trpc.ts)" as TC
participant "API Route\n(/api/trpc)" as AR
participant "tRPC Router\n(server/routers)" as TR
participant "Prisma Client\n(server/db.ts)" as PC
database "PostgreSQL\n(Neon)" as DB

User -> RC : Click "Add Task"
RC -> TC : trpc.task.createTask.mutate(data)
TC -> AR : POST /api/trpc
AR -> TR : createTask procedure
TR -> PC : prisma.task.create()
PC -> DB : INSERT INTO Task
DB --> PC : New task row
PC --> TR : Task object
TR --> AR : JSON response
AR --> TC : tRPC response
TC --> RC : data / error
RC --> User : Show success/error

@enduml
3. Sequence Diagram: Complete a Subtask
plantuml
@startuml
!theme plain

actor User
participant "SubtaskList" as SL
participant "useTaskSubtasks" as UTS
participant "useTaskActions" as UTA
participant "React Query" as RQ
participant "tRPC Server" as TS
participant "Prisma" as PR
database "PostgreSQL" as DB

User -> SL : Click subtask checkbox
SL -> UTS : toggleSubtask("Buy milk")

note right of UTS : Optimistic update
UTS -> UTS : setLocalCompleted([...])

UTS -> UTA : updateStatus.mutate()
UTA -> RQ : Cache update (optimistic)
RQ --> SL : Re-render with check

UTA -> TS : POST /api/trpc
TS -> PR : prisma.taskStatus.upsert()
PR -> DB : UPDATE completedSubtasks
DB --> PR : Success
PR --> TS : Updated status
TS --> UTA : Response

alt Success
  UTA -> RQ : Confirm cache
else Error
  UTA -> RQ : Rollback cache
  RQ --> SL : Re-render unchecked
end

@enduml
4. Folder/Module Dependency Diagram
plantuml
@startuml
!theme plain

package "Entry Points" {
  [middleware.ts]
  [app/layout.tsx]
  [app/page.tsx]
}

package "Frontend" {
  [app/providers.tsx]
  [app/components/*]
  [hooks/*]
}

package "Shared" {
  [utils/trpc.ts]
  [types/task.ts]
  [lib/utils/*]
  [lib/config/*]
}

package "Backend" {
  [server/trpc.ts]
  [server/index.ts]
  [server/routers/*]
  [server/db.ts]
}

package "Database" {
  [prisma/schema.prisma]
}

[app/layout.tsx] --> [app/providers.tsx]
[app/page.tsx] --> [app/components/*]
[app/components/*] --> [hooks/*]
[hooks/*] --> [utils/trpc.ts]
[utils/trpc.ts] --> [server/index.ts] : Type import
[server/index.ts] --> [server/routers/*]
[server/routers/*] --> [server/db.ts]
[server/db.ts] --> [prisma/schema.prisma]
[hooks/*] --> [types/task.ts]
[app/components/*] --> [lib/config/*]
[server/routers/*] --> [lib/utils/*]

@enduml
Summary
This project is a well-structured full-stack TypeScript application with:
✅ Type-safe API with tRPC
✅ Secure auth with Clerk
✅ Optimistic updates for instant UI
✅ Proper database relations with Prisma
✅ Flexible habit tracking with multiple modes
Key Learning Points:
Data flows: UI → tRPC hook → API route → tRPC router → Prisma → PostgreSQL
Auth flows through Clerk middleware and context
State management via React Query with optimistic updates
Component composition with custom hooks for logic reuse