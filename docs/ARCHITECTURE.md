# HireFlow Architecture Specification

## 1. High-Level System Architecture

HireFlow is an enterprise recruitment management and applicant tracking platform (ATS) architected as a **Modular Monolith**. It pairs a high-throughput Java 21 / Spring Boot 3.3 core with a reactive TypeScript / React 18 single-page application and a relational PostgreSQL persistence engine.

```mermaid
flowchart TD
    subgraph Client Tier
        SPA["React 18 + TypeScript SPA<br/>(Tailwind CSS, TanStack Query, Vite)"]
        CLI["Python 3 Talent Importer CLI<br/>(hireflow-candidate-importer)"]
    end

    subgraph Edge & Ingress
        NGINX["Nginx Alpine Reverse Proxy<br/>(:80, /api/v1/*, SPA Fallback)"]
    end

    subgraph Application Tier [Spring Boot 3.3.4 Modular Monolith]
        SEC["Spring Security Filter Chain<br/>(JWT Auth, Refresh Token Rotation, Tenant Isolation)"]
        
        subgraph Business Domain Modules
            AUTH["auth<br/>(Authentication & Tokens)"]
            USER["user<br/>(User & RBAC)"]
            COMP["company<br/>(Organization & Approval)"]
            CAND["candidate<br/>(Profiles, Education, Documents)"]
            JOB["job<br/>(Requisitions & Eligibility)"]
            APP["application<br/>(Pipeline State Machine & Rules)"]
            INTV["interview<br/>(Schedules & Scorecards)"]
            OFR["offer<br/>(Offers & Negotiations)"]
            TP["talentpool<br/>(Leads & CSV Ingestion)"]
            NOTIF["notification<br/>(In-App Event Dispatch)"]
            AUDIT["audit<br/>(Immutable Event Sinks)"]
        end
    end

    subgraph Data & Storage Tier
        PG[("PostgreSQL 16 Engine<br/>(Normalized Schema, Flyway Migrations)")]
        FS[("Document Storage Service<br/>(Local Sandbox / AWS S3 Ready)")]
    end

    SPA -->|HTTPS / JSON| NGINX
    CLI -->|REST API / Bearer Token| NGINX
    NGINX -->|Reverse Proxy / HTTP| SEC
    SEC --> AUTH & USER & COMP & CAND & JOB & APP & INTV & OFR & TP & NOTIF & AUDIT
    
    AUTH & USER & COMP & CAND & JOB & APP & INTV & OFR & TP & NOTIF & AUDIT -->|Spring Data JPA / Hibernate| PG
    CAND -->|Resumes & Transcripts| FS
```

---

## 2. Component Breakdown

### 2.1 Backend Core (`backend/`)
- **Runtime:** Java 21 (LTS) on Eclipse Temurin JRE.
- **Framework:** Spring Boot 3.3.4.
- **Data Access:** Spring Data JPA with Hibernate ORM and HikariCP connection pooling.
- **Database Migrations:** Flyway versioned migrations (`V1__init_schema.sql`, `V2__seed_skills.sql`).
- **Security:** Spring Security 6 stateless filter chain using RFC 7519 JWT access tokens and database-backed SHA-256 hashed refresh tokens.
- **File Parsing & Security:** Apache Tika for MIME-type validation and SHA-256 checksumming for uploaded candidate documents.
- **Documentation:** Springdoc OpenAPI 3.0 generating interactive Swagger UI at `/swagger-ui/index.html`.

### 2.2 Frontend Client (`frontend/`)
- **Runtime:** Node.js 20+ with Vite dev server and production bundler.
- **Language:** TypeScript 5.x with strict type checking.
- **State Management:** TanStack Query v5 for server-side cache management, automatic background refetching, and query invalidation.
- **Form Architecture:** React Hook Form and Zod schemas for client-side form validation.
- **Styling:** Tailwind CSS with utility-first responsive layout and custom color palette.
- **Icons:** Lucide React icons.

### 2.3 Secondary Tooling (`tools/candidate-importer/`)
- **CLI Utility:** Python 3.10+ command-line applicant ingestion script with regex-based data validation, duplicate avoidance, and dry-run reporting.

---

## 3. Module Communication & Boundaries

1. **Strict Tenant Isolation:**
   - Every multi-tenant entity (`job_postings`, `applications`, `interviews`, `offers`, `talent_leads`) is partitioned by `company_id`.
   - Recruiters are bound to a verified company via the `recruiter_companies` mapping table.
   - Controllers and services enforce company-level access control on the backend: a recruiter can only view, mutate, or query records belonging to their affiliated organization. Cross-company access attempts immediately result in `403 Forbidden`.

2. **Domain Boundaries without Circular Dependencies:**
   - Modules interact through clean service interfaces and application events.
   - For example, when an `Application` changes state to `SHORTLISTED`, the `ApplicationService` records an entry in `application_status_history`, publishes an in-app `Notification`, and logs an immutable `AuditLog` entry.

3. **Transaction Management:**
   - Critical lifecycle operations (e.g. application submission, candidate offer acceptance, company approval) run under `@Transactional(isolation = Isolation.READ_COMMITTED)`.
   - If an error occurs during multi-step state transitions, transactions rollback cleanly to prevent partial records.

---

## 4. Request Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client / Recruiter
    participant SecFilter as JwtAuthenticationFilter
    participant Controller as RecruiterApplicationController
    participant Service as ApplicationService
    participant StateMachine as ApplicationStateMachine
    participant Repo as ApplicationRepository
    participant Audit as AuditService
    participant DB as PostgreSQL

    Client->>SecFilter: POST /api/v1/recruiter/applications/{id}/status (Bearer JWT)
    SecFilter->>SecFilter: Validate JWT signature & claims
    SecFilter->>Controller: Authenticated RequestContext (ROLE_RECRUITER)
    Controller->>Service: updateApplicationStatus(appId, newStatus, notes)
    Service->>Repo: findById(appId)
    Repo->>DB: SELECT * FROM applications WHERE id = ?
    DB-->>Repo: Application Record
    Service->>Service: Verify recruiterCompanyId == app.getCompanyId()
    Service->>StateMachine: validateTransition(currentStatus, newStatus)
    StateMachine-->>Service: OK (Valid Transition)
    Service->>Repo: Update status and save status history
    Repo->>DB: UPDATE applications ... INSERT INTO application_status_history ...
    Service->>Audit: logEvent("APPLICATION_STATUS_CHANGED", appId, ...)
    Audit->>DB: INSERT INTO audit_logs ...
    Service-->>Controller: ApplicationDto
    Controller-->>Client: 200 OK (ApiResponse<ApplicationDto>)
```
