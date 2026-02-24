# Data Flow Architecture

This document describes how data moves through the MapMyActivities system, covering task CRUD operations, synchronization between mobile and web clients, real-time updates, and goal completion tracking.

## High-Level Data Flow

```mermaid
flowchart TB
    subgraph "Mobile Client"
        MUI["Mobile UI<br/>(React Native)"]
        WCRUD["Task CRUD<br/>Operations"]
        WDB["WatermelonDB<br/>(SQLite)"]
        SyncEngine["Sync Engine<br/>(pull/push)"]
    end

    subgraph "Web Client"
        WUI["Web UI<br/>(Next.js)"]
        ZStore["Zustand Store"]
        FSListener["Firestore<br/>onSnapshot Listener"]
    end

    subgraph "Firebase Backend"
        CF_Sync["Cloud Function<br/>syncPull / syncPush"]
        CF_Trigger["Cloud Function<br/>onTaskWrite"]
        CF_Goal["Cloud Function<br/>onGoalProgress"]
        FS["Cloud Firestore"]
    end

    MUI -->|"create/read/update/delete"| WCRUD
    WCRUD -->|"write locally"| WDB
    WDB -->|"observable queries"| MUI
    WDB -->|"pending changes"| SyncEngine
    SyncEngine -->|"HTTPS POST"| CF_Sync
    CF_Sync -->|"read/write"| FS

    WUI -->|"dispatch actions"| ZStore
    ZStore -->|"Firestore SDK write"| FS
    FS -->|"real-time snapshots"| FSListener
    FSListener -->|"update store"| ZStore
    ZStore -->|"re-render"| WUI

    FS -->|"document write trigger"| CF_Trigger
    CF_Trigger -->|"update goal progress"| FS
    FS -->|"goal doc change"| CF_Goal
    CF_Goal -->|"check completion / streaks"| FS
```

## Task CRUD — Mobile (WatermelonDB)

```mermaid
sequenceDiagram
    participant User as Mobile User
    participant UI as React Native UI
    participant WDB as WatermelonDB
    participant SQLite as SQLite DB

    User->>UI: Create / Update / Delete task
    UI->>WDB: writer.callWriter(() => { ... })
    WDB->>SQLite: INSERT / UPDATE / DELETE
    SQLite-->>WDB: Success
    WDB-->>UI: Observable emits updated collection
    UI-->>User: UI re-renders instantly

    Note over WDB: Change is flagged with<br/>_changed and _status fields<br/>for next sync cycle
```

## Task CRUD — Web (Zustand + Firestore)

```mermaid
sequenceDiagram
    participant User as Web User
    participant UI as Next.js Page
    participant Store as Zustand Store
    participant FS as Cloud Firestore

    User->>UI: Create / Update / Delete task
    UI->>Store: dispatch(action)
    Store->>FS: setDoc / updateDoc / deleteDoc
    FS-->>FS: Write acknowledged
    FS-->>Store: onSnapshot callback fires
    Store-->>UI: State update triggers re-render
    UI-->>User: UI reflects change

    Note over Store,FS: onSnapshot provides<br/>real-time sync across<br/>all open browser tabs
```

## Sync: Mobile to Firestore

```mermaid
flowchart LR
    subgraph "Mobile Device"
        WDB["WatermelonDB"]
    end

    subgraph "Cloud Functions"
        Pull["syncPull<br/>GET /sync/pull"]
        Push["syncPush<br/>POST /sync/push"]
    end

    subgraph "Firestore"
        Tasks["tasks/{taskId}"]
        Goals["goals/{goalId}"]
        Users["users/{userId}"]
    end

    WDB -->|"lastPulledAt timestamp"| Pull
    Pull -->|"query updatedAt > lastPulledAt"| Tasks
    Pull -->|"query updatedAt > lastPulledAt"| Goals
    Tasks -->|"created / updated / deleted arrays"| Pull
    Goals -->|"created / updated / deleted arrays"| Pull
    Pull -->|"{ changes, timestamp }"| WDB

    WDB -->|"{ changes: { tasks, goals } }"| Push
    Push -->|"validate + batch write"| Tasks
    Push -->|"validate + batch write"| Goals
    Push -->|"{ ok: true }"| WDB
```

## Goal Completion Tracking

```mermaid
sequenceDiagram
    participant Client as Client (Mobile / Web)
    participant FS as Cloud Firestore
    participant Trigger as onTaskWrite Function
    participant GoalDoc as goals/{goalId}

    Client->>FS: Update task (status: "done")
    FS->>Trigger: onWrite trigger fires
    Trigger->>FS: Query: tasks where goalId == task.goalId AND status == "done"
    FS-->>Trigger: completedCount, totalCount

    alt Goal type is "count"
        Trigger->>GoalDoc: Update progress = completedCount / target
    else Goal type is "streak"
        Trigger->>GoalDoc: Update currentStreak, check if today extends streak
    else Goal type is "boolean"
        Trigger->>GoalDoc: Update completed = (completedCount >= 1)
    end

    GoalDoc-->>FS: Document updated
    FS-->>Client: Real-time listener / next sync delivers updated goal
```

## Data Model Summary

```mermaid
erDiagram
    USER ||--o{ TASK : owns
    USER ||--o{ GOAL : owns
    GOAL ||--o{ TASK : "linked via goalId"
    TASK ||--o{ TAG : has

    USER {
        string id PK
        string email
        string displayName
        string tier "free | premium"
        timestamp createdAt
        timestamp updatedAt
    }

    TASK {
        string id PK
        string userId FK
        string title
        string description
        string status "todo | in_progress | done | archived"
        int eisenhowerQuadrant "1-4"
        int aiSuggestedQuadrant "1-4 nullable"
        string priority "low | medium | high | urgent"
        string goalId FK "nullable"
        string goalType "nullable"
        timestamp dueDate "nullable"
        timestamp createdAt
        timestamp updatedAt
        string _status "synced | created | updated | deleted (WatermelonDB)"
        string _changed "changed fields (WatermelonDB)"
    }

    GOAL {
        string id PK
        string userId FK
        string title
        string type "count | streak | boolean"
        int target "nullable"
        float progress "0.0 - 1.0"
        int currentStreak "nullable"
        boolean completed
        timestamp startDate
        timestamp endDate "nullable"
        timestamp createdAt
        timestamp updatedAt
    }

    TAG {
        string id PK
        string taskId FK
        string label
    }
```
