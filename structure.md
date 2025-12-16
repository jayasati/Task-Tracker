# 📁 COMPLETE FILE-BY-FILE CODEBASE NAVIGATION GUIDE

This guide walks you through **EVERY file** in the codebase in the optimal order for understanding. Read them in this exact sequence.

---

## 🎯 READING ORDER OVERVIEW

```
1. Configuration Files (understand project setup)
2. Database Layer (understand data structure)
3. Backend/Server (understand API)
4. Types (understand data shapes)
5. Utilities (understand helpers)
6. Hooks (understand reusable logic)
7. Frontend Entry (understand app flow)
8. Components (understand UI)
```

---

## PHASE 1: PROJECT CONFIGURATION (10 files)

Read these first to understand what technologies are used and how the project is configured.

### 📄 File 1: `package.json`
**Purpose**: Lists all dependencies and scripts
**Key things to note**:
- `dependencies`: Next.js, React, tRPC, Prisma, Clerk, Tailwind
- `scripts`: `dev`, `build`, `seed`, `db:push`

### 📄 File 2: `tsconfig.json`
**Purpose**: TypeScript configuration
**Key things to note**:
- Path aliases (`@/*` maps to root)
- Strict mode enabled

### 📄 File 3: `next.config.ts`
**Purpose**: Next.js configuration
**Key things to note**:
- Any custom webpack or experimental features

### 📄 File 4: `middleware.ts`
**Purpose**: Runs BEFORE every request - handles authentication
**Key things to note**:
- Uses Clerk's `clerkMiddleware()`
- Protects all routes by default

### 📄 File 5: `eslint.config.mjs`
**Purpose**: Linting rules
**Key things to note**:
- Uses Next.js recommended rules

### 📄 File 6: `postcss.config.mjs`
**Purpose**: PostCSS for Tailwind CSS processing

### 📄 File 7: `prisma.config.ts`
**Purpose**: Prisma CLI configuration

### 📄 File 8: `.gitignore`
**Purpose**: Files excluded from version control

### 📄 File 9: `.npmrc`
**Purpose**: npm configuration

### 📄 File 10: `.vscode/` (folder)
**Purpose**: VS Code workspace settings

---

## PHASE 2: DATABASE LAYER (3 files)

Understand the data model before anything else.

### 📄 File 11: `prisma/schema.prisma` ⭐ CRITICAL
**Purpose**: Defines ALL database tables and relationships
**Key things to note**:
- **Task** - Main entity (title, type, habitType, category, subtasks, etc.)
- **TimeLog** - Legacy time tracking per day
- **TaskStatus** - Daily progress/status per task
- **TimerSession** - Active timer tracking
- Relationships: Task → (many) TimeLog, TaskStatus, TimerSession

### 📄 File 12: `prisma/seed.ts`
**Purpose**: Seeds sample data for testing
**Key things to note**:
- Creates sample tasks, habits, logs
- Run with `npm run seed`

### 📄 File 13: `prisma/migrations/` (folder)
**Purpose**: Database migration history
**Key things to note**:
- Each migration is a snapshot of schema changes

---

## PHASE 3: BACKEND SERVER (11 files)

Understand how API works. **The task router has been modularized into separate files.**

### 📄 File 14: `server/db.ts` ⭐ CRITICAL
**Purpose**: Creates Prisma client singleton with Neon adapter
**Key things to note**:
- Uses `@prisma/adapter-neon` for serverless PostgreSQL
- Singleton pattern prevents connection exhaustion

### 📄 File 15: `server/trpc.ts` ⭐ CRITICAL
**Purpose**: Initializes tRPC with authentication
**Key things to note**:
- `createTRPCContext` - Creates context with userId from Clerk
- `protectedProcedure` - Ensures user is authenticated
- All API calls must use this to be protected

### 📄 File 16: `server/index.ts` ⭐ CRITICAL
**Purpose**: Combines all routers, exports `AppRouter` type
**Key things to note**:
- `appRouter` contains all API endpoints
- `AppRouter` type is used by frontend for type safety

### 📁 Files 17-22: `server/routers/task/` (MODULAR STRUCTURE) ⭐ CRITICAL
**Purpose**: Task router split into organized modules

