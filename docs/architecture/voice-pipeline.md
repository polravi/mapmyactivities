# Voice Assistant Pipeline

This document describes the end-to-end voice input pipeline for creating tasks in MapMyActivities. The system supports on-device speech-to-text for free users and Deepgram streaming STT for premium users, with Claude API powering natural language extraction of task attributes.

## Pipeline Overview

```mermaid
flowchart TB
    subgraph "1. Voice Capture"
        Mic["Microphone Input"]
        VAD["Voice Activity Detection<br/>(silence detection)"]
    end

    subgraph "2. Speech-to-Text"
        subgraph "Free Tier"
            RNV["@react-native-voice<br/>(on-device STT)"]
        end
        subgraph "Premium Tier"
            DG["Deepgram API<br/>(WebSocket streaming)"]
        end
    end

    subgraph "3. NLP Extraction"
        CF["Cloud Function<br/>parseVoiceTask"]
        Claude["Claude API<br/>(Anthropic)"]
    end

    subgraph "4. User Confirmation"
        Card["Confirmation Card UI"]
        Edit["Inline Edit Fields"]
        Save["Save Task"]
    end

    Mic --> VAD
    VAD -->|"3s silence = auto-stop"| RNV
    VAD -->|"3s silence = auto-stop"| DG

    RNV -->|"final transcript"| CF
    DG -->|"final transcript"| CF

    CF -->|"prompt + transcript"| Claude
    Claude -->|"structured JSON"| CF
    CF -->|"parsed task object"| Card

    Card --> Edit
    Edit -->|"user confirms / edits"| Save
    Save -->|"CRUD"| DB["WatermelonDB"]
```

## Voice Capture and STT — Detailed Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Voice Button UI
    participant Mic as Microphone
    participant STT as STT Engine
    participant Display as Transcript Display

    User->>UI: Tap mic button (or long-press)
    UI->>UI: Request microphone permission (if needed)
    UI->>Mic: Start audio capture
    UI->>STT: Start recognition

    loop Real-time transcription
        Mic->>STT: Audio stream
        STT->>Display: Partial transcript (onSpeechPartialResults)
        Display->>UI: Update transcript text in real-time
    end

    Note over Mic,STT: Silence detection starts<br/>counting when no speech detected

    alt User taps stop button
        User->>UI: Tap stop
        UI->>STT: Stop recognition
    else 3 seconds of silence
        STT->>UI: Auto-stop triggered
        UI->>STT: Stop recognition
    end

    STT->>UI: Final transcript (onSpeechResults)
    UI->>UI: Show final transcript with loading indicator
```

## Free Tier: On-Device STT

```mermaid
flowchart LR
    subgraph "On-Device Processing"
        Audio["Audio Input"]
        RNV["@react-native-voice"]
        iOSSpeech["iOS: Speech Framework"]
        AndroidSpeech["Android: SpeechRecognizer"]
    end

    Audio --> RNV
    RNV -->|"iOS"| iOSSpeech
    RNV -->|"Android"| AndroidSpeech
    iOSSpeech --> Transcript["Final Transcript"]
    AndroidSpeech --> Transcript

    Transcript --> Parse["Send to parseVoiceTask"]

    style RNV fill:#e1f5fe
    style iOSSpeech fill:#f3e5f5
    style AndroidSpeech fill:#e8f5e9
```

## Premium Tier: Deepgram Streaming STT

```mermaid
sequenceDiagram
    participant App as React Native App
    participant WS as WebSocket Connection
    participant DG as Deepgram API

    App->>App: Check user tier == "premium"
    App->>DG: Open WebSocket wss://api.deepgram.com/v1/listen<br/>?model=nova-2&punctuate=true&smart_format=true&language=en
    DG-->>App: WebSocket connected

    loop Audio streaming
        App->>WS: Send audio chunk (Linear16 PCM, 16kHz)
        WS->>DG: Forward audio
        DG-->>WS: Interim result { is_final: false, transcript: "remind me to..." }
        WS-->>App: Display interim transcript
    end

    App->>WS: Send CloseStream message (silence detected)
    DG-->>WS: Final result { is_final: true, transcript: "Remind me to call the dentist tomorrow at 3pm, high priority" }
    WS-->>App: Final transcript

    App->>App: Close WebSocket
    App->>App: Send transcript to parseVoiceTask
