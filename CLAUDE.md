# MapMyActivities — Project Conventions

## Tech Stack
- **Monorepo**: Turborepo + pnpm workspaces
- **Mobile**: React Native (Expo SDK 52) + Expo Router v4
- **Web**: Next.js 15 (App Router)
- **Backend**: Firebase (Firestore, Cloud Functions v2, Auth)
- **Auth**: Email + Google + Apple Sign-In
- **Local DB**: WatermelonDB (mobile offline-first)
- **AI/NLP**: Claude API (Anthropic) for quadrant suggestions + voice parsing
- **Voice STT**: @react-native-voice/voice (on-device) + Deepgram (premium)
- **State**: Zustand (shared store package)
- **Styling**: Tailwind CSS (web) + NativeWind (mobile)
- **Testing**: Vitest + React Testing Library + Playwright (web E2E) + Maestro (mobile E2E)
- **Validation**: Zod schemas (single source of truth in packages/types)

## Development Guidelines

### Code Style
- TypeScript strict mode everywhere
- Functional components only (no class components)
- Named exports preferred over default exports
- Use `type` imports for type-only imports
- Zod schemas define types — never duplicate type definitions manually

### File Naming
- Components: PascalCase (e.g., `TaskCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useVoiceCapture.ts`)
- Utilities: camelCase (e.g., `dateUtils.ts`)
- Test files: `*.test.ts` or `*.test.tsx` colocated in `__tests__/` directories

### Package Structure
- `packages/types/` — Zod schemas + exported TS types (single source of truth)
- `packages/utils/` — Pure utility functions, no side effects
- `packages/store/` — Zustand stores, shared across mobile + web
- `packages/ui/` — Shared UI components (NativeWind compatible)
- `packages/api-client/` — API client for Cloud Functions
- `packages/config/` — Shared ESLint, TSConfig, Prettier configs

### SOLID Principles — enforced on every implementation
- **S — Single Responsibility**: Every function, hook, component, and Cloud Function does exactly one thing. Split if a unit handles multiple concerns.
- **O — Open/Closed**: Extend behaviour via new functions/components, not by modifying existing stable ones. Use composition over mutation.
- **L — Liskov Substitution**: Subtypes and overrides must honour the contract of what they replace. No silent behavioural surprises.
- **I — Interface Segregation**: Prefer small, focused prop interfaces and Zod schemas. Never pass a large object when only one field is needed.
- **D — Dependency Inversion**: Business logic must not depend on concrete implementations (Firestore, Firebase Auth). Depend on abstractions — pass service functions as arguments or use hooks as the boundary.

### DRY — Don't Repeat Yourself
- If the same logic appears in more than one place, extract it into `packages/utils/` (pure logic) or a shared hook.
- Never duplicate Zod schemas or TypeScript types — derive variants with `.extend()`, `.pick()`, `.omit()`, or `.partial()`.
- Reuse shared UI components from `packages/ui/` before creating new ones.

### Unit Tests — mandatory for every new function
- **Every new function, utility, hook, or Cloud Function method must have a corresponding unit test** written in the same PR/commit.
- Test file location mirrors source:
  - `packages/utils/src/foo.ts` → `packages/utils/__tests__/foo.test.ts`
  - `packages/store/src/fooStore.ts` → `packages/store/__tests__/fooStore.test.ts`
  - `apps/functions/src/bar/baz.ts` → `apps/functions/__tests__/bar/baz.test.ts`
- Tests must cover: happy path, edge cases, and error/failure cases.
- Use `describe` blocks named after the function, `it` blocks named after the scenario.
- Mock external dependencies (Firestore, Firebase Auth, Claude API) — unit tests must not hit the network.
- Run tests with `pnpm test` before every commit. Never commit with failing tests.

### Testing
- BDD-first: Gherkin specs in `specs/features/` written before implementation
- Minimum 80% coverage on shared packages
- 100% coverage on sync logic and conflict resolution
- Every Gherkin scenario maps to at least one automated test
- Unit tests: Vitest
- Component tests: React Testing Library / React Native Testing Library
- E2E: Playwright (web), Maestro (mobile)

### Testing Protocol — "test the app" means this exact sequence
When asked to test the app (or any feature), always run in this order and stop if any step fails:

1. **Unit tests** — `pnpm test` (Vitest across all packages and functions)
   - All tests must pass before proceeding
   - Fix any failures before moving to the next step

2. **Type check** — `pnpm typecheck` (tsc --noEmit across all packages)
   - No type errors allowed

3. **Build** — `pnpm build`
   - Confirms the production build is not broken

4. **UI / E2E** — open the browser and manually verify the affected user flows
   - Confirm the feature works end-to-end in the local emulator environment
   - For automated E2E: `pnpm --filter @mma/web exec playwright test` (web)

Never skip steps or reorder them. A passing UI does not mean the code is correct if unit tests are failing.

### Git & CI
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- CI runs lint + typecheck + test on every PR
- Deploy web via Vercel, functions via Firebase CLI

### Architecture Principles
- Offline-first on mobile (WatermelonDB)
- Web uses Firestore direct with onSnapshot for real-time
- Client-side UUID generation for offline creation
- Last-write-wins with field-level merge for sync conflicts
- Rate limiting on AI endpoints per user tier
