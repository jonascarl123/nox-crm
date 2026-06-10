# Enerflo MVP — Static Front-End Prototype

A fully navigable, demo-ready clone of an Enerflo-style residential solar operations
platform. **Front-end only** — no backend, no real auth, no API calls. All data is
hardcoded mock data and mutated in-memory for the duration of a session.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS v4**.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. You start logged in as a hardcoded **ADMIN** user.

> Note: if `npm run dev` errors on `uv_interface_addresses` in a restricted/sandboxed
> shell, run it in a normal terminal — that's an environment restriction, not a code issue.

## What's inside

| Route | Screen |
|-------|--------|
| `/deals` | Deal pipeline — kanban (by stage) + table view, filters by rep/stage |
| `/deals/new` | Create New Deal — form + Google Maps embed |
| `/deals/[id]` | Deal workflow — left stepper + per-step panels (hero) |
| `/customers` | Customer list — searchable, create modal |
| `/customers/[id]` | Customer detail — deals, documents, tasks, activity |
| `/installs` | Install Tracker — install cards with milestone progress |
| `/installs/[id]` | Install detail — milestone pipeline (hero) |
| `/tasks` | My Tasks — open/completed, overdue flags, create modal |
| `/settings` | Users + Offices tabs |

### Deal workflow steps
Consumption → Design → Proposal → Financing → Contracting → Project Submission.
Completing a step marks it done and activates the next. Submitting a project spawns
an install with default milestones.

## Editing mock data

Everything lives in [`lib/mock-data.ts`](lib/mock-data.ts) — customers, deals,
installs, tasks, users, offices. The in-memory store that powers mutations is in
[`lib/store.tsx`](lib/store.tsx); mock auth is in [`lib/auth.tsx`](lib/auth.tsx).

Seeded with: 3 customers, 5 deals (one fully filled across every step), 3 installs,
5 tasks (mix of open/overdue/done), 3 users (ADMIN/REP/OPS).

## Structure

```
app/            route segments (deals, customers, installs, tasks, settings)
components/
  shell/        Sidebar, TopBar, AppShell
  ui/           StatusBadge, Modal, Button, Card, Field
  deals/        DealCard, StepperNav, steps/* panels
  installs/     MilestoneTracker
lib/            mock-data, store, auth, format helpers
```

All state is in-memory and resets on page reload — intended for stakeholder demos.
