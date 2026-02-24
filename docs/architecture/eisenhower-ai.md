# Eisenhower Matrix AI Suggestion Flow

This document describes how MapMyActivities uses the Claude API to automatically suggest Eisenhower Matrix quadrant assignments for tasks. The system provides intelligent suggestions while always preserving user agency to accept or override them.

## Quadrant Reference

```mermaid
quadrantChart
    title Eisenhower Matrix
    x-axis Low Urgency --> High Urgency
    y-axis Low Importance --> High Importance
    quadrant-1 Q1: Do First (Urgent + Important)
    quadrant-2 Q2: Schedule (Important, Not Urgent)
    quadrant-3 Q3: Delegate (Urgent, Not Important)
    quadrant-4 Q4: Eliminate (Not Urgent, Not Important)
```

## Suggestion Flow Overview

```mermaid
flowchart TB
    subgraph "Task Creation"
        NewTask["New Task Created<br/>(manual or voice)"]
    end

    subgraph "Cloud Function"
        CF["suggestQuadrant"]
        RateLimit["Rate Limiter<br/>(per user tier)"]
        Prompt["Build Claude Prompt<br/>(task + context)"]
    end

    subgraph "Claude API"
        Claude["Claude API<br/>claude-3-5-haiku"]
    end

    subgraph "Response Processing"
        Parse["Parse Response"]
        Validate["Validate Schema"]
        Confidence{"Confidence<br/>>= 0.7?"}
    end

    subgraph "Client UI"
        HighConf["Pre-select Quadrant<br/>+ 'AI suggested' badge"]
        LowConf["Highlight Suggestion<br/>+ Show All Options"]
        UserChoice["User Confirms / Overrides"]
        SaveBoth["Save both:<br/>aiSuggestedQuadrant<br/>eisenhowerQuadrant"]
    end

    NewTask -->|"async call"| CF
    CF --> RateLimit
    RateLimit -->|"within limit"| Prompt
    RateLimit -->|"exceeded"| Skip["Skip AI suggestion<br/>User assigns manually"]
    Prompt --> Claude
    Claude --> Parse
    Parse --> Validate
    Validate --> Confidence

    Confidence -->|"High (>= 0.7)"| HighConf
    Confidence -->|"Low (< 0.7)"| LowConf

    HighConf --> UserChoice
    LowConf --> UserChoice
    UserChoice --> SaveBoth
```

## Detailed Suggestion Sequence

```mermaid
sequenceDiagram
    participant Client as Mobile / Web Client
    participant CF as suggestQuadrant Function
    participant FS as Firestore
    participant Claude as Claude API

    Client->>CF: POST /suggestQuadrant<br/>{ taskId, title, description, priority, dueDate, goalType, tags }

    CF->>CF: Verify auth token
    CF->>CF: Check rate limit (Redis / in-memory)

    CF->>FS: Fetch user context
    Note over CF,FS: Recent tasks with quadrants (last 20)<br/>User's goal priorities<br/>Current date for urgency assessment

    CF->>Claude: POST /v1/messages
    Note over CF,Claude: Model: claude-3-5-haiku-latest<br/>Max tokens: 256<br/>Temperature: 0.1<br/><br/>System: "You are a productivity assistant.<br/>Classify the task into Eisenhower<br/>Matrix quadrants (1-4).<br/>Q1=Urgent+Important<br/>Q2=Important+NotUrgent<br/>Q3=Urgent+NotImportant<br/>Q4=NotUrgent+NotImportant<br/><br/>Respond with JSON only."<br/><br/>User: "Task: {title}<br/>Description: {description}<br/>Priority: {priority}<br/>Due: {dueDate}<br/>Goal: {goalType}<br/>Tags: {tags}<br/>Context: User recently classified<br/>these tasks: {recentExamples}"

    Claude-->>CF: JSON response

    CF->>CF: Parse and validate with Zod
    Note over CF: Expected schema:<br/>{<br/>  quadrant: 1|2|3|4,<br/>  confidence: 0.0-1.0,<br/>  reasoning: string<br/>}

    CF->>FS: Update task document
    Note over CF,FS: {<br/>  aiSuggestedQuadrant: response.quadrant,<br/>  aiConfidence: response.confidence,<br/>  aiReasoning: response.reasoning<br/>}

    CF-->>Client: 200 { quadrant, confidence, reasoning }

    alt Confidence >= 0.7
        Client->>Client: Pre-select quadrant in UI<br/>Show "AI suggested" badge
    else Confidence < 0.7
        Client->>Client: Show suggestion with lower emphasis<br/>Display all 4 options prominently
    end

    Client->>Client: User confirms or overrides

    Client->>FS: Update task
    Note over Client,FS: {<br/>  eisenhowerQuadrant: userChoice,<br/>  aiSuggestedQuadrant: aiSuggestion<br/>  (preserved for analytics)<br/>}
```

## UI States