| File | Purpose |
|------|--------|
| `task/index.ts` | Main router - combines all procedures |
| `task/schemas.ts` | Zod validation schemas for all endpoints |
| `task/queries.ts` | Read operations (`getTasks`) |
| `task/mutations.ts` | CRUD operations (`addTask`, `editTask`, `updateTask`, `deleteTask`) |
| `task/statusProcedures.ts` | Status/progress updates (`updateStatus`, `updateProgress`, `updateSeconds`) |
| `task/timerProcedures.ts` | Timer management (`startTimer`, `stopTimer`, `addMissedTime`, `getActiveTimer`) |
| `task/selectionProcedures.ts` | Multi-select (`toggleTaskSelection`, `deleteMultipleTasks`) |

### 📄 File 23: `server/routers/task.ts`
**Purpose**: Re-exports from modular task/ folder (backward compatibility)

### 📄 File 24: `server/routers/_app.ts`
**Purpose**: Empty/placeholder router file

### 📄 File 25: `server/queries/tasks.ts`
**Purpose**: Reusable database queries (used by server components)
**Key things to note**:
- `getTasksForMonth()` - Same as getTasks but for RSC
- Optimized query with includes

---

## PHASE 4: API ROUTE (1 file)

### 📄 File 20: `app/api/trpc/[trpc]/route.ts` ⭐ CRITICAL
**Purpose**: Next.js API route that handles ALL tRPC requests
**Key things to note**:
- Catch-all route `[trpc]`
- Creates context with Clerk auth
- Connects frontend to backend

---

## PHASE 5: TYPE DEFINITIONS (1 file)

### 📄 File 21: `types/task.ts` ⭐ CRITICAL
**Purpose**: TypeScript interfaces for Task and related types
**Key types**:
- `Task` - Full task object with all fields
- `TaskCardProps` - Props for TaskCard component
- `TimerSession` - Timer session structure
- `TaskStatus` - Daily status structure

---

## PHASE 6: UTILITY FUNCTIONS (10 files)

Helper functions used throughout the app.

### 📄 File 22: `utils/trpc.ts` ⭐ CRITICAL
**Purpose**: Creates tRPC client for frontend
**Key things to note**:
- `trpc` - Main hook for API calls
- Configured with HTTP batch link

### 📄 File 23: `utils/utils.txt`
**Purpose**: Notes/documentation (not code)

### 📄 File 24: `lib/prisma.ts`
**Purpose**: Alternative Prisma client (legacy, may be unused)

### 📄 File 25: `lib/config/modeConfig.ts` ⭐ IMPORTANT
**Purpose**: Configuration for each task mode (Task, Make Habit, Break Habit, Professional)
**Key things to note**:
- `modeConfigs` - Defines which fields show for each mode
- Controls form behavior per category

### 📄 File 26: `lib/utils/date.ts` ⭐ IMPORTANT
**Purpose**: Date utilities with 2AM boundary logic
**Key functions**:
- `get2AMDayKey()` - Gets date key accounting for 2AM reset
- `get2AMBoundaries()` - Gets day start/end at 2AM
- `toISODate()` - Formats date to YYYY-MM-DD

### 📄 File 27: `lib/utils/filters.ts` ⭐ IMPORTANT
**Purpose**: Task filtering logic
**Key functions**:
- `filterByCategory()` - Filter by task/habit type
- `filterBySubView()` - Filter by active/archived/completed
- `getTodayTasks()` - Get tasks for today
- `isProfessionalCategory()` - Check if custom category

### 📄 File 28: `lib/utils/analytics.ts`
**Purpose**: Analytics calculations for reports
**Key things to note**:
- Streak calculations
- Completion rate stats
- Time tracking aggregations

### 📄 File 29: `lib/utils/autoEvaluation.ts`
**Purpose**: Auto-evaluates habit success/fail based on progress
**Key things to note**:
- Determines if habit met daily goal

### 📄 File 30: `lib/utils/status.ts`
**Purpose**: Status helper functions
**Key things to note**:
- Status color mapping
- Status display text

### 📄 File 31: `lib/utils/time.ts`
**Purpose**: Time formatting utilities
**Key functions**:
- `formatTime()` - Format seconds to HH:MM:SS
- `formatHours()` - Format to hours

### 📄 File 32: `lib/utils/memo.ts`
**Purpose**: Memoization utilities for performance

---

## PHASE 7: CUSTOM HOOKS (7 files)

Reusable React logic.

### 📄 File 33: `hooks/useTaskActions.ts` ⭐ CRITICAL
**Purpose**: Task mutation hooks with optimistic updates
**Key things to note**:
- `deleteTask` - Delete with confirmation
- `updateStatus` - Update daily status
- `updateProgress` - Update progress level
- Uses optimistic updates for instant UI

