# Authentication Flow

This document describes the authentication architecture for MapMyActivities, covering email/password, Google OAuth, and Apple Sign-In flows for both mobile and web clients. It also covers user document initialization and session management.

## Auth Provider Overview

```mermaid
flowchart TB
    subgraph "Auth Methods"
        Email["Email / Password"]
        Google["Google OAuth 2.0"]
        Apple["Apple Sign-In"]
    end

    subgraph "Firebase Auth"
        FA["Firebase Authentication"]
        UID["Firebase UID<br/>(unified identity)"]
    end

    subgraph "Clients"
        Mobile["React Native Expo"]
        Web["Next.js Web App"]
    end

    subgraph "Post-Auth"
        Trigger["onUserCreate<br/>Cloud Function"]
        UserDoc["Firestore<br/>users/{uid}"]
    end

    Email --> FA
    Google --> FA
    Apple --> FA

    FA --> UID

    Mobile -->|"Firebase SDK<br/>ID token"| FA
    Web -->|"Firebase SDK<br/>+ httpOnly cookie"| FA

    UID -->|"first-time user"| Trigger
    Trigger -->|"initialize"| UserDoc
```

## Email Registration and Login

```mermaid
sequenceDiagram
    participant User
    participant Client as Client (Mobile / Web)
    participant FA as Firebase Auth
    participant CF as onUserCreate Function
    participant FS as Firestore

    Note over User,FS: Registration Flow
    User->>Client: Enter email + password
    Client->>Client: Validate (email format, password >= 8 chars)
    Client->>FA: createUserWithEmailAndPassword(email, password)
    FA->>FA: Create user record
    FA-->>Client: UserCredential { uid, email, idToken }
    FA->>CF: onUserCreate trigger
    CF->>FS: Create users/{uid} document
    Note over CF,FS: { email, displayName: null,<br/>tier: "free", createdAt: now,<br/>preferences: defaults }
    Client->>Client: Navigate to onboarding

    Note over User,FS: Login Flow
    User->>Client: Enter email + password
    Client->>FA: signInWithEmailAndPassword(email, password)
    FA-->>Client: UserCredential { uid, email, idToken }
    Client->>Client: Navigate to home / dashboard
```

## Google OAuth Flow

```mermaid
sequenceDiagram
    participant User
    participant MobileApp as React Native App
    participant ExpoAuth as expo-auth-session
    participant GoogleIDP as Google OAuth Server
    participant FA as Firebase Auth

    Note over User,FA: Mobile — Google OAuth
    User->>MobileApp: Tap "Sign in with Google"
    MobileApp->>ExpoAuth: promptAsync(googleAuthRequest)
    ExpoAuth->>GoogleIDP: Open browser / system dialog
    GoogleIDP-->>User: Consent screen
    User->>GoogleIDP: Grant consent
    GoogleIDP-->>ExpoAuth: Authorization code
    ExpoAuth->>ExpoAuth: Exchange code for id_token
    ExpoAuth-->>MobileApp: { id_token, access_token }
    MobileApp->>FA: signInWithCredential(<br/>GoogleAuthProvider.credential(id_token))
    FA-->>MobileApp: UserCredential { uid, displayName, photoURL }

    Note over User,FA: Web — Google OAuth
    participant WebApp as Next.js App
    participant PopUp as Browser Popup

    User->>WebApp: Click "Sign in with Google"
    WebApp->>FA: signInWithPopup(GoogleAuthProvider)
    FA->>PopUp: Open Google consent popup
    PopUp-->>User: Consent screen
    User->>PopUp: Grant consent
    PopUp-->>FA: OAuth tokens
    FA-->>WebApp: UserCredential { uid, displayName, photoURL }
    WebApp->>WebApp: Set session cookie (see Session Management)
```

## Apple Sign-In Flow

```mermaid
sequenceDiagram
    participant User
    participant MobileApp as React Native App
    participant AppleAuth as expo-apple-authentication
    participant AppleIDP as Apple ID Server
    participant FA as Firebase Auth

    Note over User,FA: Mobile — Apple Sign-In
    User->>MobileApp: Tap "Sign in with Apple"
    MobileApp->>AppleAuth: signInAsync({ scopes: [FULL_NAME, EMAIL] })
    AppleAuth->>AppleIDP: Native Apple Sign-In sheet
    AppleIDP-->>User: Face ID / Touch ID / Password
    User->>AppleIDP: Authenticate
    AppleIDP-->>AppleAuth: { identityToken, nonce, fullName, email }
    AppleAuth-->>MobileApp: Apple credential
    MobileApp->>FA: signInWithCredential(<br/>OAuthProvider("apple.com").credential(<br/>identityToken, nonce))
    FA-->>MobileApp: UserCredential { uid }
    MobileApp->>MobileApp: Store displayName from fullName<br/>(Apple only sends name on first sign-in)

    Note over User,FA: Web — Apple Sign-In
    participant WebApp as Next.js App

    User->>WebApp: Click "Sign in with Apple"
    WebApp->>FA: signInWithPopup(OAuthProvider("apple.com"))
    FA->>AppleIDP: Redirect to Apple Sign-In page
    AppleIDP-->>User: Consent / authenticate
    User->>AppleIDP: Authorize
    AppleIDP-->>FA: OAuth tokens
    FA-->>WebApp: UserCredential { uid }
```

