# Task Tracker - Codebase Roadmap

## 🗺️ How to Navigate This Codebase

This guide will help you understand the architecture and know where to start reading the code.

---

## 📚 Reading Order for New Developers

<!-- ### 1. Start Here: Understanding the Data Model
**File:** `prisma/schema.prisma`  
**Why:** Understand the database structure first - Task, TimeLog, TaskStatus models -->

<!-- ### 2. Type Definitions
**File:** `types/task.ts`  
**Why:** See TypeScript interfaces that match the database schema -->
<!-- 
### 3. Core App Structure
Read in this order:
1. `app/layout.tsx` - Root layout with providers
2. `app/providers.tsx` - TRPC and React Query setup
3. `app/page.tsx` - Main page with SSR and Suspense
4. `app/loading.tsx` - Loading states -->

<!-- ### 4. Server-Side Architecture
1. `server/db.ts` - Prisma client setup
2. `server/trpc.ts` - TRPC initialization
3. `server/index.ts` - Main router
4. `server/routers/task.ts` - All API endpoints ⭐ **CRITICAL**
5. `server/queries/tasks.ts` - Server component queries -->

### 5. Client-Side Data Fetching
1. `utils/trpc.ts` - TRPC React client
2. `app/components/TasksListServerRSC.tsx` - Server component example

### 6. Utilities (Read These Early!)
1. `lib/utils/date.ts` - Date formatting (used everywhere)
2. `lib/utils/status.ts` - Status transitions
3. `lib/utils/time.ts` - Time formatting
4. `lib/utils/memo.ts` - Performance utilities

### 7. Custom Hooks (Business Logic)
Read in this order:
1. `hooks/useAddTaskForm.ts` - Creating tasks
2. `hooks/useTaskActions.ts` - Task mutations
3. `hooks/useTaskTimer.ts` - Timer logic
4. `hooks/useHabitGrid.ts` - Habit grid logic ⭐ **COMPLEX**
5. `hooks/useTaskSubtasks.ts` - Subtask management
6. `hooks/useSubtaskModal.ts` - Modal logic

### 8. Main Components
1. `app/components/AddTask.tsx` - Task creation form
2. `app/components/TaskCard.tsx` - Main task display ⭐ **CRITICAL**
3. `app/components/HabitGrid.tsx` - Habit tracking grid
4. `app/components/SubtaskModal.tsx` - Subtask modal

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   app/       │  │  components/ │  │    hooks/    │      │
│  │   page.tsx   │──│  TaskCard    │──│ useHabitGrid │      │
│  │  (SSR)       │  │  AddTask     │  │ useTaskTimer │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
│                     ┌──────▼──────┐                          │
│                     │  utils/     │                          │
│                     │  trpc.ts    │                          │
│                     │ (TRPC Client)│                         │
│                     └──────┬──────┘                          │
└────────────────────────────┼──────────────────────────────────┘
                             │ HTTP (tRPC)
┌────────────────────────────┼──────────────────────────────────┐
│                     ┌──────▼──────┐                          │
│                     │ app/api/    │                          │
│                     │ trpc/route  │                          │
│                     └──────┬──────┘                          │
│                            │                                  │
│                     ┌──────▼──────┐                          │
│                     │  server/    │                          │
│                     │  index.ts   │                          │
│                     │ (AppRouter) │                          │
│                     └──────┬──────┘                          │
│                            │                                  │
│              ┌─────────────┴─────────────┐                   │
│              │                           │                   │
│       ┌──────▼──────┐           ┌───────▼────────┐          │
│       │  server/    │           │   server/      │          │
│       │  routers/   │           │   queries/     │          │
│       │  task.ts    │           │   tasks.ts     │          │
│       │ (Mutations) │           │  (SSR Queries) │          │
│       └──────┬──────┘           └───────┬────────┘          │
│              │                           │                   │
│              └─────────────┬─────────────┘                   │
│                            │                                  │
│                     ┌──────▼──────┐                          │
│                     │  server/    │                          │
│                     │   db.ts     │                          │
│                     │  (Prisma)   │                          │
│                     └──────┬──────┘                          │
│                            │                                  │
│                     ┌──────▼──────┐                          │
│                     │  DATABASE   │                          │
│                     │   (Neon)    │                          │
│                     └─────────────┘                          │
│                      NEXT.JS SERVER                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Patterns

