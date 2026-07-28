# The Rising Stars Adventure — Enterprise Backend Architecture v2.0.0

Production-grade, high-availability distributed backend architecture designed to handle **100,000+ users**, **10,000+ daily bookings**, and **1,000+ concurrent live GPS sessions**.

---

## 🏛️ System Architecture Diagram

```
                             ┌───────────────────────────────────┐
                             │       Web / Mobile Clients        │
                             └─────────────────┬─────────────────┘
                                               │
                                       HTTPS / WebSockets
                                               │
                                               ▼
                             ┌───────────────────────────────────┐
                             │         Cloudflare / NGINX        │
                             │       (SSL / WAF / DDoS Protect)   │
                             └─────────────────┬─────────────────┘
                                               │
                                               ▼
                             ┌───────────────────────────────────┐
                             │    Express 4 API Server (Node 20) │
                             │  ┌─────────────────────────────┐  │
                             │  │ Helmet / CORS / Rate Limiter│  │
                             │  ├─────────────────────────────┤  │
                             │  │ Zod Input Validation        │  │
                             │  ├─────────────────────────────┤  │
                             │  │ RBAC Middleware             │  │
                             │  ├─────────────────────────────┤  │
                             │  │ Prometheus Metrics Tracker  │  │
                             │  └──────────────┬──────────────┘  │
                             └─────────────────┼─────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             │                                 │                                 │
             ▼                                 ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│     Socket.IO Engine    │       │   Layered Service Core  │       │  BullMQ Queue Workers   │
│  (Realtime GPS / SOS)   │       │ (Transactions/Business) │       │(Async Email, Push, SMS) │
└────────────┬────────────┘       └────────────┬────────────┘       └────────────┬────────────┘
             │                                 │                                 │
             │                                 ▼                                 │
             │                    ┌─────────────────────────┐                    │
             └───────────────────►│       Redis 7 Cache     │◄───────────────────┘
                                  │ (GPS / Cache / Queues)  │
                                  └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │  Prisma ORM Client v5   │
                                  └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │ PostgreSQL (Neon Cloud) │
                                  └─────────────────────────┘
```

---

## 📊 Database Entity-Relationship (ER) Diagram

```
  +------------------+         +------------------+         +------------------+
  |       User       |         |       Trek       |         |       Trip       |
  +------------------+         +------------------+         +------------------+
  | PK  id           |<----+   | PK  id           |<----+   | PK  id           |
  |     email        |     |   |     title        |     |   | FK  trekId       |
  |     passwordHash |     |   |     price        |     |   |     date         |
  |     role (Enum)  |     |   |     difficulty   |     |   |     status (Enum)|
  +--------┬---------+     |   +--------┬---------+     |   | FK  tripLeaderId |
           |               |            |               |   +--------┬---------+
           | 1:N           |            | 1:N           | 1:N        |
           v               |            v               |            v
  +------------------+     |   +------------------+     |   +------------------+
  |     Booking      |-----+   |      Image       |     +---|    SosAlert      |
  +------------------+         +------------------+         +------------------+
  | PK  id           |         | PK  id           |         | PK  id           |
  | FK  userId       |         | FK  trekId       |         | FK  tripId       |
  | FK  tripId       |         |     url          |         |     status (Enum)|
  |     members      |         +------------------+         +------------------+
  |     totalAmount  |
  |     status (Enum)|         +------------------+         +------------------+
  +--------┬---------+         |     Permission   |         |    AuditLog      |
           | 1:N               +------------------+         +------------------+
           v                   | PK  id           |         | PK  id           |
  +------------------+         |     name         |         | FK  userId       |
  |     Payment      |         +--------┬---------+         |     action       |
  +------------------+                  | 1:N               |     oldValue     |
  | PK  id           |                  v                   |     newValue     |
  | FK  bookingId    |         +------------------+         +------------------+
  |     amount       |         |  RolePermission  |
  |     transactionId|         +------------------+
  +------------------+         | PK  id           |
                               |     role (Enum)  |
                               | FK  permissionId |
                               +------------------+
```

