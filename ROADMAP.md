# Task Tracker - Project Roadmap & Architecture Guide

## 🗺️ Navigation Guide

This document provides a comprehensive overview of the Task Tracker codebase, helping you understand how the project is structured, how data flows, and where to find key logic.

---

## 📚 Reading Order for New Developers

To get up to speed quickly, we recommend reading the files in this specific order:

### 1. The Data Foundation 🏗️
Start here to understand what we are actually tracking.
- **`prisma/schema.prisma`**: The single source of truth for our data model. Key models: `Task`, `TimeLog`, `TaskStatus`, `TimerSession`. Note usage of `env("DATABASE_URL")` in `prisma.config.ts`.
- **`types/task.ts`**: TypeScript interfaces that mirror and extend the database schema for the frontend.

### 2. The Core Application Entry 🚪
- **`app/layout.tsx`**: The root layout wrapping the app with Providers (Clerk, TRPC).
- **`app/page.tsx`**: The main entry point. Notice how it uses `Suspense` and server components.
- **`server/routers/task.ts`**: The backend brain. This contains all `trpc` procedures (API endpoints) for tasks, timers, and habits.

### 3. Key UI Components 🖼️
- **`app/components/TaskCard.tsx`**: The most complex component. Handles display, timer logic, subtasks, and progress updates.
- **`app/components/HabitGrid.tsx`**: Visualizes habit progress over time.
- **`app/components/EditTaskModal.tsx`**: Logic for updating existing tasks.
- **`app/components/SubtaskModal.tsx`**: Handles daily subtask management.

### 4. Critical Business Logic (Hooks) 🧠
- **`hooks/useTaskTimer.ts`**: Logic for the stopwatch functionality.
- **`hooks/useHabitGrid.ts`**: Complex logic for mapping daily statuses to the grid.
- **`hooks/useTaskSubtasks.ts`**: Handles the "rollover" logic for uncompleted subtasks.
- **`hooks/useMultiSelect.ts`**: Manages selection state for bulk actions.

---

## 🏗️ Architecture Overview

The project follows a modern **T3 Stack-like** architecture (Next.js + tRPC + Prisma + Tailwind).

### High-Level Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon) accessed via Prisma ORM
- **API Layer**: tRPC (Type-safe APIs)
- **Styling**: Tailwind CSS 4
- **Auth**: Clerk

### 🔄 Data Flow Patterns

#### 1. Server-Side Rendering (Initial Fetch)
**Flow**: `Page` → `Server Component` → `Server Query` → `Prisma` → `DB`
- The `app/page.tsx` uses **Server Components** (like `TasksListServerRSC`) to fetch data directly from the DB using helper functions in `server/queries/`.
- **Benefit**: Fast initial load, SEO friendly.

#### 2. Client-Side Interactions (Mutations)
**Flow**: `UI Component` → `Custom Hook` → `tRPC Client` → `API Route` → `Server Router` → `Prisma` → `DB`
- Example: Clicking "Start Timer" triggers `useTaskTimer`, which calls `trpc.task.updateSeconds.mutate()`.
- **Benefit**: Type safety from frontend to backend.

#### 3. Real-Time-ish Updates
- After a mutation (e.g., adding a task), we use `router.refresh()` to re-run Server Components and fetch the latest data without a full page reload.

---

## 📂 Directory Structure Explained

```
task-tracker/
├── app/                        # Next.js App Router (Pages & Layouts)
│   ├── api/trpc/               # tRPC API Route Handler
│   ├── components/             # React Components
│   │   ├── tasks/              # Small styling components (Badges, etc.)
│   │   ├── reports/            # Analytics/Report components
│   │   └── ...
│   ├── reports/                # Reports Page Route
│   └── ...
├── hooks/                      # Custom React Hooks (Business Logic)
├── lib/
│   └── utils/                  # Helper functions (Date formatting, Status logic)
├── prisma/                     # Database Schema & Migrations
│   ├── migrations/             # SQL Migration history
│   └── schema.prisma           # Data Model Definition
├── server/                     # Backend Logic
│   ├── routers/                # tRPC Routers (API Endpoints)
│   ├── queries/                # Direct DB queries for Server Components
│   └── ...
├── types/                      # Shared TypeScript Interfaces
└── ...
```

---

## 🧩 Key Features & Implementation Details

### 1. Smart Progress Boxes (`HabitGrid`, `StatusBadge`)
- **Concept**: A 4-level progress system (None -> Fail -> Half -> Success).
- **Implementation**: Stored as `progressLevel` in `TaskStatus`. Use `lib/utils/status.ts` for transition logic.

### 2. Time Tracking (`useTaskTimer`)
- **Concept**: Track time spent on tasks vs estimated time.
- **Implementation**: `TimeLog` model stores seconds per day. The frontend uses a local interval for smooth UI, syncing with the server on stop/pause.

### 3. Subtask Management (`useTaskSubtasks`)
- **Concept**: Daily subtasks with rollover.
- **Implementation**:
    - `completedSubtasks`: Array of strings for *today*.
    - `dailySubtasks`: Snapshot of *all* subtasks for that day (freezes history).
    - **Rollover**: Logic checks previous day's uncompleted items and adds them to today's list.

### 4. "Smart" Month View
- **Concept**: Filter tasks by category types (Task, Make Habit, Break Habit, Professional).
- **Implementation**: `server/queries/tasks.ts` filters based on the `tab` query param.

---

## 🛠️ Common Tasks

### How to add a new field to Task?
1. Edit `prisma/schema.prisma` to add the field.
2. Run `npx prisma migrate dev` to update DB and generic client.
3. Update `types/task.ts` to reflect the change.
4. Update `server/routers/task.ts` (create/update procedures).
5. Add the input field in `app/components/AddTask.tsx` or `EditTaskModal.tsx`.

### How to debug a database issue?
- Check `server/db.ts` for connection logic.
- Ensure `.env` has the correct `DATABASE_URL`.
- Use `npx prisma studio` to visually inspect data.

---

**Last Updated**: 2025-12-15 
**Version**: Next.js 16 + Prisma 7
