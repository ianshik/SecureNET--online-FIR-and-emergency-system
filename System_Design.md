# SecureNET System Architecture & Design

The platform is designed to handle thousands of concurrent real-time connections by utilizing Redis as a pub/sub message broker across multiple Node.js instances.

## Architecture Diagram

```mermaid
graph TD
    %% User Interfaces
    subgraph Clients ["Client Layer"]
        User["Citizens and Users<br>(Browser / Mobile Web)"]
        Police["Law Enforcement / Admins<br>(Dashboard)"]
    end

    %% Frontend App
    subgraph Frontend ["Frontend Next.js 15"]
        NextUI["UI Components<br>(React, Tailwind)"]
        State["State Management<br>(Zustand, React Query)"]
        Maps["Geospatial Views<br>(Leaflet)"]
        AuthFront["Authentication<br>(NextAuth)"]
    end

    %% Load Balancing / Edge
    Edge("Internet / CDN / Edge")

    %% Backend API
    subgraph Backend ["Backend API Node.js and Express"]
        API["REST Endpoints<br>(Express)"]
        AuthBack["Auth and Security<br>(JWT, bcrypt, Helmet)"]
        PDF["Document Gen<br>(PDFKit)"]
        Sockets["Real-Time Server<br>(Socket.io)"]
    end

    %% Data Layer
    subgraph DataLayer ["Data Layer"]
        DB[("MongoDB<br>(Primary Data Store)")]
        Cache[("Redis<br>(Pub/Sub and Socket Adapter)")]
    end

    %% External Services
    subgraph External ["External Services APIs"]
        AWS(("AWS S3<br>(File/Media Storage)"))
        Gemini(("Google GenAI<br>(AI Processing)"))
        Email(("SMTP/Nodemailer<br>(Email Notifications)"))
    end

    %% Connections
    User <-->|HTTPS / WSS| Edge
    Police <-->|HTTPS / WSS| Edge
    Edge <-->|Static Assets and API Routes| Frontend
    Edge <-->|API Calls and WebSockets| Backend
    
    NextUI <--> API
    State <--> AuthFront
    
    API <--> AuthBack
    API <--> PDF
    API <--> Sockets

    Backend <-->|Mongoose queries| DB
    Sockets <-->|Redis Pub/Sub| Cache
    
    API --->|Media Uploads| AWS
    API --->|AI Prompts/Analysis| Gemini
    API --->|Alerts| Email

    %% Styling
    classDef client fill:#e0f7fa,stroke:#006064,stroke-width:2px;
    classDef frontend fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef backend fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef external fill:#ffebee,stroke:#b71c1c,stroke-width:2px;

    class User,Police client;
    class Frontend,NextUI,State,Maps,AuthFront frontend;
    class Backend,API,AuthBack,PDF,Sockets backend;
    class DataLayer,DB,Cache data;
    class External,AWS,Gemini,Email external;
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