---

## 📁 Directory Structure

```
backend/
├── Dockerfile                  # Production multi-stage build container
├── Dockerfile.dev              # Development hot-reloading container
├── docker-compose.yml          # Multi-service orchestration (Backend, Redis, Postgres)
├── jest.config.js              # ESM Jest configuration
├── package.json                # Production & developer dependencies
├── prisma/
│   └── schema.prisma           # Prisma enterprise database schema
├── src/
│   ├── app.js                  # Express app initialization & route assembly
│   ├── server.js               # HTTP & Socket.IO server entrypoint & graceful shutdown
│   ├── config/
│   │   ├── env.config.js       # Zod-validated environment config
│   │   └── swagger.js          # OpenAPI 3.1 Swagger specification
│   ├── controllers/            # Thin HTTP controllers
│   ├── jobs/                   # BullMQ background queue workers
│   ├── middleware/             # Middlewares (Auth, RBAC, Cache, Metrics, Validate, Error)
│   ├── realtime/               # Socket.IO real-time GPS & SOS broadcast engine
│   ├── repositories/           # Database access layer abstraction
│   ├── services/               # Core business logic & transaction handling
│   ├── utils/                  # ApiError, AsyncHandler, Logger (Winston), Redis, Metrics
│   └── validations/            # Zod validation schemas
└── tests/                      # Jest & Supertest integration suite
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 20.x
- Docker & Docker Compose
- PostgreSQL / Neon Cloud database URL

### Running via Docker Compose (Recommended)

```bash
# Clone repository and navigate to backend
cd backend

# Copy environment template
cp .env.example .env

# Launch full enterprise stack (Backend, Redis, PostgreSQL)
docker-compose up --build -d

# Check service status
docker-compose ps
```

### Local Development Setup

```bash
# Install dependencies
npm install

# Push database schema to PostgreSQL
npx prisma db push

# Seed initial adventure treks, users, and permissions
npm run db:seed

# Start development server with hot reload
npm run dev
```

The API will be available at `http://localhost:5000/api`.

---

## 📖 API & Metrics Documentation

| Route | Purpose | Access |
| :--- | :--- | :--- |
| `GET /api` | API Health check | Public |
| `GET /api/docs` | Interactive Swagger API Documentation | Public |
| `GET /metrics` | Prometheus Metrics Endpoint | Internal / Admin |
| `POST /api/auth/register` | User registration | Public |
| `POST /api/auth/login` | User login | Public |
| `GET /api/packages` | List adventure treks (Cached) | Public |
| `GET /api/search` | Search treks (Full-Text & Filters) | Public |
| `POST /api/bookings` | Book departure seats (Atomic transaction) | Authenticated |
| `POST /api/payments` | Process booking payment | Authenticated |
| `PUT /api/trips/:id/location` | Update live GPS coordinates | Trip Leader |
| `GET /api/trips/:id/track` | Stream live GPS coordinates | Public |
| `GET /api/admin/stats` | Admin Dashboard Metrics | Admin |
| `GET /api/admin/audit` | Enterprise Audit Log Trail | Admin |

---

## 🧪 Testing Suite

Run the automated integration test suite:

```bash
npm test
```

Target coverage exceeds **95%** across core authentication, transaction booking, role permissions, and payment workflows.

---

## 🔒 Production Security Measures

1. **RBAC Control**: All administrative and trip-leader operations require database-validated permissions (`hasPermission('trip.create')`).
2. **Rate Limiting**: IP-based sliding window rate limiters (300 req/15min general, 20 req/15min auth).
3. **Helmet Security**: Enhanced CSP, XSS protection, MIME sniffing prevention, and strict referrer policy.
4. **Audit Trail**: State-changing actions store before/after snapshots, user ID, client IP, and user-agent string.
5. **Non-Root Execution**: Docker container runs under unprivileged `nodejs` system account.
