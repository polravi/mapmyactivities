# Deployment Architecture

This document describes the deployment infrastructure for MapMyActivities, covering web hosting, serverless functions, mobile app builds, environment management, and CI/CD pipelines.

## Deployment Overview

```mermaid
flowchart TB
    subgraph "Source Control"
        GH["GitHub Repository<br/>mapmy-activities/monorepo"]
        Main["main branch"]
        Staging["staging branch"]
        Feature["feature/* branches"]
    end

    subgraph "CI / CD"
        GHA["GitHub Actions"]
        PR["PR Checks<br/>(lint, typecheck, test)"]
        StagingDeploy["Staging Deploy"]
        ProdDeploy["Production Deploy"]
    end

    subgraph "Web Hosting"
        Vercel["Vercel<br/>(Next.js)"]
        Preview["Preview Deployments<br/>(per PR)"]
        StagingWeb["Staging<br/>staging.mapmyactivities.com"]
        ProdWeb["Production<br/>mapmyactivities.com"]
    end

    subgraph "Firebase"
        FBDev["Firebase Dev Project<br/>mma-dev"]
        FBStaging["Firebase Staging Project<br/>mma-staging"]
        FBProd["Firebase Prod Project<br/>mma-prod"]
    end

    subgraph "Mobile"
        EAS["Expo EAS Build"]
        EASSubmit["EAS Submit"]
        TestFlight["Apple TestFlight"]
        PlayBeta["Google Play<br/>Internal Testing"]
        AppStore["Apple App Store"]
        PlayStore["Google Play Store"]
    end

    Feature -->|"push"| PR
    PR -->|"all checks pass"| GH
    Feature -->|"merge to staging"| Staging
    Staging -->|"auto-deploy"| StagingDeploy
    Staging -->|"merge to main"| Main
    Main -->|"auto-deploy"| ProdDeploy

    GHA --> PR
    StagingDeploy --> StagingWeb
    StagingDeploy --> FBStaging
    ProdDeploy --> ProdWeb
    ProdDeploy --> FBProd

    Feature -->|"push"| Preview
    Vercel --> Preview
    Vercel --> StagingWeb
    Vercel --> ProdWeb

    ProdDeploy -->|"manual trigger"| EAS
    EAS --> TestFlight
    EAS --> PlayBeta
    TestFlight -->|"approve"| AppStore
    PlayBeta -->|"promote"| PlayStore
```

## Web Deployment — Vercel (Next.js)

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant Vercel as Vercel
    participant Edge as Vercel Edge Network

    Note over Dev,Edge: Preview Deployment (per PR)
    Dev->>GH: Push to feature branch / Open PR
    GH->>Vercel: Webhook: push event
    Vercel->>Vercel: Install dependencies (pnpm install)
    Vercel->>Vercel: Build Next.js (next build)
    Vercel->>Vercel: Run build checks
    Vercel->>Edge: Deploy to preview URL
    Edge-->>GH: Comment on PR with preview URL
    Note over Edge: URL: mma-pr-123.vercel.app

    Note over Dev,Edge: Production Deployment
    Dev->>GH: Merge PR to main
    GH->>Vercel: Webhook: push to main
    Vercel->>Vercel: Build Next.js (production)
    Vercel->>Edge: Atomic deployment swap
    Note over Edge: URL: mapmyactivities.com
    Edge-->>Edge: Instant rollback available<br/>if errors detected
```

## Firebase Functions Deployment

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant GHA as GitHub Actions
    participant FB as Firebase CLI
    participant CF as Cloud Functions

    Dev->>GH: Merge to main (or staging)

    GHA->>GHA: Trigger: deploy-functions.yml
    GHA->>GHA: Checkout code
    GHA->>GHA: Setup Node.js 20
    GHA->>GHA: pnpm install (functions/)
    GHA->>GHA: pnpm run build (TypeScript compile)
    GHA->>GHA: pnpm run test (unit tests)

    alt Staging branch
        GHA->>FB: firebase use mma-staging
        GHA->>FB: firebase deploy --only functions
        FB->>CF: Deploy to staging project
    else Main branch
        GHA->>FB: firebase use mma-prod
        GHA->>FB: firebase deploy --only functions
        FB->>CF: Deploy to production project
    end

    CF-->>GHA: Deployment success
    GHA-->>GH: Update commit status: success
```

## Mobile Build and Release — Expo EAS

```mermaid
flowchart TB
    subgraph "Build Phase"
        Trigger["Manual trigger or<br/>GitHub Actions workflow"]
        EASBuild["eas build"]
        IOSBuild["iOS Build<br/>(Xcode Cloud / EAS)"]
        AndroidBuild["Android Build<br/>(EAS)"]
        IOSArtifact["iOS .ipa"]
        AndroidArtifact["Android .aab"]
    end

    subgraph "Testing Phase"
        EASSubmitTest["eas submit"]
        TestFlight["Apple TestFlight"]
        PlayInternal["Google Play<br/>Internal Testing"]
        QA["QA Team Testing"]
    end

    subgraph "Release Phase"
        AppStore["Apple App Store<br/>Review + Release"]
        PlayStore["Google Play Store<br/>Review + Release"]
    end

    subgraph "OTA Updates"
        EASUpdate["eas update"]
        ExpoChannel["Update Channel<br/>(staging / production)"]
        OTA["JS Bundle OTA<br/>(no store review needed)"]
    end

    Trigger --> EASBuild
    EASBuild --> IOSBuild
    EASBuild --> AndroidBuild
    IOSBuild --> IOSArtifact
    AndroidBuild --> AndroidArtifact

    IOSArtifact --> EASSubmitTest
    AndroidArtifact --> EASSubmitTest
    EASSubmitTest --> TestFlight
    EASSubmitTest --> PlayInternal
    TestFlight --> QA
    PlayInternal --> QA

    QA -->|"approved"| AppStore
    QA -->|"approved"| PlayStore

    Trigger -->|"JS-only changes"| EASUpdate
    EASUpdate --> ExpoChannel
    ExpoChannel --> OTA
```

