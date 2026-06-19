# SecureNET System Architecture & Design

The platform is designed to handle thousands of concurrent real-time connections by utilizing Redis as a pub/sub message broker across multiple Node.js instances.

## Architecture Diagram

```mermaid
graph TB

%% USERS
Citizen[Citizen]
Officer[Officer]
ControlRoom[Control Room]
Authority[Authority]

%% FRONTEND
subgraph Frontend["Frontend Layer"]
    NextJS[Next.js 15
    React • Tailwind
    Zustand • React Query
    Leaflet Maps]
end

%% LOAD BALANCER
LB[Nginx / Load Balancer]

%% BACKEND
subgraph Backend["Backend Services"]
    API1[Express API - Instance 1]
    API2[Express API - Instance 2]

    Auth[JWT + RBAC]

    Socket[Socket.io Server]

    PDF[PDF Generation]

    AIFIR[AI FIR Drafting]
end

%% DATA
subgraph Data["Data Layer"]
    Mongo[(MongoDB Atlas)]
    Redis[(Redis Pub/Sub)]
end

%% EXTERNAL
subgraph External["External Services"]
    Gemini[Google Gemini AI]
    S3[AWS S3 Storage]
    Email[Email Notifications]
end

%% USERS TO FRONTEND
Citizen --> NextJS
Officer --> NextJS
ControlRoom --> NextJS
Authority --> NextJS

%% FRONTEND TO LB
NextJS --> LB

%% LB TO APIS
LB --> API1
LB --> API2

%% API SERVICES
API1 --> Auth
API2 --> Auth

API1 --> Socket
API2 --> Socket

API1 --> PDF
API2 --> PDF

API1 --> AIFIR
API2 --> AIFIR

%% DATA CONNECTIONS
API1 --> Mongo
API2 --> Mongo

Socket --> Redis

%% EXTERNAL SERVICES
AIFIR --> Gemini

API1 --> S3
API2 --> S3

API1 --> Email
API2 --> Email

%% SOS FLOW
Citizen -. SOS Alert .-> NextJS
NextJS -. Emergency Request .-> API1

API1 -. Broadcast Event .-> Socket

Socket -. New Incident .-> ControlRoom

ControlRoom -. Assign Officer .-> Officer

Officer -. Status Update .-> API2

API2 -. Live Update .-> Socket

Socket -. Notification .-> Citizen
```
SOS REAL TIME FLOW
```mermaid
sequenceDiagram

    participant Citizen
    participant API
    participant Socket
    participant ControlRoom
    participant Officer

    Citizen->>API: Trigger SOS

    API->>Socket: Broadcast Alert

    Socket->>ControlRoom: Emergency Notification

    ControlRoom->>Officer: Assign Incident

    Officer->>API: Update Status

    API->>Socket: Broadcast Status Update

    Socket->>Citizen: Live Tracking Update
```

DEPLOYEMENT ARCHITECTURE

```mermaid
graph TD

    User[Users]

    Nginx[Nginx Load Balancer]

    API1[Express Server 1]
    API2[Express Server 2]

    Redis[(Redis)]

    Mongo[(MongoDB Atlas)]

    User --> Nginx

    Nginx --> API1
    Nginx --> API2

    API1 --> Redis
    API2 --> Redis

    API1 --> Mongo
    API2 --> Mongo
```

## Component Breakdown

### 1. Client Layer
- **Citizens & Users:** Access the platform to file FIRs, report emergencies, and track statuses.
- **Law Enforcement:** Access admin dashboards to view heatmaps, manage FIRs, and respond to incidents.

### 2. Frontend Layer (`apps/web`)
- **Next.js 15:** Provides Server-Side Rendering (SSR) and optimized static delivery.
- **React 18 & Tailwind CSS:** For building responsive, accessible, and fast user interfaces.
- **Leaflet:** Handles mapping for emergency heatmaps and location tracking.
- **Zustand & React Query:** Used for global state management and efficient server data fetching/caching.

### 3. Backend Layer (`apps/api`)
- **Node.js + Express:** Handles RESTful routing and business logic.
- **Socket.io:** Maintains real-time WebSocket connections with clients for instant emergency alerts and chat functionality.
- **Security & Validation:** Uses `zod` for data validation, `bcryptjs` for password hashing, and `jsonwebtoken` for secure session management.
- **PDF Generation:** Utilizes `pdfkit` to dynamically generate downloadable FIR documents.

### 4. Data Layer (`config/db.ts` & `Redis`)
- **MongoDB:** The primary database, accessed via `mongoose`. Stores users, FIR reports, emergency logs, and geospatial data.
- **Redis:** Operates as a Pub/Sub message broker via `@socket.io/redis-adapter`. This is critical for scaling; if you run multiple instances of your Backend API, Redis ensures that a WebSocket message sent to Server A is seamlessly broadcasted to users connected to Server B.

### 5. External Services
- **AWS S3 (via `aws-sdk`):** Used to store uploaded evidence, photos, or documents securely.
- **Google GenAI (`@google/genai`):** Integrates AI capabilities, likely for analyzing reports, summarizing incident details, or NLP tasks.
- **Nodemailer:** Handles outbound email communications, such as confirming FIR registrations or sending critical alerts.