```mermaid
stateDiagram-v2
    [*] --> TaskCreated: User creates task

    TaskCreated --> Loading: suggestQuadrant called
    TaskCreated --> ManualOnly: Rate limit exceeded

    Loading --> HighConfidence: confidence >= 0.7
    Loading --> LowConfidence: confidence < 0.7
    Loading --> Error: API error / timeout

    HighConfidence --> QuadrantPreSelected
    state QuadrantPreSelected {
        [*] --> ShowBadge: "AI suggested: Q2 - Schedule"
        ShowBadge --> UserAccepts: Tap confirm
        ShowBadge --> UserOverrides: Select different quadrant
    }

    LowConfidence --> QuadrantHighlighted
    state QuadrantHighlighted {
        [*] --> ShowHint: "AI thinks: Q3 (low confidence)"
        ShowHint --> AllOptionsShown: Show all 4 quadrants equally
        AllOptionsShown --> UserSelects: User picks any quadrant
    }

    Error --> ManualOnly: Graceful degradation
    ManualOnly --> UserSelectsManually: Standard quadrant picker

    UserAccepts --> Saved
    UserOverrides --> Saved
    UserSelects --> Saved
    UserSelectsManually --> Saved

    Saved --> [*]
```

## Batch Suggestion for Unassigned Tasks

```mermaid
sequenceDiagram
    participant User
    participant Client as Client App
    participant CF as batchSuggestQuadrants Function
    participant Claude as Claude API
    participant FS as Firestore

    User->>Client: Tap "Suggest quadrants for all"<br/>(on unassigned tasks view)

    Client->>CF: POST /batchSuggestQuadrants<br/>{ taskIds: [id1, id2, ..., idN] }

    CF->>CF: Verify auth + rate limit
    CF->>CF: Cap batch size (max 20 tasks)

    CF->>FS: Fetch all task documents + user context

    loop Chunk tasks (5 per Claude call)
        CF->>Claude: POST /v1/messages
        Note over CF,Claude: "Classify these 5 tasks<br/>into Eisenhower quadrants.<br/>Return a JSON array of results."
        Claude-->>CF: Array of { taskId, quadrant, confidence, reasoning }
    end

    CF->>FS: Batch update all tasks with AI suggestions

    CF-->>Client: 200 { results: [...] }

    Client->>Client: Show summary card:<br/>"AI suggested quadrants for 15 tasks.<br/>3 high confidence, 8 medium, 4 low."

    Client->>Client: Navigate to review screen<br/>where user can accept/override each
```

## Confidence Calibration

```mermaid
flowchart LR
    subgraph "Signal Strength"
        Strong["Strong Signals<br/>(high confidence)"]
        Medium["Medium Signals<br/>(moderate confidence)"]
        Weak["Weak Signals<br/>(low confidence)"]
    end

    Strong --> HC["confidence >= 0.7"]
    Medium --> MC["confidence 0.4 - 0.7"]
    Weak --> LC["confidence < 0.4"]

    subgraph "Strong Signal Examples"
        S1["'Fix production crash ASAP'<br/>-> Q1 (0.95)"]
        S2["'Read book on leadership<br/>next month' -> Q2 (0.88)"]
        S3["'Reply to vendor email<br/>by EOD' -> Q3 (0.82)"]
    end

    subgraph "Weak Signal Examples"
        W1["'Thing about project'<br/>-> Q? (0.25)"]
        W2["'Meeting'<br/>-> Q? (0.30)"]
    end

    Strong --- S1
    Strong --- S2
    Strong --- S3
    Weak --- W1
    Weak --- W2
```

## Rate Limiting

```mermaid
flowchart TB
    Request["suggestQuadrant Request"]
    Request --> CheckTier{"User Tier?"}

    CheckTier -->|"Free"| FreeLimit["Rate Limit:<br/>10 suggestions / day<br/>No batch"]
    CheckTier -->|"Premium"| PremiumLimit["Rate Limit:<br/>100 suggestions / day<br/>Batch up to 20"]

    FreeLimit --> CheckCount{"Within<br/>daily limit?"}
    PremiumLimit --> CheckCount

    CheckCount -->|"Yes"| Proceed["Proceed with Claude API call"]
    CheckCount -->|"No"| Reject["Return 429<br/>{ error: 'rate_limit_exceeded',<br/>  resetAt: 'midnight UTC',<br/>  suggestion: 'Upgrade to Premium' }"]

    Proceed --> TrackUsage["Increment daily counter<br/>(Firestore: users/{uid}/usage/daily)"]
```

## Data Storage

Both the AI-suggested quadrant and the user's final choice are stored on the task document for analytics and model improvement.

| Field | Type | Description |
|-------|------|-------------|
| `eisenhowerQuadrant` | `1 \| 2 \| 3 \| 4` | The user's final quadrant assignment |
| `aiSuggestedQuadrant` | `1 \| 2 \| 3 \| 4 \| null` | The AI's suggestion (null if not requested) |
| `aiConfidence` | `number (0-1) \| null` | Confidence score of the AI suggestion |
| `aiReasoning` | `string \| null` | Brief reasoning from Claude (for transparency) |
| `quadrantSource` | `"manual" \| "ai_accepted" \| "ai_overridden"` | How the quadrant was assigned |