### 📄 File 34: `hooks/useTimerSession.ts` ⭐ IMPORTANT
**Purpose**: Timer start/stop/tracking logic
**Key things to note**:
- `start()` / `stop()` - Controls timer
- `localSeconds` - Current elapsed time
- `isRunning` - Timer state

### 📄 File 35: `hooks/useTaskSubtasks.ts` ⭐ IMPORTANT
**Purpose**: Subtask completion tracking with daily reset
**Key things to note**:
- `activeSubtasks` - Today's subtasks
- `completedSubtasks` - Completed today
- `toggleSubtask` - Mark complete/incomplete
- Daily reset for habits (no rollover)

### 📄 File 36: `hooks/useAddTaskForm.ts`
**Purpose**: Form state for creating new tasks
**Key things to note**:
- Form validation
- Field defaults per mode

### 📄 File 37: `hooks/useHabitGrid.ts`
**Purpose**: Monthly habit grid logic
**Key things to note**:
- Calendar grid calculations
- Status colors per day
- Click handlers for grid cells

### 📄 File 38: `hooks/useSubtaskModal.ts`
**Purpose**: Modal state for subtask editing

### 📄 File 39: `hooks/useMultiSelect.ts`
**Purpose**: Multi-select for batch operations

---

## PHASE 8: FRONTEND ENTRY POINT (4 files)

How the app boots up.

### 📄 File 40: `app/layout.tsx` ⭐ CRITICAL
**Purpose**: Root layout wrapping entire app
**Key things to note**:
- `ClerkProvider` - Auth context
- `Providers` - tRPC/React Query context
- `<html>` and `<body>` tags

### 📄 File 41: `app/providers.tsx` ⭐ CRITICAL
**Purpose**: Sets up tRPC and React Query
**Key things to note**:
- Creates `trpcClient`
- Creates `queryClient` with cache settings
- Wraps children in both providers

### 📄 File 42: `app/page.tsx` ⭐ CRITICAL
**Purpose**: Main home page component
**Key things to note**:
- Fetches tasks with `trpc.task.getTasks.useQuery()`
- Renders MainTabs, SubTabs, TaskListContainer, AddTask

### 📄 File 43: `app/loading.tsx`
**Purpose**: Loading UI shown during page transitions

### 📄 File 44: `app/globals.css`
**Purpose**: Global CSS with Tailwind imports

---

## PHASE 9: NAVIGATION COMPONENTS (2 files)

### 📄 File 45: `app/components/Navigation/MainTabs.tsx`
**Purpose**: Top-level tab navigation
**Tabs**: Today | Task | Make Habit | Break Habit | Professional | Reports

### 📄 File 46: `app/components/Navigation/SubTabs.tsx`
**Purpose**: Sub-navigation under each main tab
**Tabs**: Active | Archived | Completed (with counts)

---

## PHASE 10: TASK LIST COMPONENTS (4 files)

### 📄 File 47: `app/components/TaskList/TaskListContainer.tsx` ⭐ CRITICAL
**Purpose**: Filters and displays task list
**Key things to note**:
- Filters by category and view
- Sorts by priority (high → medium → low)
- Maps tasks to TaskCard components

### 📄 File 48: `app/components/TaskCard.tsx` ⭐ CRITICAL (Largest UI file)
**Purpose**: Individual task card display
**Key things to note**:
- Shows title, type badges, progress
- Timer controls for time-based habits
- Subtask list with checkboxes
- Edit/Delete/Analytics buttons

### 📄 File 49: `app/components/TaskCardSkeleton.tsx`
**Purpose**: Loading placeholder for task cards

### 📄 File 50-51: `app/components/TasksListServer.tsx` & `TasksListServerRSC.tsx`
**Purpose**: Legacy/unused server components

---

## PHASE 11: TASK SUB-COMPONENTS (11 files)

### 📄 File 52: `app/components/tasks/StatusBadge.tsx`
**Purpose**: Shows completion percentage badge (0-29%, 30-69%, 70-99%, 100%)

### 📄 File 53: `app/components/tasks/ProgressIndicator.tsx`
**Purpose**: Progress bar showing completion %

### 📄 File 54: `app/components/tasks/ProgressBoxes.tsx`
**Purpose**: 4-level progress indicator (click to set 25/50/75/100%)

### 📄 File 55: `app/components/tasks/TaskTimer.tsx`
**Purpose**: Timer display with Start/Stop buttons