```

## NLP Extraction via Claude API

```mermaid
sequenceDiagram
    participant Client as Mobile App
    participant CF as parseVoiceTask Function
    participant Claude as Claude API (Anthropic)
    participant Client2 as Mobile App

    Client->>CF: POST /parseVoiceTask<br/>{ transcript, timezone, existingGoals[], existingTags[] }

    CF->>CF: Validate auth + rate limit check

    CF->>Claude: POST /v1/messages
    Note over CF,Claude: System prompt:<br/>"You are a task extraction assistant.<br/>Extract structured task data from<br/>the user's voice transcript.<br/>Return valid JSON only."<br/><br/>User message:<br/>"Transcript: '{transcript}'<br/>User timezone: {timezone}<br/>Available goals: {existingGoals}<br/>Available tags: {existingTags}<br/><br/>Extract: title, dueDate (ISO8601),<br/>priority (low|medium|high|urgent),<br/>goalType, tags[].<br/>If a field is unclear, set it to null."

    Claude-->>CF: JSON response
    Note over Claude,CF: {<br/>  "title": "Call the dentist",<br/>  "dueDate": "2024-12-15T15:00:00Z",<br/>  "priority": "high",<br/>  "goalType": null,<br/>  "tags": ["health", "calls"],<br/>  "confidence": 0.92<br/>}

    CF->>CF: Validate response schema (Zod)
    CF->>CF: Resolve relative dates ("tomorrow" -> absolute)
    CF-->>Client2: 200 { parsedTask }
```

## Confirmation Card UI Flow

```mermaid
flowchart TB
    Parsed["Parsed Task Object<br/>from Cloud Function"]

    Parsed --> Card["Confirmation Card"]

    subgraph "Confirmation Card"
        Title["Title: 'Call the dentist'<br/>(editable text field)"]
        Due["Due: Tomorrow 3:00 PM<br/>(editable date picker)"]
        Priority["Priority: High<br/>(editable selector)"]
        Goal["Goal: (none)<br/>(editable dropdown)"]
        Tags["Tags: health, calls<br/>(editable chips)"]
        Quadrant["Quadrant: (AI pending...)<br/>(auto-filled after save)"]
    end

    Card --> Actions

    subgraph "Actions"
        Confirm["Confirm & Save"]
        EditMore["Edit Fields"]
        Discard["Discard"]
        Retry["Re-record"]
    end

    Confirm -->|"save as-is"| CreateTask["Create Task in WatermelonDB"]
    EditMore -->|"user modifies fields"| Card
    Discard -->|"dismiss"| Home["Return to Home"]
    Retry -->|"re-open mic"| VoiceCapture["Restart Voice Capture"]

    CreateTask --> TriggerAI["Trigger suggestQuadrant<br/>(async, post-save)"]
    CreateTask --> SyncQueue["Queue for Sync"]
```

## Error Handling

```mermaid
flowchart TB
    VoiceStart["Voice Input Started"]

    VoiceStart --> MicError{"Microphone<br/>Permission?"}
    MicError -->|"Denied"| PermPrompt["Show permission<br/>settings prompt"]
    MicError -->|"Granted"| STTProcess["STT Processing"]

    STTProcess --> STTError{"STT Error?"}
    STTError -->|"No speech detected"| NoSpeech["Show 'No speech detected'<br/>+ retry button"]
    STTError -->|"Network error (Deepgram)"| Fallback["Fallback to on-device STT"]
    STTError -->|"Language not supported"| LangError["Show language error<br/>+ manual input option"]
    STTError -->|"Success"| SendParse["Send to parseVoiceTask"]

    SendParse --> ParseError{"Parse Error?"}
    ParseError -->|"Network error"| Offline["Show transcript<br/>+ manual task creation"]
    ParseError -->|"Claude API error"| APIError["Retry once, then<br/>show transcript + manual"]
    ParseError -->|"Low confidence < 0.5"| LowConf["Show parsed result<br/>with warning banner"]
    ParseError -->|"Success"| ShowCard["Show Confirmation Card"]

    Fallback --> STTProcess
```

## Rate Limiting

| User Tier | Voice Commands / Day | Deepgram Minutes / Month | Claude Calls / Day |
|-----------|---------------------|-------------------------|-------------------|
| Free      | 20                  | N/A (on-device only)    | 20                |
| Premium   | Unlimited           | 120 minutes             | 200               |