### Pattern 1: Server-Side Rendering (Initial Load)
```
User visits page
    ↓
app/page.tsx (Server Component)
    ↓
TasksListServerRSC.tsx
    ↓
server/queries/tasks.ts → getCurrentMonthTasks()
    ↓
Prisma → Database
    ↓
HTML rendered on server
    ↓
Sent to browser (fast!)
```

### Pattern 2: Client-Side Mutation (Add Task)
```
User fills form
    ↓
AddTask.tsx → useAddTaskForm hook
    ↓
submit() called
    ↓
trpc.task.addTask.mutate()
    ↓
HTTP request to /api/trpc
    ↓
server/routers/task.ts → addTask procedure
    ↓
Prisma → Database
    ↓
onSuccess: router.refresh()
    ↓
Server re-fetches data
    ↓
UI updates
```

### Pattern 3: Timer Workflow
```
User clicks "Start"
    ↓
TaskCard.tsx → useTaskTimer hook
    ↓
setInterval starts (1 second)
    ↓
localSeconds increments
    ↓
User clicks "Stop"
    ↓
onStop callback with gained seconds
    ↓
trpc.task.updateSeconds.mutate()
    ↓
Creates TimeLog entry in database
    ↓
router.refresh() → UI updates
```

### Pattern 4: Habit Grid Status Toggle
```
User clicks day box
    ↓
HabitGrid.tsx → useHabitGrid hook
    ↓
toggle(day) called
    ↓
If has subtasks: opens SubtaskModal
If no subtasks: cycles status (NONE → FAIL → HALF → SUCCESS)
    ↓
trpc.task.updateStatus.mutate()
    ↓
Updates TaskStatus in database
    ↓
router.refresh() → UI updates
```

---

## 📁 Directory Structure

```
task-tracker/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main page (SSR)
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Client providers
│   ├── loading.tsx               # Loading UI
│   ├── globals.css               # Global styles
│   ├── api/
│   │   └── trpc/[trpc]/route.ts  # TRPC API handler
│   └── components/
│       ├── TaskCard.tsx          # ⭐ Main task component
│       ├── AddTask.tsx           # Task creation form
│       ├── HabitGrid.tsx         # Habit tracking grid
│       ├── SubtaskModal.tsx      # Subtask modal
│       ├── TimerDisplay.tsx      # Timer UI
│       ├── TaskCardSkeleton.tsx  # Loading skeleton
│       ├── TasksListServerRSC.tsx # Server component
│       ├── tasks/                # Task sub-components
│       └── add-task/             # Form sub-components
│
├── hooks/                        # Custom React hooks
│   ├── useTaskActions.ts         # Mutations
│   ├── useAddTaskForm.ts         # Form logic
│   ├── useHabitGrid.ts           # ⭐ Complex grid logic
│   ├── useTaskTimer.ts           # Timer logic
│   ├── useTaskSubtasks.ts        # Subtask management
│   └── useSubtaskModal.ts        # Modal logic
│
├── lib/
│   └── utils/                    # Utility functions
│       ├── date.ts               # ⭐ Date utilities (used everywhere)
│       ├── status.ts             # Status transitions
│       ├── time.ts               # Time formatting
│       └── memo.ts               # Performance utilities
│
├── server/                       # Backend code
│   ├── index.ts                  # Main router
│   ├── trpc.ts                   # TRPC setup
│   ├── db.ts                     # Prisma client
│   ├── routers/
│   │   └── task.ts               # ⭐ All API endpoints
│   └── queries/
│       └── tasks.ts              # Server component queries
│
├── types/
│   └── task.ts                   # TypeScript types
│
├── utils/
│   └── trpc.ts                   # TRPC React client
│
├── prisma/
│   └── schema.prisma             # ⭐ Database schema
│
└── next.config.ts                # Next.js configuration
```

---

## 🎯 Key Concepts

### 1. Server vs Client Components
- **Server Components**: `TasksListServerRSC.tsx` - No "use client", can use `await`
- **Client Components**: `TaskCard.tsx`, `AddTask.tsx` - Have "use client", use hooks

### 2. Data Fetching Strategies
- **Server Components**: Use `server/queries/tasks.ts` directly
- **Client Components**: Use TRPC hooks (`trpc.task.getTasks.useQuery()`)
- **Mutations**: Always use TRPC (`trpc.task.addTask.useMutation()`)