### 📄 File 56: `app/components/tasks/SubtaskList.tsx`
**Purpose**: List of checkable subtasks

### 📄 File 57: `app/components/tasks/AddSubtask.tsx`
**Purpose**: Input to add new subtask

### 📄 File 58: `app/components/tasks/SubtaskModalList.tsx`
**Purpose**: Subtasks in modal view

### 📄 File 59: `app/components/tasks/SubtaskPlanningSection.tsx`
**Purpose**: Subtask planning during task creation

### 📄 File 60: `app/components/tasks/TaskHeader.tsx`
**Purpose**: Task title and meta info header

### 📄 File 61: `app/components/tasks/HabitDayBox.tsx`
**Purpose**: Single day box in habit grid

### 📄 File 62: `app/components/tasks/HabitLegend.tsx`
**Purpose**: Color legend for habit grid

---

## PHASE 12: ADD TASK COMPONENTS (7 files)

### 📄 File 63: `app/components/AddTask.tsx`
**Purpose**: Main add task form wrapper

### 📄 File 64: `app/components/add-task/AddTaskHeader.tsx`
**Purpose**: Form header with mode indicator

### 📄 File 65: `app/components/add-task/ModeHeader.tsx`
**Purpose**: Mode selection header

### 📄 File 66: `app/components/add-task/TaskDetails.tsx`
**Purpose**: Main form fields (title, type, habit type, etc.)

### 📄 File 67: `app/components/add-task/ScheduleSection.tsx`
**Purpose**: Date picker, repeat mode, weekday selection

### 📄 File 68: `app/components/add-task/AdditionalInfo.tsx`
**Purpose**: Notes, priority, optional fields

### 📄 File 69: `app/components/add-task/styles.ts`
**Purpose**: Shared styles for add-task form

---

## PHASE 13: MODAL COMPONENTS (3 files)

### 📄 File 70: `app/components/EditTaskModal.tsx` ⭐ IMPORTANT
**Purpose**: Modal to edit existing task
**Key things to note**:
- All editable fields
- Subtask editing
- Save/Cancel buttons

### 📄 File 71: `app/components/AddMissedTimeModal.tsx`
**Purpose**: Add time for missed sessions

### 📄 File 72: `app/components/SubtaskModal.tsx`
**Purpose**: Modal for subtask operations

---

## PHASE 14: HABIT GRID COMPONENT (1 file)

### 📄 File 73: `app/components/HabitGrid.tsx`
**Purpose**: Monthly calendar grid showing habit status per day
**Key things to note**:
- Color-coded days (green=success, red=fail, yellow=partial)
- Click to set status

---

## PHASE 15: REPORTS & ANALYTICS (12 files)

### 📄 File 74: `app/components/reports/ReportsCategoryBoxes.tsx`
**Purpose**: Category boxes on Reports tab

### 📄 File 75: `app/components/reports/ReportsView.tsx`
**Purpose**: Main reports view wrapper

### 📄 File 76: `app/components/reports/CategoryHabitList.tsx`
**Purpose**: List of habits per category

### 📄 File 77: `app/components/reports/HabitAnalyticsView.tsx` ⭐ IMPORTANT
**Purpose**: Detailed analytics for single habit
**Shows**: Heatmap, streaks, stats, time tracking

### 📄 File 78: `app/components/analytics/AnalyticsCard.tsx`
**Purpose**: Stat card component

### 📄 File 79: `app/components/analytics/Heatmap.tsx`
**Purpose**: GitHub-style contribution heatmap

### 📄 File 80: `app/components/analytics/StreakStats.tsx`
**Purpose**: Current/longest streak display

### 📄 File 81: `app/components/analytics/PeriodNavigator.tsx`
**Purpose**: Navigate between time periods

### 📄 File 82: `app/components/analytics/TimeRangeToggle.tsx`
**Purpose**: Toggle week/month/year view

### 📄 Files 83-85: `app/reports/*/page.tsx`
**Purpose**: Category listing pages (make-habit, break-habit, professional)

### 📄 Files 86-88: `app/reports/*/[habitId]/page.tsx`
**Purpose**: Individual habit analytics pages

---

## PHASE 16: OTHER COMPONENTS (2 files)

### 📄 File 89: `app/components/DeleteSelectedButton.tsx`
**Purpose**: Batch delete selected tasks

### 📄 File 90: `app/components/TimerDisplay.tsx`
**Purpose**: Formatted timer display

---

## PHASE 17: STATIC FILES (5 files)