## onUserCreate — User Document Initialization

```mermaid
sequenceDiagram
    participant FA as Firebase Auth
    participant CF as onUserCreate Function
    participant FS as Firestore

    FA->>CF: Trigger: new user created<br/>{ uid, email, displayName, photoURL, providerData }

    CF->>CF: Determine auth provider<br/>(email, google.com, apple.com)

    CF->>FS: Create document at users/{uid}
    Note over CF,FS: {<br/>  email: user.email,<br/>  displayName: user.displayName || null,<br/>  photoURL: user.photoURL || null,<br/>  tier: "free",<br/>  authProvider: "google.com",<br/>  preferences: {<br/>    defaultQuadrant: null,<br/>    voiceEnabled: true,<br/>    notificationsEnabled: true,<br/>    theme: "system"<br/>  },<br/>  stats: {<br/>    totalTasks: 0,<br/>    completedTasks: 0,<br/>    currentStreak: 0<br/>  },<br/>  createdAt: serverTimestamp(),<br/>  updatedAt: serverTimestamp()<br/>}

    CF->>FS: Create default goal document<br/>goals/{auto-id}
    Note over CF,FS: "Complete your first task" starter goal

    CF-->>FA: Function execution complete
```

## Session Management

```mermaid
flowchart TB
    subgraph "Mobile Session"
        MSDK["Firebase SDK<br/>(React Native)"]
        MToken["ID Token<br/>(auto-refreshed)"]
        MSecure["Secure Storage<br/>(expo-secure-store)"]
        MPersist["Auth State Persistence<br/>(AsyncStorage)"]

        MSDK -->|"getIdToken()"| MToken
        MSDK -->|"onAuthStateChanged"| MPersist
        MToken -->|"Authorization: Bearer"| API1["Cloud Functions"]
        MSDK -->|"refresh token"| MSecure
    end

    subgraph "Web Session"
        WSDK["Firebase SDK<br/>(Web)"]
        WCookie["httpOnly Cookie<br/>(session token)"]
        NMiddleware["Next.js Middleware"]
        ServerComp["Server Components"]

        WSDK -->|"getIdToken()"| WCookie
        WCookie -->|"attached to every request"| NMiddleware
        NMiddleware -->|"verify token"| ServerComp

        NMiddleware -->|"valid"| Allow["Allow request"]
        NMiddleware -->|"expired / missing"| Redirect["Redirect to /login"]
    end
```

## Web Session Cookie Flow

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant NextJS as Next.js Server
    participant MW as Middleware
    participant FA as Firebase Auth
    participant AdminSDK as Firebase Admin SDK

    Note over Browser,AdminSDK: Login — Set Cookie
    Browser->>FA: signInWithPopup / signInWithEmailAndPassword
    FA-->>Browser: UserCredential + ID token
    Browser->>NextJS: POST /api/auth/login { idToken }
    NextJS->>AdminSDK: verifyIdToken(idToken)
    AdminSDK-->>NextJS: Decoded token (valid)
    NextJS->>AdminSDK: createSessionCookie(idToken, { expiresIn: 14 days })
    AdminSDK-->>NextJS: Session cookie value
    NextJS-->>Browser: Set-Cookie: session={value}; HttpOnly; Secure; SameSite=Lax; Path=/

    Note over Browser,AdminSDK: Subsequent Requests
    Browser->>MW: GET /dashboard (cookie attached)
    MW->>AdminSDK: verifySessionCookie(cookie)
    AdminSDK-->>MW: Decoded claims { uid, email }
    MW->>MW: Inject user context into request headers
    MW-->>Browser: Allow — render page

    Note over Browser,AdminSDK: Logout
    Browser->>NextJS: POST /api/auth/logout
    NextJS->>AdminSDK: revokeRefreshTokens(uid)
    NextJS-->>Browser: Set-Cookie: session=; Max-Age=0
    Browser->>Browser: firebase.auth().signOut()
    Browser->>Browser: Redirect to /login
```

## Protected Routes

| Platform | Mechanism | Behavior on Unauthenticated |
|----------|-----------|---------------------------|
| Mobile | `onAuthStateChanged` listener in root navigator | Redirect to Login stack |
| Web (CSR) | `onAuthStateChanged` + React context provider | Redirect to `/login` |
| Web (SSR) | Next.js middleware checks session cookie | 307 redirect to `/login` |
| Web (API) | `verifySessionCookie` in API route handler | 401 Unauthorized response |
| Cloud Functions | `verifyIdToken` from Authorization header | 401 Unauthorized response |
