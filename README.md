# MapMyActivities

A full-stack productivity app for managing daily activities with goal tracking (daily/weekly/monthly/yearly), Eisenhower Matrix prioritization with AI suggestions, and a mobile voice assistant that converts speech to action items.

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo SDK 52) + Expo Router v4 |
| Web | Next.js 15 (App Router) |
| Backend | Firebase (Firestore, Cloud Functions v2, Auth) |
| Auth | Email + Google + Apple Sign-In |
| Local DB | WatermelonDB (SQLite-based, offline-first) |
| Voice STT | `@react-native-voice/voice` (on-device) + Deepgram (premium) |
| AI/NLP | Claude API (quadrant suggestion + voice transcript parsing) |
| State | Zustand (shared store package) |
| Styling | Tailwind CSS (web) + NativeWind (mobile) |
| Monorepo | Turborepo + pnpm |

## Project Structure

```
MapMyActivities/
├── apps/
│   ├── mobile/          # Expo React Native app
│   ├── web/             # Next.js web app
│   └── functions/       # Firebase Cloud Functions
├── packages/
│   ├── types/           # Shared Zod schemas + TypeScript types
│   ├── utils/           # Shared utility functions
│   ├── store/           # Shared Zustand stores
│   ├── ui/              # Shared UI components (NativeWind)
│   ├── api-client/      # Shared API client for Cloud Functions
│   └── config/          # Shared ESLint, TSConfig, Prettier configs
├── specs/features/      # Gherkin BDD specs (phase-1 through phase-8)
└── docs/
    ├── architecture/    # Mermaid architecture diagrams
    └── wireframes/      # Interactive HTML wireframes
```

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Install |
|---|---|---|
| Node.js | >= 20.0.0 | [nodejs.org](https://nodejs.org/) or `brew install node` |
| pnpm | >= 9.0.0 | `npm install -g pnpm@9` |
| Firebase CLI | latest | `npm install -g firebase-tools` |
| Expo CLI | latest | Comes with `npx expo` (no global install needed) |
| Xcode | 15+ | Mac App Store (iOS development only) |
| Android Studio | latest | [developer.android.com](https://developer.android.com/studio) (Android only) |
| Java JDK | 17 | Required by Android Studio |

---

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url> MapMyActivities
cd MapMyActivities

# Install all dependencies across the monorepo
pnpm install
```

This installs dependencies for all workspaces: `apps/mobile`, `apps/web`, `apps/functions`, and all `packages/*`.

---

## Step 2: Firebase Project Setup

### 2.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and name it `mapmyactivities` (or your preferred name)
3. Enable Google Analytics if desired, then click **Create project**

### 2.2 Enable Authentication Providers

1. In Firebase Console, go to **Authentication > Sign-in method**
2. Enable these providers:
   - **Email/Password** — Toggle on
   - **Google** — Toggle on, configure OAuth consent screen
   - **Apple** — Toggle on (requires Apple Developer account, see [Apple Sign-In setup](https://firebase.google.com/docs/auth/ios/apple))

### 2.3 Create Firestore Database

1. Go to **Firestore Database > Create database**
2. Choose **Start in test mode** (we'll add security rules later)
3. Select a Cloud Firestore location closest to your users

### 2.4 Add Firebase Apps

**For Web:**
1. In Firebase Console, click **Project Settings > General > Add app > Web**
2. Register with nickname `mapmyactivities-web`
3. Copy the Firebase config values

**For Mobile (iOS):**
1. Click **Add app > iOS**
2. Bundle ID: `com.mapmyactivities.app`
3. Download `GoogleService-Info.plist` and place it in `apps/mobile/`

**For Mobile (Android):**
1. Click **Add app > Android**
2. Package name: `com.mapmyactivities.app`
3. Download `google-services.json` and place it in `apps/mobile/android/app/`

### 2.5 Set Up Cloud Functions Secrets

```bash
# Login to Firebase
firebase login

# Set the project
firebase use <your-project-id>

# Set the Anthropic API key as a secret
firebase functions:secrets:set ANTHROPIC_API_KEY
# Paste your Claude API key when prompted
```

---

## Step 3: Environment Variables

### 3.1 Web App Environment

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3.2 Mobile App Environment

Create `apps/mobile/.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3.3 Functions Environment

Create `apps/functions/.env`:

```env
ANTHROPIC_API_KEY=your-claude-api-key
```

> **Note:** In production, the Anthropic API key is managed via Firebase secrets (set in Step 2.5). The `.env` file is only for local emulator testing.

---

## Step 4: Running the Development Servers

### 4.1 Run Everything at Once

```bash
# From the project root
pnpm dev
```

This starts all apps in parallel via Turborepo:
- Web: http://localhost:3000
- Mobile: Expo dev server (scan QR code with Expo Go)
- Functions: Watch mode (rebuilds on changes)

### 4.2 Run Individual Apps

```bash
# Web only
pnpm dev:web

# Mobile only
pnpm dev:mobile

# Functions only (watch mode)
pnpm dev:functions
```

### 4.3 Run the Web App

```bash
cd apps/web
pnpm dev
```

Open http://localhost:3000 in your browser. You'll see the login page.

### 4.4 Run the Mobile App

```bash
cd apps/mobile
npx expo start
```

This starts the Expo development server. You have several options:
- **Expo Go**: Scan the QR code with the Expo Go app on your phone
- **iOS Simulator**: Press `i` in the terminal (requires Xcode)
- **Android Emulator**: Press `a` in the terminal (requires Android Studio)

> **Note:** Some native features (Apple Sign-In, voice recognition) require a development build. See [Development Builds](#development-builds) below.

### 4.5 Run Firebase Emulators (Local Backend)

For local development without hitting production Firebase:

```bash
# Install Java if you haven't (required by emulators)
brew install openjdk@17

# Start the emulators
firebase emulators:start
```

This starts local emulators for:
- Auth: http://localhost:9099
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Emulator UI: http://localhost:4000

---

## Step 5: Build for Production

### 5.1 Build Shared Packages

```bash
# Build all packages and apps
pnpm build
```

### 5.2 Build the Web App

```bash
cd apps/web
pnpm build
pnpm start  # Start production server on port 3000
```

### 5.3 Deploy Cloud Functions

```bash
cd apps/functions
pnpm build
firebase deploy --only functions
```

### 5.4 Deploy Web to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# From the project root
cd apps/web
vercel --prod
```

Or connect the repo to Vercel for automatic deploys on push to `main`.

---

## Step 6: Mobile Development Builds

Expo Go doesn't support all native modules (Firebase, Voice). For full functionality, create a development build:

### 6.1 Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 6.2 Configure EAS

Create `apps/mobile/eas.json`:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### 6.3 Build and Install

```bash
cd apps/mobile

# iOS Simulator build
eas build --platform ios --profile development

# Android APK
eas build --platform android --profile development
```

Once built, install on your device/simulator and run:

```bash
npx expo start --dev-client
```

---

## Step 7: Running Tests

### 7.1 Run All Tests

```bash
# From the project root
pnpm test
```

### 7.2 Run Tests with Coverage

```bash
pnpm test:coverage
```

### 7.3 Run Tests for a Specific Package

```bash
# Types package
cd packages/types && pnpm test

# Utils package
cd packages/utils && pnpm test

# Cloud Functions
cd apps/functions && pnpm test

# Web app
cd apps/web && pnpm test
```

### 7.4 Run Tests in Watch Mode

```bash
cd packages/utils
pnpm test:watch
```

### 7.5 Run Web E2E Tests (Playwright)

```bash
cd apps/web

# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
pnpm test:e2e
```

### 7.6 Run Mobile E2E Tests (Maestro)

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run mobile E2E tests (requires a running simulator/device)
cd apps/mobile
maestro test e2e/
```

---

## Step 8: Linting and Type Checking

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck

# Format all files with Prettier
pnpm format
```

---

## Viewing Wireframes

Open the interactive wireframes in your browser:

```bash
open docs/wireframes/index.html
```

Use the **Mobile/Web** toggle at the top to switch between device views. Click screen names in the sidebar to navigate.

---

## Viewing Architecture Diagrams

The architecture docs use Mermaid diagrams. View them with any Mermaid-compatible viewer:

- **GitHub**: Renders Mermaid blocks automatically when you push
- **VS Code**: Install the [Mermaid Preview](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension
- **Browser**: Copy the Mermaid code to [mermaid.live](https://mermaid.live/)

Available diagrams in `docs/architecture/`:

| File | Contents |
|---|---|
| `system-overview.md` | C4-style system context diagram |
| `data-flow.md` | CRUD and sync data flow |
| `sync-architecture.md` | Pull/push sync with conflict resolution |
| `auth-flow.md` | Auth sequences for all providers |
| `voice-pipeline.md` | Mic to saved task pipeline |
| `eisenhower-ai.md` | AI quadrant suggestion flow |
| `deployment.md` | CI/CD and deployment architecture |

---

## BDD Specs

Gherkin feature files are in `specs/features/`, organized by implementation phase:

| Phase | Features |
|---|---|
| `phase-1/` | Email auth, social auth, user initialization |
| `phase-2/` | Task create, task list, offline tasks |
| `phase-3/` | Cross-platform sync, conflict resolution |
| `phase-4/` | Goals CRUD, timeframe views, recurring tasks |
| `phase-5/` | Matrix view, drag-and-drop, Q4 discard |
| `phase-6/` | AI quadrant suggestion, rate limiting |
| `phase-7/` | Voice capture, voice error handling |
| `phase-8/` | Onboarding, subscriptions, accessibility |

---

## Common Issues

### `pnpm install` fails with peer dependency errors
```bash
pnpm install --no-strict-peer-dependencies
```

### Firebase emulators won't start
Make sure Java 17+ is installed:
```bash
java --version
# If not installed:
brew install openjdk@17
```

### Mobile build fails with native module errors
Native modules like `@react-native-firebase` and `@react-native-voice` require a development build, not Expo Go:
```bash
cd apps/mobile
eas build --platform ios --profile development
```

### TypeScript errors across packages
Make sure shared packages are built first:
```bash
pnpm build
```

### Port 3000 already in use
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9
# Or run on a different port
cd apps/web && next dev -p 3001
```

---

## Scripts Reference

| Command | Description |
|---|---|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start all apps in development mode |
| `pnpm dev:web` | Start web app only |
| `pnpm dev:mobile` | Start mobile app only |
| `pnpm dev:functions` | Start functions in watch mode |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm test:coverage` | Run tests with coverage reports |
| `pnpm lint` | Lint all source files |
| `pnpm typecheck` | Type check all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Remove all build artifacts and node_modules |

---

## License

Private project. All rights reserved.
