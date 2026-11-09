# H I R E F L O W
### Production-Grade Enterprise Recruitment & Applicant Tracking Platform (ATS)

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue.svg)](.github/workflows/ci.yml)
[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](docker-compose.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## 1. Executive Summary

**HireFlow** is a modern full-stack recruitment management and applicant tracking system (ATS) engineered to support high-throughput hiring operations for growing enterprises. It combines end-to-end recruitment lifecycle tracking, deterministic automated candidate eligibility evaluation, multi-tenant company data isolation, structured interview scorecards, formal job offer management, and passive talent sourcing into a cohesive, portfolio-grade platform.

The system is built as a **Modular Monolith** using Java 21 and Spring Boot on the backend, React 18 with TypeScript on the frontend, and PostgreSQL with Flyway for persistence.

```
Company Registration ➔ Admin Verification ➔ Job Requisition ➔ Candidate Application
       ➔ Automated Eligibility Evaluation ➔ Multi-Stage Review ➔ Structured Interviews
       ➔ Evaluation Scorecard ➔ Offer Issuance ➔ Candidate Decision ➔ Formal Hired
```

---

## 2. Key Capabilities & Architectural Highlights

- **Role-Based Workspaces:** Discrete interfaces and workflows for **Candidate**, **Recruiter**, and **Platform Administrator**.
- **Admin Verification Gate:** Unverified companies cannot publish jobs to candidate job boards until approved by an administrator.
- **Strict Multi-Tenant Isolation:** Enforced on the backend service layer; recruiters are strictly isolated to their affiliated organization's data.
- **Automated Eligibility Screening:** Deterministic evaluation of CGPA, secondary education marks, active backlogs, degrees, branches, and graduation years with configurable strict or advisory enforcement.
- **Deterministic State Machine:** Robust application lifecycle management (`SUBMITTED`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `OFFERED`, `HIRED`, `REJECTED`, `WITHDRAWN`, `OFFER_DECLINED`) with immutable transition history auditing.
- **Structured Interview Scorecards:** Multi-round scheduling, conflict detection, and 5-point evaluation scorecards with hiring recommendations (`STRONG_HIRE`, `HIRE`, `LEANING_HIRE`, `LEANING_REJECT`, `REJECT`).
- **Official Offer Extension:** Salary, start date, expiration terms, and candidate acceptance/decline recording.
- **Sourced Talent Pool & Importer CLI:** Sourced prospect leads management with bulk CSV ingestion and secondary Python 3 importer CLI tool (`hireflow-candidate-importer`).
- **Document Integrity & Upload Security:** Apache Tika MIME-type inspection, SHA-256 integrity checksumming, and size limits on resumes.
- **Defense-in-Depth Authentication:** Short-lived signed JWT access tokens (15-min) and database-backed SHA-256 hashed refresh token rotation.

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Backend Runtime** | Java (LTS) | 21 | High-throughput, modern language features |
| **Backend Framework** | Spring Boot | 3.3.4 | Dependency injection, security, REST controllers |
| **Security & Auth** | Spring Security / JJWT | 0.12.6 | JWT token signing, refresh token rotation, BCrypt |
| **ORM & Data** | Spring Data JPA / Hibernate | 6.5 | Object-relational mapping, transactional boundaries |
| **Database Engine** | PostgreSQL | 16 | Relational persistence, foreign keys, indexes |
| **Schema Migrations** | Flyway | 10.x | Deterministic versioned database migrations |
| **API Documentation** | Springdoc OpenAPI | 2.6.0 | Swagger UI interactive API explorer |
| **Frontend Runtime** | Node.js / Vite | 5.4 | Fast HMR dev server & optimized production bundling |
| **Frontend Framework**| React / TypeScript | 18.3 / 5.6 | Strongly typed component architecture |
| **Server State** | TanStack Query | v5 | Client cache, background polling, query invalidation |
| **Styling** | Tailwind CSS | 3.4 | Responsive, clean enterprise styling |
| **Orchestration** | Docker & Compose | 3.8+ | Multi-container local orchestration |
| **Secondary Tool** | Python 3 / pytest | 3.10+ | Standalone applicant import CLI with 9 unit tests |

---

## 4. Quick Start Guide

### Option A: Complete Stack via Docker Compose (Recommended)

Start PostgreSQL, the Spring Boot backend, and the React frontend in one command:

```bash
docker compose up --build -d
```

- **Frontend Client:** [http://localhost:3000](http://localhost:3000) (or `http://localhost:80`)
- **Backend API & Swagger:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **PostgreSQL Database:** `localhost:5432`

---

### Option B: Local Development Run

#### 1. Start PostgreSQL
```bash
docker run --name hireflow-postgres \
  -e POSTGRES_DB=hireflow \
  -e POSTGRES_USER=hireflow \
  -e POSTGRES_PASSWORD=hireflow_secret_password \
  -p 5432:5432 -d postgres:16-alpine
```

#### 2. Start Spring Boot Backend
```bash
cd backend
mvn clean spring-boot:run
```
*(Backend runs on `http://localhost:8080`)*

#### 3. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

---

## 5. Seeded Demo Accounts

Use any of these pre-seeded local credentials to test role-specific workflows (or click the quick demo buttons on the `/login` page):

| Role | Email | Password | Primary Workflow |
|---|---|---|---|
| **Platform Administrator** | `admin@hireflow.dev` | `AdminPass123!` | Review pending companies, inspect system audit logs |
| **Verified Recruiter (TechCorp)** | `recruiter@techcorp.com` | `RecruiterPass123!` | Post requisitions, progress candidate pipeline, issue offers |
| **Verified Recruiter (InnoSoft)** | `recruiter@innosoft.com` | `RecruiterPass123!` | Sourced talent pool, schedule rounds, manage scorecards |
| **Pending Recruiter (PendingCo)** | `recruiter@pendingco.com` | `RecruiterPass123!` | Create draft jobs awaiting admin organization approval |
| **Candidate (Full Profile)** | `jane.candidate@example.com` | `CandidatePass123!` | Apply for roles, track stages, review and accept offers |
| **Candidate (Junior Profile)** | `john.smith@example.com` | `CandidatePass123!` | Profile setup, resume upload, browse public opportunities |

---

## 6. Automated Test Suites & Verification

The project includes comprehensive automated tests verifying backend business logic, multi-tenant boundaries, CLI tools, and frontend UI components:

```bash
# Backend unit & integration tests (29 tests, 100% pass)
cd backend && mvn test

# Python importer CLI unit tests (9 tests, 100% pass)
cd tools/candidate-importer && pytest -v

# Frontend component tests (15 tests across 5 test suites, 100% pass)
cd frontend && npm test
```

---

## 7. Comprehensive Documentation

Detailed architectural and engineering documentation is available in the [`docs/`](docs/) directory:

- [Architecture Specification](docs/ARCHITECTURE.md) (with Mermaid system & sequence diagrams)
- [Database Design & ER Diagram](docs/DATABASE_DESIGN.md) (schema, indexes, Flyway migrations)
- [API Documentation](docs/API_DOCUMENTATION.md) (complete endpoint reference)
- [Authentication & Security](docs/AUTHENTICATION_AND_SECURITY.md) (JWT, rotation, RBAC, tenant isolation)
- [Business Workflows & State Machine](docs/BUSINESS_WORKFLOWS.md) (lifecycle, eligibility engine, offers)
- [Local Development Setup](docs/LOCAL_SETUP.md) (step-by-step developer guide)
- [Docker & Orchestration Guide](docs/DOCKER_SETUP.md) (container configuration, volumes, logs)
- [AWS Cloud Deployment Guide](docs/AWS_DEPLOYMENT.md) (ECS Fargate, RDS, S3, Secrets Manager)
- [Testing Strategy & Report](docs/TESTING_STRATEGY.md) (coverage, test pyramid)
- [Manual Testing & QA Guide](docs/MANUAL_TESTING_GUIDE.md) (step-by-step test paths for all roles & edge cases)
- [Known Limitations & Roadmap](docs/KNOWN_LIMITATIONS.md) (tradeoffs, future work)
- [Developer Contribution Guide](docs/DEVELOPMENT_GUIDE.md) (coding standards, branching)