### 📄 Files 91-95: `public/*.svg`
**Purpose**: Static SVG icons (file, globe, next, vercel, window)

### 📄 File 96: `app/favicon.ico`
**Purpose**: Browser tab icon

---

## 📊 COMPLETE FILE TREE

```
task-tracker/
├── 📦 CONFIGURATION
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── middleware.ts          ← Auth gate
│   ├── eslint.config.mjs
│   ├── postcss.config.mjs
│   ├── prisma.config.ts
│   ├── .gitignore
│   └── .npmrc
│
├── 🗄️ DATABASE (prisma/)
│   ├── schema.prisma          ← Data models
│   ├── seed.ts                ← Sample data
│   └── migrations/
│
├── 🖥️ BACKEND (server/)
│   ├── db.ts                  ← Prisma client
│   ├── trpc.ts                ← tRPC setup
│   ├── index.ts               ← Router export
│   ├── routers/
│   │   ├── task.ts            ← Re-export (backward compat)
│   │   ├── task/              ← MODULAR ROUTER
│   │   │   ├── index.ts       ← Main router
│   │   │   ├── schemas.ts     ← Zod schemas
│   │   │   ├── queries.ts     ← Read operations
│   │   │   ├── mutations.ts   ← CRUD operations
│   │   │   ├── statusProcedures.ts  ← Status updates
│   │   │   ├── timerProcedures.ts   ← Timer mgmt
│   │   │   └── selectionProcedures.ts ← Multi-select
│   │   └── _app.ts
│   └── queries/
│       └── tasks.ts           ← DB queries
│
├── 📐 TYPES (types/)
│   └── task.ts                ← TypeScript interfaces
│
├── 🔧 UTILITIES
│   ├── utils/
│   │   ├── trpc.ts            ← Frontend tRPC client
│   │   └── utils.txt
│   └── lib/
│       ├── prisma.ts
│       ├── config/
│       │   └── modeConfig.ts  ← Mode settings
│       └── utils/
│           ├── date.ts        ← Date helpers (2AM)
│           ├── filters.ts     ← Task filtering
│           ├── analytics.ts   ← Stats calculations
│           ├── autoEvaluation.ts
│           ├── status.ts
│           ├── time.ts
│           └── memo.ts
│
├── 🪝 HOOKS (hooks/)
│   ├── useTaskActions.ts      ← CRUD operations
│   ├── useTimerSession.ts     ← Timer logic
│   ├── useTaskSubtasks.ts     ← Subtask state
│   ├── useAddTaskForm.ts      ← Form state
│   ├── useHabitGrid.ts        ← Grid logic
│   ├── useSubtaskModal.ts
│   └── useMultiSelect.ts
│
├── 🌐 FRONTEND (app/)
│   ├── api/trpc/[trpc]/
│   │   └── route.ts           ← API endpoint
│   ├── layout.tsx             ← Root layout
│   ├── providers.tsx          ← Context providers
│   ├── page.tsx               ← Home page
│   ├── loading.tsx
│   ├── globals.css
│   ├── favicon.ico
│   │
│   ├── components/
│   │   ├── Navigation/
│   │   │   ├── MainTabs.tsx
│   │   │   └── SubTabs.tsx
│   │   │
│   │   ├── TaskList/
│   │   │   └── TaskListContainer.tsx
│   │   │
│   │   ├── TaskCard.tsx       ← Main card
│   │   ├── TaskCardSkeleton.tsx
│   │   ├── TasksListServer.tsx (unused)
│   │   ├── TasksListServerRSC.tsx (unused)
│   │   │
│   │   ├── tasks/
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ProgressIndicator.tsx
│   │   │   ├── ProgressBoxes.tsx
│   │   │   ├── TaskTimer.tsx
│   │   │   ├── SubtaskList.tsx
│   │   │   ├── AddSubtask.tsx
│   │   │   ├── SubtaskModalList.tsx
│   │   │   ├── SubtaskPlanningSection.tsx
│   │   │   ├── TaskHeader.tsx
│   │   │   ├── HabitDayBox.tsx
│   │   │   └── HabitLegend.tsx
│   │   │
│   │   ├── add-task/
│   │   │   ├── AddTaskHeader.tsx
│   │   │   ├── ModeHeader.tsx
│   │   │   ├── TaskDetails.tsx
│   │   │   ├── ScheduleSection.tsx
│   │   │   ├── AdditionalInfo.tsx
│   │   │   └── styles.ts
│   │   │
│   │   ├── AddTask.tsx
│   │   ├── EditTaskModal.tsx
│   │   ├── AddMissedTimeModal.tsx
│   │   ├── SubtaskModal.tsx
│   │   ├── DeleteSelectedButton.tsx
│   │   ├── TimerDisplay.tsx
│   │   ├── HabitGrid.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── ReportsCategoryBoxes.tsx
│   │   │   ├── ReportsView.tsx
│   │   │   ├── CategoryHabitList.tsx
│   │   │   ├── HabitAnalyticsView.tsx     ← Re-export (backward compat)
│   │   │   └── HabitAnalytics/           ← MODULAR COMPONENTS
│   │   │       ├── index.tsx             ← Main component
│   │   │       ├── HabitAnalyticsHeader.tsx
│   │   │       ├── HabitAnalyticsStats.tsx
│   │   │       ├── HabitAnalyticsTimeTracking.tsx
│   │   │       └── HabitAnalyticsFooter.tsx
│   │   │
│   │   └── analytics/
│   │       ├── AnalyticsCard.tsx
│   │       ├── Heatmap.tsx
│   │       ├── StreakStats.tsx
│   │       ├── PeriodNavigator.tsx
│   │       └── TimeRangeToggle.tsx
│   │
│   └── reports/
│       ├── make-habit/
│       │   ├── page.tsx
│       │   └── [habitId]/page.tsx
│       ├── break-habit/
│       │   ├── page.tsx
│       │   └── [habitId]/page.tsx
│       └── professional/
│           ├── page.tsx
│           └── [habitId]/page.tsx
│
└── 🖼️ STATIC (public/)
    ├── file.svg
    ├── globe.svg
    ├── next.svg
    ├── vercel.svg
    └── window.svg
```

