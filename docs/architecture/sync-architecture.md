# Sync Architecture

This document details the synchronization mechanism between the React Native mobile app (WatermelonDB / SQLite) and Cloud Firestore. The sync protocol follows a pull-then-push pattern with last-write-wins conflict resolution and field-level merging.

## Sync Overview

```mermaid
flowchart TB
    subgraph "Mobile Client"
        App["React Native App"]
        WDB["WatermelonDB"]
        SM["Sync Manager"]
        NM["Network Monitor"]
        Timer["Interval Timer<br/>(5 min)"]
        Debounce["Write Debounce<br/>(5 sec)"]
    end

    subgraph "Sync Triggers"
        T1["App Foreground"]
        T2["After Local Write<br/>(5s debounce)"]
        T3["Pull-to-Refresh"]
        T4["5-Minute Interval"]
        T5["Network Reconnect"]
    end

    subgraph "Cloud Functions"
        PullFn["syncPull"]
        PushFn["syncPush"]
    end

    subgraph "Firestore"
        FS["Cloud Firestore<br/>Source of Truth"]
    end

    T1 --> SM
    T2 --> Debounce --> SM
    T3 --> SM
    T4 --> Timer --> SM
    T5 --> NM --> SM

    App --> WDB
    WDB --> SM

    SM -->|"1. Pull first"| PullFn
    PullFn --> FS
    FS --> PullFn
    PullFn --> SM

    SM -->|"2. Then push"| PushFn
    PushFn --> FS
    PushFn --> SM
    SM --> WDB
```

## Pull Flow

The client sends its `lastPulledAt` timestamp. The server queries Firestore for all documents modified after that timestamp and returns them categorized as created, updated, or deleted.

```mermaid
sequenceDiagram
    participant Client as Mobile Client
    participant SM as Sync Manager
    participant CF as syncPull Function
    participant FS as Firestore

    Client->>SM: Trigger sync
    SM->>CF: POST /sync/pull<br/>{ lastPulledAt: 1700000000000, userId }

    CF->>CF: Validate auth token

    par Query all collections
        CF->>FS: tasks WHERE updatedAt > lastPulledAt AND userId == uid
        CF->>FS: goals WHERE updatedAt > lastPulledAt AND userId == uid
    end

    FS-->>CF: Modified task documents
    FS-->>CF: Modified goal documents

    CF->>CF: Partition each collection into:<br/>- created (createdAt > lastPulledAt)<br/>- updated (createdAt <= lastPulledAt, not deleted)<br/>- deleted (status == "deleted")

    CF-->>SM: Response 200<br/>{ changes: { tasks: { created, updated, deleted }, goals: { created, updated, deleted } }, timestamp: serverNow }

    SM->>SM: Apply remote changes to WatermelonDB
    SM->>SM: Store new lastPulledAt = timestamp

    Note over SM: WatermelonDB observable queries<br/>automatically re-render UI
```

## Push Flow

