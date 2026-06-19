<div align="center">
  
  <img src="https://img.icons8.com/nolan/96/police-badge.png" alt="SecureNET Logo" width="80" />
  
  # SecureNET (NP-SERP)
  **National Public Safety & Emergency Response Platform**

  <p align="center">
    A next-generation, real-time emergency dispatch and public safety ecosystem built for modern smart cities. 
    SecureNET bridges the gap between citizens, field officers, and control rooms using low-latency WebSockets, AI-powered automation, and real-time GIS tracking.
  </p>

  <p align="center">
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io" alt="Socket.io" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/AI-Gemini-4285F4?style=for-the-badge&logo=google" alt="Google Gemini" /></a>
  </p>
</div>

<br />

## 🌟 Why SecureNET? (The Pitch)

In critical emergencies, latency costs lives, and paperwork delays justice. **SecureNET** is designed to solve these systemic issues through a highly robust, event-driven architecture. 

By implementing **real-time bidirectional communication**, **geospatial querying (2dsphere)**, and **Generative AI**, SecureNET completely automates the traditional dispatch cycle—from the moment a citizen taps "SOS" to the AI automatically drafting the final legal First Information Report (FIR).

This project demonstrates a deep understanding of:
- **Distributed System Design**: Handling real-time state across multiple specialized client portals.
- **Geospatial Processing**: Calculating complex driving routes (via OSRM) and filtering active units within geospatial bounding boxes.
- **AI Integration**: Bridging LLMs with structured legal domain requirements.
- **Enterprise Security**: Implementing strict RBAC, rate limiting, and NoSQL injection prevention.

---

## 🚀 Key Features

### 📡 1. Intelligent Smart Dispatch Engine
- **One-Tap SOS**: Instantly broadcasts the citizen's exact GPS coordinates to the nearest available units.
- **Geo-Fenced Routing**: MongoDB `2dsphere` indexes dynamically calculate the Haversine distance to find the closest Police, Fire, or Medical responders.
- **Live Polyline Navigation**: Integrates with the **OSRM API** to draw dynamic, real-time driving routes directly on a CartoDB Dark Matter map.

### 🤖 2. AI-Powered FIR Drafter
- **Automated Legal Translation**: Field officers input raw, informal statements from citizens directly into their terminal.
- **LLM Processing**: SecureNET interfaces with **Google Gemini** to instantly parse the raw input, extract critical entities (Accused, Witnesses), format it into a legally sound document, and accurately suggest applicable penal codes (IPC Sections).

### 🖥️ 3. Role-Based Tactical Portals
The platform features four distinct, heavily secured interfaces, all utilizing a modern "Dark Glassmorphism" UI tailored for low-light tactical environments:
- **Citizen Portal**: Live emergency tracking and complaint status tracking.
- **Field Officer Portal**: Tactical feed, live routing, and evidence upload.
- **Control Room Command Center**: God's-eye view of all city incidents via Leaflet maps, live dispatch overrides, and active unit telemetry.
- **Authority Dashboard**: High-level data analytics, KPI tracking, and system audit logs.

---

## 💻 Tech Stack & Architecture

SecureNET is built using a **Monorepo architecture** to share TypeScript interfaces and Zod validation schemas across the stack.

### 📐 System Design & Architecture Diagram
We have a dedicated, detailed document breaking down the entire architecture and the real-time event-driven flow of the platform.

**[👉 View the full System Design Documentation here](./System_Design.md)**

### Frontend (`apps/web`)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (Custom thematic tokens, Glassmorphism, Micro-animations)
- **State Management**: Zustand
- **Maps & GIS**: Leaflet.js, React-Leaflet, OSRM Routing API
- **Icons**: Lucide React

### Backend (`apps/api`)
- **Runtime**: Node.js & Express.js (TypeScript)
- **Database**: MongoDB (Mongoose) with 2dsphere indexes
- **Real-Time Layer**: Socket.io (Event-driven pub/sub)
- **Validation**: Zod (Strict schema parsing)
- **AI Provider**: Google Gemini API integration

### Security & DevOps (`infra`)
- **Authentication**: JWT, HttpOnly Cookies, strict RBAC middleware.
- **Protection**: Helmet.js, express-rate-limit, express-mongo-sanitize.
- **Containerization**: Docker & Docker Compose setup (ready for Kubernetes).
- **Observability**: Prometheus & Grafana (Configured metrics endpoints).

---

## ⚙️ Local Setup & Installation

Get SecureNET running locally in minutes using Docker.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/SecureNET.git
cd SecureNET
```

### 2. Configure Environment Variables
Copy the example environment file and add your secret keys (JWT Secret, MongoDB URI, Gemini API Key).
```bash
cp apps/api/.env.example apps/api/.env
```

### 3. Spin Up the Stack
Use Docker Compose to build and start the entire infrastructure (Next.js, Node.js API, MongoDB, Redis, Prometheus).
```bash
docker-compose up --build
```
*The Web App will be available at `http://localhost:3000` and the API at `http://localhost:5000`.*

### 4. Seed the Database
Populate the database with initial dummy citizens, field officers, and active control room data to test the system.
```bash
docker-compose exec api npm run dev -- src/scripts/seed.ts
```

---

## 🔒 Security Posture

SecureNET was built with a "Secure by Default" mentality:
- **Stateless Auth**: JWT tokens stored exclusively in secure, `HttpOnly`, `SameSite=Strict` cookies to prevent XSS.
- **Zero-Trust Input**: Every single API request is strictly parsed through Zod schemas. Any deviation results in an immediate 400 rejection.
- **Rate Limiting**: Prevent abuse on public endpoints (e.g., SOS triggering) via `express-rate-limit`.

---

<div align="center">
  <br />
  <p><b>SecureNET</b> - Building the future of rapid response technology.</p>
</div>