---

## ✅ READING CHECKLIST

Use this checklist as you go through each file:

- [ ] Phase 1: Configuration (10 files)
- [ ] Phase 2: Database (3 files)
- [ ] Phase 3: Backend (6 files)
- [ ] Phase 4: API Route (1 file)
- [ ] Phase 5: Types (1 file)
- [ ] Phase 6: Utilities (10 files)
- [ ] Phase 7: Hooks (7 files)
- [ ] Phase 8: Frontend Entry (4 files)
- [ ] Phase 9: Navigation (2 files)
- [ ] Phase 10: Task List (4 files)
- [ ] Phase 11: Task Sub-components (11 files)
- [ ] Phase 12: Add Task (7 files)
- [ ] Phase 13: Modals (3 files)
- [ ] Phase 14: Habit Grid (1 file)
- [ ] Phase 15: Reports (17 files)
- [ ] Phase 16: Other Components (2 files)
- [ ] Phase 17: Static Files (6 files)

**Total: ~95 files**

---

## 🔑 KEY FILES TO FOCUS ON (Top 15)

If you're short on time, read these files in order:

1. `prisma/schema.prisma` - Data models
2. `server/routers/task/` - Modular API logic (multiple files)
   - `task/index.ts` - Main router
   - `task/queries.ts` - Read operations
   - `task/mutations.ts` - CRUD operations
   - `task/statusProcedures.ts` - Status updates
   - `task/timerProcedures.ts` - Timer management

16. `app/components/reports/HabitAnalytics/` - Modular analytics components (multiple files)
    - `HabitAnalytics/index.tsx` - Main analytics view
    - `HabitAnalytics/HabitAnalyticsHeader.tsx` - Header and navigation
    - `HabitAnalytics/HabitAnalyticsStats.tsx` - Statistics and heatmap
    - `HabitAnalytics/HabitAnalyticsTimeTracking.tsx` - Time visualizations
    - `HabitAnalytics/HabitAnalyticsFooter.tsx` - Additional info
3. `server/trpc.ts` - Auth setup
4. `app/layout.tsx` - App shell
5. `app/providers.tsx` - Context setup
6. `app/page.tsx` - Main page
7. `utils/trpc.ts` - API client
8. `types/task.ts` - Type definitions
9. `hooks/useTaskActions.ts` - CRUD hooks
10. `hooks/useTimerSession.ts` - Timer logic
11. `hooks/useTaskSubtasks.ts` - Subtask logic
12. `app/components/TaskCard.tsx` - Main UI
13. `app/components/TaskList/TaskListContainer.tsx` - List logic
14. `lib/utils/filters.ts` - Filtering logic
15. `lib/config/modeConfig.ts` - Mode configuration