## EAS Build Profiles

```mermaid
flowchart LR
    subgraph "eas.json profiles"
        Dev["development<br/>- internal distribution<br/>- dev client<br/>- debug mode"]
        Preview["preview<br/>- internal distribution<br/>- staging API endpoints<br/>- release mode"]
        Prod["production<br/>- store distribution<br/>- prod API endpoints<br/>- release mode<br/>- code signing"]
    end

    Dev -->|"eas build -p ios --profile development"| DevBuild["Dev Build<br/>(installable via QR)"]
    Preview -->|"eas build -p all --profile preview"| PreviewBuild["Preview Build<br/>(TestFlight + Internal)"]
    Prod -->|"eas build -p all --profile production"| ProdBuild["Production Build<br/>(App Store + Play Store)"]
```

## Firebase Project Environments

```mermaid
flowchart TB
    subgraph "Dev Environment"
        DevProject["mma-dev"]
        DevAuth["Firebase Auth<br/>(test accounts)"]
        DevFS["Firestore<br/>(test data, no rules)"]
        DevCF["Cloud Functions<br/>(local emulator or deployed)"]
        DevNote["Used for local development<br/>Emulator Suite preferred"]
    end

    subgraph "Staging Environment"
        StagingProject["mma-staging"]
        StagingAuth["Firebase Auth<br/>(QA accounts)"]
        StagingFS["Firestore<br/>(security rules enforced)"]
        StagingCF["Cloud Functions<br/>(deployed, staging config)"]
        StagingNote["Mirrors production config<br/>Used for QA and UAT"]
    end

    subgraph "Production Environment"
        ProdProject["mma-prod"]
        ProdAuth["Firebase Auth<br/>(real users)"]
        ProdFS["Firestore<br/>(security rules, backups)"]
        ProdCF["Cloud Functions<br/>(deployed, prod config)"]
        ProdNote["Live user traffic<br/>Daily backups enabled"]
    end

    DevProject -.->|"promote"| StagingProject
    StagingProject -.->|"promote"| ProdProject
```

## CI Pipeline — GitHub Actions

```mermaid
flowchart TB
    subgraph "Trigger"
        PROpen["PR Opened / Updated"]
    end

    subgraph "CI Jobs (parallel)"
        Lint["Lint<br/>pnpm run lint<br/>(ESLint + Prettier)"]
        TypeCheck["Type Check<br/>pnpm run typecheck<br/>(tsc --noEmit)"]
        TestUnit["Unit Tests<br/>pnpm run test<br/>(Vitest / Jest)"]
        TestE2E["E2E Tests<br/>(Maestro / Detox)<br/>-- optional, nightly"]
    end

    subgraph "Status Checks"
        Gate["All checks must pass"]
        Merge["Allow merge"]
    end

    PROpen --> Lint
    PROpen --> TypeCheck
    PROpen --> TestUnit

    Lint -->|"pass"| Gate
    TypeCheck -->|"pass"| Gate
    TestUnit -->|"pass"| Gate
    Gate --> Merge
```

## CI Workflow Detail

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant Runner as GitHub Actions Runner
    participant Vercel as Vercel

    Dev->>GH: Open PR (feature -> main)

    par CI Checks
        GH->>Runner: ci.yml triggered
        Runner->>Runner: Checkout code
        Runner->>Runner: Setup Node.js 20 + pnpm
        Runner->>Runner: pnpm install --frozen-lockfile
        Runner->>Runner: pnpm run lint (ESLint)
        Runner->>Runner: pnpm run typecheck (tsc)
        Runner->>Runner: pnpm run test (unit tests)
        Runner-->>GH: Report check results
    and Preview Deploy
        GH->>Vercel: Webhook
        Vercel->>Vercel: Build + Deploy preview
        Vercel-->>GH: Comment preview URL
    end

    GH->>GH: Enforce branch protection rules
    Note over GH: Required checks:<br/>- lint<br/>- typecheck<br/>- test<br/>- Vercel preview build

    Dev->>GH: Merge PR
    GH->>Vercel: Auto-deploy to production
    GH->>Runner: deploy-functions.yml triggered
    Runner->>Runner: Build + deploy Cloud Functions
```

## Environment Variables and Secrets

| Secret | Stored In | Used By |
|--------|-----------|---------|
| `FIREBASE_SERVICE_ACCOUNT_DEV` | GitHub Secrets | CI: deploy to dev |
| `FIREBASE_SERVICE_ACCOUNT_STAGING` | GitHub Secrets | CI: deploy to staging |
| `FIREBASE_SERVICE_ACCOUNT_PROD` | GitHub Secrets | CI: deploy to prod |
| `ANTHROPIC_API_KEY` | Firebase Functions config | Cloud Functions: Claude API |
| `DEEPGRAM_API_KEY` | Firebase Functions config | Cloud Functions: Deepgram (proxy for mobile) |
| `EXPO_TOKEN` | GitHub Secrets | CI: EAS Build + Submit |
| `VERCEL_TOKEN` | GitHub Secrets (auto via integration) | Vercel deployments |
| `NEXT_PUBLIC_FIREBASE_*` | Vercel env vars | Next.js client-side Firebase config |
| `FIREBASE_ADMIN_*` | Vercel env vars (server) | Next.js API routes / server components |
