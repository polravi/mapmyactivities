# MapMyActivities — Implementation Plan

## Context

Build a full-stack productivity app for managing daily activities with goal tracking (daily/weekly/monthly/yearly), Eisenhower Matrix prioritization with AI suggestions, and a mobile voice assistant that converts speech to action items. The app needs offline-first local storage synced to a cloud backend, with both mobile and web clients. This is intended for public launch.

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo) + Expo Router |
| Web | Next.js (App Router) |
| Backend | Firebase (Firestore, Cloud Functions, Auth) |
| Auth | Email + Google + Apple Sign-In |
| Local DB | WatermelonDB (SQLite-based, offline-first) |
| Voice STT | @react-native-voice/voice (on-device) + Deepgram (premium) |
| AI/NLP | Claude API (quadrant suggestion + voice transcript parsing) |
| State | Zustand (shared store package) |
| Styling | Tailwind (web) + NativeWind (mobile) |
| Monorepo | Turborepo + pnpm |

## Monorepo Structure

```
MapMyActivities/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .github/workflows/
├── apps/
│   ├── mobile/          # Expo React Native
│   ├── web/             # Next.js App Router
│   └── functions/       # Firebase Cloud Functions
├── specs/features/      # Gherkin BDD specs
└── packages/
    ├── types/           # Shared Zod schemas + TS types
    ├── utils/           # Shared utilities
    ├── api-client/      # Shared API client
    ├── store/           # Shared Zustand stores
    ├── ui/              # Shared UI components
    └── config/          # Shared eslint, tsconfig, prettier
```

## Data Model

### Firestore Collections

- `/users/{userId}` — Profile, preferences, subscription tier
- `/users/{userId}/tasks/{taskId}` — Core task document with title, description, status, eisenhowerQuadrant, aiSuggestedQuadrant, goalType, goalId, dueDate, recurrence, voiceSource, priority, tags, sortOrder, timestamps
- `/users/{userId}/goals/{goalId}` — Goal grouping with title, timeframe, period dates, target/completed counts

## Sync Architecture

- Mobile: WatermelonDB ←→ Cloud Functions (pull/push) ←→ Firestore
- Web: Zustand store ←→ Firestore onSnapshot() (direct, real-time)
- Conflict Resolution: Last-Write-Wins with field-level merge
- Exceptions: eisenhowerQuadrant (client wins), status (no regression)

## Phased Implementation

### Phase 1: Foundation
- Monorepo scaffold, shared packages, Firebase Auth, app shells, CI

### Phase 2: Core Task CRUD + Local DB
- WatermelonDB, task CRUD on both platforms, offline support

### Phase 3: Firestore Sync
- syncPull/syncPush Cloud Functions, conflict resolution, real-time listeners

### Phase 4: Goals System
- Goals CRUD, goal-task linking, scheduled functions, timeframe views

### Phase 5: Eisenhower Matrix UI
- 2x2 grid, drag-and-drop, Q4 discard flow

### Phase 6: AI Quadrant Suggestion
- suggestQuadrant Cloud Function, Claude API, rate limiting

### Phase 7: Voice Assistant
- STT integration, voice pipeline, confirmation UI

### Phase 8: Polish & Launch
- Onboarding, analytics, subscriptions, accessibility, performance

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Zustand | Simpler than Redux, works across RN + Next.js |
| Navigation | Expo Router / Next.js App Router | File-based routing |
| Styling | Tailwind + NativeWind | Shared design tokens |
| Web data access | Firestore direct | Less latency, real-time |
| ID generation | Client-side UUID | Enables offline creation |
| Recurrence | Server-side scheduled function | Consistency across devices |
| Testing | Vitest + RTL + Playwright + Maestro | BDD-first approach |
