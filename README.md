# SecureNet NP-SERP

**National Public Safety & Emergency Response Platform**

## Architecture Overview

SecureNet is a modern, enterprise-scale platform designed for public safety.
It uses a Monorepo architecture:
- **Frontend (`apps/web`)**: Next.js 15 App Router, Tailwind CSS, shadcn/ui.
- **Backend (`apps/api`)**: Node.js, Express, TypeScript, Mongoose, Socket.io.
- **Shared (`packages/shared`)**: Shared TS types and Zod schemas.
- **Infra (`infra`)**: Docker Compose, Prometheus, Grafana.

## Features

- **Authentication**: JWT, HttpOnly Cookies, RBAC (Citizen, Officer, Control Room, Authority).
- **Complaint Management**: Multi-step form, automated priority scoring.
- **SOS Emergency**: One-tap SOS, Smart Dispatch Engine using MongoDB 2dsphere indexes (Haversine distance calculations).
- **Real-Time Tracking**: Live GPS tracking via Socket.io between citizen and responders.
- **FIR Generation**: Digital signature mocks and PDF export.
- **Evidence Management**: AWS S3 pre-signed URL generation and chain-of-custody logging.
- **AI Crime Assistant**: Automated complaint classification and priority sorting.
- **Analytics & Dashboards**: Dedicated KPIs and Mapbox/Leaflet live tracking for Control Room.

## Setup Instructions

### Environment Variables
Copy `.env.example` to `.env` and fill in the required keys.

```bash
cp .env.example .env
```

### Running Locally (Docker)
The easiest way to run the entire stack locally is using Docker Compose.

```bash
docker-compose up --build
```
This will spin up:
- Next.js Web App on `http://localhost:3000`
- Express API on `http://localhost:5000`
- MongoDB on port `27017`
- Redis on port `6379`
- Prometheus on port `9090`
- Grafana on port `3001`

### Seeding the Database
To populate the database with initial users (Citizen, Officer, Admin) and resources (Police Station, Ambulance):
```bash
docker-compose exec api npm run dev -- src/scripts/seed.ts
```

## Security Decisions
- **Helmet.js** for HTTP headers.
- **Express Rate Limiting** to prevent brute-force attacks.
- **Zod validation** on all API inputs to prevent injection.
- **mongo-sanitize** to prevent NoSQL injection.
- **RBAC** middleware attached to routes based on user role.

## API Documentation
OpenAPI 3.0 specs can be found in `apps/api/src/config/swagger.json`.
