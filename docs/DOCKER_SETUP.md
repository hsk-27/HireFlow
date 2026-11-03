# HireFlow Docker & Container Orchestration Guide

HireFlow is fully containerized with multi-stage production Dockerfiles for both backend and frontend tiers, orchestrated with Docker Compose.

---

## 1. Quick Start with Docker Compose

To start the entire platform (PostgreSQL database, Spring Boot backend, and React/Nginx frontend):

```bash
# Clone and navigate to repository root
cd hireflow

# Build container images and launch services
docker compose up --build -d
```

---

## 2. Service Architecture & Port Mapping

| Service | Container Name | Base Image | Internal Port | Host Port | Purpose |
|---|---|---|---|---|---|
| `postgres` | `hireflow-postgres` | `postgres:16-alpine` | `5432` | `5432` | Primary relational database |
| `backend` | `hireflow-backend` | `eclipse-temurin:21-jre-alpine` | `8080` | `8080` | Spring Boot 3.3.4 REST API & Flyway |
| `frontend` | `hireflow-frontend` | `nginx:1.27-alpine` | `80` | `3000`, `80` | Production React SPA & API reverse proxy |

---

## 3. Persistent Volumes & Data Safety

The `docker-compose.yml` configuration registers two named volumes:

1. `postgres_data`: Persists the PostgreSQL data directory across container restarts.
2. `backend_uploads`: Persists uploaded candidate resumes, transcripts, and company assets.

---

## 4. Verification & Health Monitoring

The compose file establishes healthchecks to ensure correct initialization ordering:

1. `postgres` runs `pg_isready -U hireflow -d hireflow` every 5 seconds.
2. `backend` waits for `postgres` to report healthy before starting its JVM and executing Flyway migrations.
3. `frontend` waits for `backend` to start before opening traffic.

Check container status:
```bash
docker compose ps
```

Stream live application logs:
```bash
# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend

# Database logs
docker compose logs -f postgres
```

---

## 5. Teardown & Clean Reset

To stop the containers:
```bash
docker compose down
```

To stop containers and completely wipe volumes for a clean database re-initialization:
```bash
docker compose down -v
```