The client collects all locally modified records (flagged by WatermelonDB's `_status` field) and sends them to the server. The server validates and applies them with conflict resolution.

```mermaid
sequenceDiagram
    participant Client as Mobile Client
    participant SM as Sync Manager
    participant CF as syncPush Function
    participant FS as Firestore

    SM->>SM: Collect records where _status IN (created, updated, deleted)

    SM->>CF: POST /sync/push<br/>{ changes: { tasks: { created: [...], updated: [...], deleted: [...] }, goals: { ... } }, userId }

    CF->>CF: Validate auth token
    CF->>CF: Validate payload schema (Zod)

    loop For each created record
        CF->>FS: Check if document already exists
        alt Document does not exist
            CF->>FS: batch.set(doc)
        else Document exists (duplicate create)
            CF->>CF: Apply conflict resolution (LWW)
            CF->>FS: batch.update(doc) with merged fields
        end
    end

    loop For each updated record
        CF->>FS: Get current server document
        CF->>CF: Compare updatedAt timestamps
        alt Client timestamp >= Server timestamp
            CF->>CF: Field-level merge
            CF->>FS: batch.update(doc)
        else Server is newer
            CF->>CF: Apply conflict resolution rules
            CF->>FS: batch.update(doc) with selective merge
        end
    end

    loop For each deleted record
        CF->>FS: Soft delete (set status = "deleted", updatedAt = now)
    end

    CF->>FS: batch.commit()
    CF-->>SM: Response 200 { ok: true }
    SM->>SM: Mark synced records as _status = "synced" in WatermelonDB
```

## Conflict Resolution Strategy

```mermaid
flowchart TB
    Start["Conflict Detected<br/>(client and server both modified)"]

    Start --> CheckField{"Which field<br/>is conflicting?"}

    CheckField -->|"eisenhowerQuadrant"| ClientWins["Client Wins<br/>(user explicitly chose quadrant)"]
    CheckField -->|"status"| StatusRule["No-Regression Rule"]
    CheckField -->|"Other fields"| LWW["Last-Write-Wins<br/>(compare updatedAt)"]

    StatusRule --> StatusCheck{"Server status<br/>vs Client status"}
    StatusCheck -->|"server=done, client=todo"| KeepServer["Keep Server Value<br/>(no regression from done)"]
    StatusCheck -->|"server=todo, client=done"| KeepClient["Keep Client Value<br/>(progression allowed)"]
    StatusCheck -->|"same direction"| LWW2["Last-Write-Wins"]

    LWW --> Merge["Field-Level Merge:<br/>Take each field from<br/>whichever doc is newer<br/>for that specific field"]

    ClientWins --> Write["Write Resolved Doc<br/>to Firestore"]
    KeepServer --> Write
    KeepClient --> Write
    LWW2 --> Write
    Merge --> Write
```

## Conflict Resolution Rules

| Field | Strategy | Rationale |
|-------|----------|-----------|
| `eisenhowerQuadrant` | **Client wins** | User explicitly assigns quadrant; AI suggestion is advisory only |
| `aiSuggestedQuadrant` | **Server wins** | AI suggestion is computed server-side; client should not override |
| `status` | **No-regression** | Progression order: `todo` -> `in_progress` -> `done` -> `archived`. Never move backward. |
| `title`, `description` | **LWW (field-level)** | Compare per-field `updatedAt` if available, else document-level |
| `priority`, `dueDate` | **LWW** | Standard last-write-wins |
| `tags` | **Union merge** | Combine tags from both sides, deduplicate |
| `goalId` | **Client wins** | User explicitly links task to goal |

## Sync Trigger Conditions

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> SyncRequested: App enters foreground
    Idle --> SyncRequested: Pull-to-refresh gesture
    Idle --> SyncRequested: Network reconnected
    Idle --> DebouncePending: Local write detected

    DebouncePending --> DebouncePending: Another write within 5s (reset timer)
    DebouncePending --> SyncRequested: 5s elapsed with no new writes

    Idle --> SyncRequested: 5-minute interval timer fires

    SyncRequested --> Syncing: Acquire sync lock
    SyncRequested --> Idle: Already syncing (skip)

    Syncing --> PullPhase: Start pull
    PullPhase --> PushPhase: Pull complete, apply remote changes
    PushPhase --> Idle: Push complete, release lock

    Syncing --> RetryBackoff: Network error
    RetryBackoff --> SyncRequested: Retry after exponential backoff (1s, 2s, 4s, max 30s)
    RetryBackoff --> Idle: Max retries (5) exceeded, wait for next trigger
```

## Error Handling and Retry

```mermaid
flowchart TB
    SyncStart["Sync Initiated"]
    SyncStart --> Pull["Pull Phase"]

    Pull -->|"Success"| Push["Push Phase"]
    Pull -->|"Network Error"| Retry["Exponential Backoff<br/>1s, 2s, 4s, 8s, 16s"]
    Pull -->|"Auth Error (401)"| ReAuth["Re-authenticate<br/>Refresh token"]
    Pull -->|"Server Error (5xx)"| Retry

    Push -->|"Success"| Done["Sync Complete"]
    Push -->|"Network Error"| RetryPush["Retry Push Only<br/>(pull already applied)"]
    Push -->|"Conflict (409)"| RePull["Re-pull then Re-push"]
    Push -->|"Validation Error (400)"| LogError["Log Error<br/>Skip invalid records<br/>Push remaining"]

    Retry -->|"Max retries exceeded"| Queued["Queue for next trigger"]
    ReAuth -->|"Token refreshed"| Pull
    ReAuth -->|"Refresh failed"| LoginScreen["Redirect to Login"]
    RetryPush --> Push
    RePull --> Pull
```
