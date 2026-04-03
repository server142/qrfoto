# Veltrix Events

A production-ready SaaS platform for live collaborative event galleries. Built for hosts and guests to seamlessly capture and display memories in real-time.

## Tech Stack
- **Frontend**: Next.js 14, App Router, TailwindCSS, ShadCN UI, Framer Motion
- **Backend**: NestJS (TypeScript, Modular Architecture), Socket.io
- **Database**: MySQL 8.2 & Redis (Dockerized)
- **Infrastructure**: Docker Compose, MinIO (S3-compatible storage), n8n (Automation)

## Getting Started

### 1. Prerequisites
- `Node.js` v20+
- `Docker` and `Docker Compose`

### 2. Environment Variables
Copy the `.env.example` to `.env` in the root folder:
```bash
cp .env.example .env
```
Update the required variables.

### 3. Start Infrastructure (Docker)
This will start MySQL, Redis, MinIO, and n8n automatically:
```bash
docker-compose up -d
```
The MySQL database `veltrix_events` schema will be initialized securely with setup files from the `database/init.sql`.

### 4. Start the Backend
```bash
cd backend
npm install
npm run start:dev
```
*The backend API runs at `http://localhost:3000`.*

### 5. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend portal runs at `http://localhost:3001` or `http://localhost:3000` depending on port availability.*

## Features Implemented in Boilerplate
- ✅ **Dockerized MySQL 8.2, Redis, MinIO, n8n**
- ✅ **MySQL Schema**: Roles, Plans, Media, Subscriptions, Events
- ✅ **NestJS API (Events Module)**: Controllers, Services, and Socket WebSockets implementation
- ✅ **Next.js 14 Web App**: High-fidelity modern Landing Page, Framer Motion animations, Next Font, ShadCN UI Components
- ✅ **n8n Automation Engine**: Configured Cron workflow example for Event Expiration reminders.

## Architecture
- `backend/` - NestJS application ensuring clean and testable module boundaries.
- `frontend/` - High-performance Server Components with minimal Client Components for animation/interactivity.
- `database/` - Bootstrapping scripts for relational modeling of tenants, plans, events.
- `n8n/` - Workflows directory holding workflow JSONs for imports.
