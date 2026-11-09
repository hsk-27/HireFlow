# HireFlow Local Development Setup Guide

Follow this guide to run HireFlow locally on your development workstation.

---

## 1. Prerequisites

Ensure you have the following runtimes installed:
- **Java:** JDK 21 (or newer, verified on JDK 21 and JDK 23)
- **Maven:** 3.9+
- **Node.js:** 20.x or 22.x+ (with `npm`)
- **Python:** 3.10+ (for secondary candidate-importer utility)
- **Database:** PostgreSQL 16+ running locally, OR Docker to run PostgreSQL in a container

---

## 2. Clone & Environment Configuration

Copy the sample environment file in the repository root:

```bash
cp .env.example .env
```

Review the values in `.env`:
```ini
# Database
POSTGRES_DB=hireflow
POSTGRES_USER=hireflow
POSTGRES_PASSWORD=hireflow_secret_password
POSTGRES_PORT=5432

# Backend Security
HIREFLOW_JWT_SECRET=c2VjdXJlLWhpcmVmbG93LXByb2R1Y3Rpb24tand0LXNpZ25pbmcta2V5LTUxc2VjcmV0LWtleQ==
HIREFLOW_JWT_EXPIRATION_MS=900000
HIREFLOW_JWT_REFRESH_EXPIRATION_MS=604800000

# Document Storage
HIREFLOW_STORAGE_TYPE=local
HIREFLOW_STORAGE_LOCAL_BASE_PATH=./uploads
```

---

## 3. Database Initialization

### Option A: Using Docker for PostgreSQL (Recommended)
```bash
docker run --name hireflow-postgres \
  -e POSTGRES_DB=hireflow \
  -e POSTGRES_USER=hireflow \
  -e POSTGRES_PASSWORD=hireflow_secret_password \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Option B: Local PostgreSQL Installation
Ensure the `hireflow` database exists and is accessible:
```sql
CREATE USER hireflow WITH PASSWORD 'hireflow_secret_password';
CREATE DATABASE hireflow OWNER hireflow;
GRANT ALL PRIVILEGES ON DATABASE hireflow TO hireflow;
```

---

## 4. Launching the Backend

From the `backend/` directory:

```bash
cd backend
mvn clean spring-boot:run
```

- Flyway will automatically execute database migrations (`V1__init_schema.sql`, `V2__seed_skills.sql`).
- `DataInitializer.java` will seed default demo companies, users, jobs, applications, and interviews.
- The backend listens on `http://localhost:8080`.
- Swagger UI interactive API documentation is available at:  
  `http://localhost:8080/swagger-ui/index.html`

To run the automated backend test suite:
```bash
mvn test
```

---

## 5. Launching the Frontend

From the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will start at:  
`http://localhost:5173`

To build the production bundle:
```bash
npm run build
```

To run the Vitest frontend unit tests:
```bash
npm test
```

---

## 6. Pre-Configured Demo Accounts

You can sign in immediately using any of the following seeded local accounts (or use the one-click demo credentials buttons on `/login`):

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Platform Administrator** | `admin@hireflow.dev` | `AdminPass123!` | Review/approve companies, inspect immutable audit logs |
| **Verified Recruiter (TechCorp)** | `recruiter@techcorp.com` | `RecruiterPass123!` | Manage requisitions, evaluate candidate pipeline, schedule interviews, issue offers |
| **Verified Recruiter (InnoSoft)** | `recruiter@innosoft.com` | `RecruiterPass123!` | Sourced talent pool, schedule rounds, manage scorecards |
| **Pending Recruiter (PendingCo)** | `recruiter@pendingco.com` | `RecruiterPass123!` | Draft jobs for a pending company awaiting admin review |
| **Candidate (Jane Doe)** | `jane.candidate@example.com` | `CandidatePass123!` | Browse openings, submit applications, manage profile, respond to offers |
| **Candidate (John Smith)** | `john.smith@example.com` | `CandidatePass123!` | Junior profile, browse public openings, submit resumes |

---

## 7. Running the Python Candidate Importer Utility

The candidate importer CLI is located in `tools/candidate-importer/`:

```bash
cd tools/candidate-importer

# Install pytest
pip install -r requirements.txt

# Run test suite
pytest -v

# Perform dry-run import on sample data
python import_candidates.py --file sample_candidates.csv --dry-run
```