### 3. Revalidation Pattern
- After mutations, call `router.refresh()` to revalidate server components
- This triggers re-fetch of server component data
- UI updates automatically

### 4. Subtask Rollover Logic
- Uncompleted subtasks from previous day carry forward
- Once a day has status, its `dailySubtasks` are "frozen"
- See `hooks/useTaskSubtasks.ts` for implementation

### 5. Memoization for Performance
- `useHabitGrid` uses `useMemo` and `useCallback` extensively
- Converts arrays to Maps for O(1) lookups
- Prevents unnecessary re-renders

---

## 🔍 Common Tasks & Where to Look

| Task | Files to Check |
|------|----------------|
| Add new task field | `prisma/schema.prisma`, `types/task.ts`, `server/routers/task.ts`, `hooks/useAddTaskForm.ts` |
| Change status colors | `lib/utils/status.ts`, `app/components/tasks/HabitDayBox.tsx` |
| Modify timer logic | `hooks/useTaskTimer.ts`, `server/routers/task.ts` (updateSeconds) |
| Add new API endpoint | `server/routers/task.ts` |
| Change date formatting | `lib/utils/date.ts` |
| Modify subtask behavior | `hooks/useTaskSubtasks.ts`, `hooks/useSubtaskModal.ts` |
| Update UI styles | `app/globals.css`, individual component files |
| Change caching strategy | `server/queries/tasks.ts`, `app/providers.tsx` |

---

## 🐛 Debugging Tips

### 1. Check TRPC Mutations
- Open browser DevTools → Network tab
- Look for `/api/trpc` requests
- Check request/response payloads

### 2. Server Component Issues
- Check terminal output (server logs)
- Look for errors during `getTask sForMonth()`

### 3. State Not Updating
- Verify `router.refresh()` is called after mutations
- Check if component is memoized (`React.memo`)
- Look for missing dependencies in `useMemo`/`useCallback`

### 4. Subtask Issues
- Check `dailySubtasks` vs `completedSubtasks` in database
- Verify rollover logic in `useTaskSubtasks.ts`
- Look at `getPrevDayUnfinished` function

---

## 📝 Code Conventions

### File Naming
- Components: PascalCase (`TaskCard.tsx`)
- Hooks: camelCase with `use` prefix (`useTaskTimer.ts`)
- Utilities: camelCase (`date.ts`)
- Types: camelCase (`task.ts`)

### Import Order
1. External packages (react, next, etc.)
2. Internal utilities (@/utils, @/lib)
3. Types (@/types)
4. Components (@/components)
5. Hooks (@/hooks)
6. Styles

### Component Structure
```typescript
"use client"; // If client component

// Imports
import { ... } from "...";

// Types (if needed)
type Props = { ... };

// Component
export default function Component({ props }: Props) {
  // Hooks
  // Event handlers
  // Render
}

// Documentation comment at end
/**
 * FILE: ...
 * PURPOSE: ...
 * ...
 */
```

---

## 🚀 Quick Start Checklist

- [ ] Read `prisma/schema.prisma` to understand data model
- [ ] Read `types/task.ts` for TypeScript types
- [ ] Understand `server/routers/task.ts` API endpoints
- [ ] Review `lib/utils/date.ts` and `lib/utils/status.ts`
- [ ] Study `hooks/useHabitGrid.ts` for complex logic example
- [ ] Look at `app/components/TaskCard.tsx` for component structure
- [ ] Trace a mutation from UI → Hook → TRPC → Database

---

## 📚 Additional Resources

- **Next.js 16 Docs**: https://nextjs.org/docs
- **TRPC Docs**: https://trpc.io/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **React Query Docs**: https://tanstack.com/query/latest

---

## 🎓 Learning Path

### Beginner
1. Understand the database schema
2. Learn how TRPC connects client to server
3. Study one simple hook (useTaskTimer)
4. Modify a simple component (TimerDisplay)

### Intermediate
1. Add a new field to tasks
2. Create a new API endpoint
3. Implement a new hook
4. Optimize a component with memoization

### Advanced
1. Implement a new feature end-to-end
2. Optimize database queries
3. Add caching strategy
4. Implement real-time updates

---

**Last Updated**: 2025-12-12  
**Codebase Version**: Next.js 16 with TRPC and Prisma
