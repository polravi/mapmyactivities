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

### Testing
- BDD-first: Gherkin specs in `specs/features/` written before implementation
- Minimum 80% coverage on shared packages
- 100% coverage on sync logic and conflict resolution
- Every Gherkin scenario maps to at least one automated test
- Unit tests: Vitest
- Component tests: React Testing Library / React Native Testing Library
- E2E: Playwright (web), Maestro (mobile)

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
