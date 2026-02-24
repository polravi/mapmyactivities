# System Overview

A C4-style system context diagram showing the high-level architecture of MapMyActivities. The platform consists of a React Native Expo mobile app and a Next.js web app, both backed by Firebase services and enhanced with AI capabilities via the Claude API and Deepgram speech-to-text.

## System Context Diagram

```mermaid
C4Context
    title MapMyActivities — System Context

    Person(mobileUser, "Mobile User", "iOS / Android user managing tasks and goals")
    Person(webUser, "Web User", "Browser user managing tasks and goals")

    System(mobileApp, "React Native Expo App", "Cross-platform mobile application with offline-first architecture using WatermelonDB")
    System(webApp, "Next.js Web App", "Server-rendered web application hosted on Vercel with real-time Firestore sync")

    System_Ext(firebase, "Firebase Platform", "Auth, Firestore, Cloud Functions, Cloud Messaging")
    System_Ext(claudeAPI, "Claude API (Anthropic)", "LLM for voice-task parsing, Eisenhower quadrant suggestion, and NLP")
    System_Ext(deepgram, "Deepgram STT", "Premium speech-to-text engine for high-accuracy voice transcription")

    Rel(mobileUser, mobileApp, "Uses", "Touch / Voice")
    Rel(webUser, webApp, "Uses", "Browser")

    Rel(mobileApp, firebase, "Auth, Sync, Functions", "HTTPS / WebSocket")
    Rel(webApp, firebase, "Auth, Realtime DB, Functions", "HTTPS / WebSocket")

    Rel(firebase, claudeAPI, "Task parsing & AI suggestions", "HTTPS REST")
    Rel(mobileApp, deepgram, "Premium voice transcription", "WebSocket streaming")
```

## Component Breakdown

```mermaid
graph TB
    subgraph "Client Layer"
        MA["React Native Expo App<br/>(iOS + Android)"]
        WA["Next.js Web App<br/>(Vercel)"]
    end

    subgraph "State Management"
        WDB["WatermelonDB<br/>(SQLite, offline-first)"]
        ZS["Zustand Store<br/>(in-memory, real-time)"]
    end

    subgraph "Firebase Platform"
        FA["Firebase Auth<br/>(Email, Google, Apple)"]
        FS["Cloud Firestore<br/>(NoSQL document DB)"]
        CF["Cloud Functions<br/>(Node.js serverless)"]
        FCM["Cloud Messaging<br/>(Push notifications)"]
    end

    subgraph "External Services"
        CL["Claude API<br/>(Anthropic)"]
        DG["Deepgram STT<br/>(Premium tier)"]
        RNV["@react-native-voice<br/>(On-device STT)"]
    end

    MA --> WDB
    MA --> FA
    WDB -->|"pull/push sync"| CF
    CF --> FS

    WA --> ZS
    WA --> FA
    ZS -->|"onSnapshot real-time"| FS

    CF -->|"parseVoiceTask / suggestQuadrant"| CL
    MA -->|"default STT"| RNV
    MA -->|"premium STT"| DG
    CF -->|"onTaskWrite trigger"| FS
    CF -->|"push notifications"| FCM
```

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mobile framework | React Native + Expo | Cross-platform with native performance, OTA updates via EAS |
| Offline storage | WatermelonDB (SQLite) | Lazy-loading, observable queries, built-in sync primitives |
| Web state | Zustand + Firestore onSnapshot | Lightweight store with real-time server sync |
| Auth provider | Firebase Auth | Multi-provider (Email, Google, Apple) with minimal setup |
| AI / NLP | Claude API (Anthropic) | Strong instruction-following for structured extraction |
| Voice (default) | @react-native-voice | Free, on-device, no network dependency |
| Voice (premium) | Deepgram | Higher accuracy, streaming, punctuation, speaker diarization |
| Backend | Cloud Functions (Firebase) | Tight Firestore integration, event-driven triggers |
| Web hosting | Vercel | Native Next.js support, edge functions, preview deploys |
