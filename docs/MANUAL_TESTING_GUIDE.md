# HireFlow Manual Testing & Quality Assurance Guide

This guide provides a comprehensive, step-by-step procedure for manually verifying the HireFlow platform. It covers all user roles, end-to-end recruitment lifecycles, administrative governance, passive talent sourcing, security controls, and negative/edge-case tests.

---

## 1. Environment Startup

### Option A: Complete Docker Compose Stack (Single Command)
```bash
docker compose up --build -d
```
- **Web Application:** [http://localhost:3000](http://localhost:3000) (or `http://localhost:80`)
- **Backend API & Swagger:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Database:** `localhost:5432` (`hireflow` / `hireflow_secret_password`)

### Option B: Local Development Execution
1. **Start PostgreSQL:**
   ```bash
   docker run --name hireflow-postgres -e POSTGRES_DB=hireflow -e POSTGRES_USER=hireflow -e POSTGRES_PASSWORD=hireflow_secret_password -p 5432:5432 -d postgres:16-alpine
   ```
2. **Start Backend (Java 21 / Spring Boot):**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *(Listens on `http://localhost:8080`)*
3. **Start Frontend (React 18 / Vite):**
   ```bash
   cd frontend
   npm run dev
   ```
   *(Listens on `http://localhost:5173`)*

---

## 2. Seeded Test Credentials Cheat Sheet

The database is pre-seeded with realistic data across all roles. You can click the one-click demo buttons on `/login` or use:

| Role | Email | Password | Pre-configured Data |
|---|---|---|---|
| **Platform Administrator** | `admin@hireflow.dev` | `AdminPass123!` | System audit logs, PendingCo awaiting verification |
| **Verified Recruiter** | `recruiter@techcorp.com` | `RecruiterPass123!` | TechCorp (Approved), active jobs, active candidate pipelines |
| **Pending Recruiter** | `recruiter@pendingco.com` | `RecruiterPass123!` | PendingCo (Pending), cannot publish until admin verifies |
| **Active Candidate** | `jane.candidate@example.com` | `CandidatePass123!` | 100% complete profile, sample resume, active applications |
| **Junior Candidate** | `john.smith@example.com` | `CandidatePass123!` | Basic profile, available to apply for open roles |

---

## 3. End-to-End Test Scenarios

### Scenario 1: Platform Administrator Verification & Audit Logging
**Goal:** Verify administrative governance, company verification gate, and immutable audit trails.

1. Navigate to `/login` and sign in as **Platform Administrator** (`admin@hireflow.dev`).
2. You will land on the **Platform Administration Console** (`/admin`):
   - Verify summary metric cards (Pending Approvals, Verified Companies, Total Audit Events).
3. Click **"Review pending companies"** (`/admin/companies?status=PENDING`):
   - You should see **PendingCo** listed with `PENDING` status.
4. Click **"Approve"**:
   - Verify the company badge immediately updates to green `APPROVED`.
5. Click the **"System Security & Audit"** tab (`/admin/audit-logs`):
   - Verify a new audit log entry `COMPANY_APPROVED` has been recorded.
   - Test filtering by action: type `COMPANY` in the filter box and verify matching events appear.
6. Return to `/admin/companies`:
   - Click **"Suspend"** on a company, enter a justification reason, and confirm.
   - Verify the company status changes to `SUSPENDED` and an audit entry is created.

---

### Scenario 2: Recruiter Job Posting & Hiring Pipeline Progression
**Goal:** Verify job requisition, cloning, strict eligibility criteria, Kanban pipeline view, applicant review, interview rounds, and offer extension.

1. Sign in as **Verified Recruiter** (`recruiter@techcorp.com`).
2. Navigate to **Job Openings** (`/recruiter/jobs`):
   - Click **"Post New Job"**.
   - Enter Job Title: `Senior Distributed Systems Architect`, Department: `Engineering`, Location: `San Francisco, CA (Hybrid)`.
   - Set Minimum Experience: `5 years`, Base Salary: `$160,000 - $210,000`.
   - Configure **Academic & Experience Eligibility Criteria**:
     - Minimum CGPA: `7.5`
     - Maximum Active Backlogs: `0`
     - Eligible Degrees: `B.Tech`, `M.Tech`, `B.S.`
     - Eligible Branches: `Computer Science`, `Software Engineering`
   - Save the job as `DRAFT`.
3. On the job row, test the **Requisition Actions**:
   - Click **"Clone"**: verify that a new creation modal opens pre-filled with all details and criteria from the requisition.
   - Click **"Publish"**: verify status transitions from `DRAFT` to `PUBLISHED`.
   - Test the real-time search input: search by title or department.
4. Navigate to **Candidate Pipeline** (`/recruiter/applications`):
   - **Kanban Board vs List View:** Toggle between `List View` and `Pipeline Board`. Notice the 6 columnar hiring stages (`Submitted`, `Under Review`, `Shortlisted`, `Interview`, `Offered`, `Hired`) with live candidate counts.
   - **Search & Filters:** Search by candidate name or email in real time; filter by Automated Eligibility status (`Eligible`, `Review Required`, `Ineligible`).
   - **Export CSV:** Click the **"Export CSV"** button and verify your browser downloads the full pipeline spreadsheet report.
   - Click on any applicant card/row to open the **Applicant Review Drawer**:
     - Verify candidate CGPA, education, experience, and uploaded resume.
     - Verify the **Automated Eligibility Status** badge (`ELIGIBLE`).
5. Progress the candidate's stage:
   - Change stage from `UNDER_REVIEW` to `SHORTLISTED`.
   - Change stage from `SHORTLISTED` to `INTERVIEW`.
6. Navigate to **Interviews** (`/recruiter/interviews`):
   - Click **"Schedule Interview"**:
     - Select Round Type: `TECHNICAL`.
     - Round Number: `1`.
     - Date & Time: Tomorrow at 2:00 PM.
     - Meeting Link: `https://meet.google.com/abc-defg-hij`.
   - Click **"Save Schedule"** and verify the interview card appears under Scheduled.
7. Submit Interview Feedback Scorecard:
   - Click **"Submit Scorecard"** on the scheduled interview:
     - Technical Score: `5/5`
     - Communication Score: `4/5`
     - Problem Solving Score: `5/5`
     - Recommendation: `STRONG_HIRE`
     - Detailed Notes: *"Exceptional architectural design and problem-solving skills."*
   - Submit scorecard. Verify status changes to `COMPLETED`.
8. Extend Formal Job Offer:
   - Navigate to **Offers** (`/recruiter/offers`).
   - Click **"Extend Offer"**:
     - Select the interviewed candidate application.
     - Base Salary: `$185,000 USD`.
     - Start Date: Next month.
     - Expiration Date: 14 days from today.
     - Benefits & Terms: *"Full medical, 401(k) 6% match, remote equipment stipend."*
   - Click **"Issue Formal Offer"**. Verify offer status shows `OFFERED`.

---

### Scenario 3: Candidate Application, Interview & Offer Acceptance
**Goal:** Verify candidate application submission, document management, stage progress stepper, and offer acceptance.

1. Sign in as **Active Candidate** (`jane.candidate@example.com`).
2. Navigate to **Job Board** (`/jobs`):
   - Search for `Senior Distributed Systems Architect`.
   - Click **"View Details"**.
   - Review description and criteria.
   - Click **"Apply Now"**:
     - Cover Letter: *"I would love to contribute to TechCorp's high-scale distributed systems."*
     - Confirm your stored resume is attached.
     - Click **"Submit Application"**.
3. Navigate to **My Applications** (`/candidate/applications`):
   - Notice the **6-Step Visual Application Stepper** on each application card (`Submitted` ➔ `Under Review` ➔ `Shortlisted` ➔ `Interview` ➔ `Offer Extended` ➔ `Hired`), indicating exactly where your candidacy stands with live highlight states.
   - Click to expand application timeline, status history, and job details.
4. Check **Notifications** (bell icon in top navbar):
   - Verify notification alerts have arrived for interview scheduling and offer extensions.
   - Click **"Mark as Read"**.
5. Navigate to **My Offers** (`/candidate/offers`):
   - You should see the formal employment offer from TechCorp.
   - Click **"Review Offer Details"**: inspect salary, benefits, and expiry date.
   - Click **"Accept Offer"**:
     - Confirm modal acceptance.
     - Verify status changes to green `ACCEPTED`.
     - Verify your application status changes to `HIRED`!
     - Verify status changes to green `ACCEPTED`.
     - Verify your application status changes to `HIRED`!

---

### Scenario 4: Recruiter Talent Pool Sourcing & CSV Ingestion
**Goal:** Verify passive lead management, pipeline updates, and bulk CSV ingestion.

1. Sign in as **Verified Recruiter** (`recruiter@techcorp.com`).
2. Navigate to **Talent Pool** (`/recruiter/talent-pool`):
   - Click **"Add Prospect Lead"**:
     - Full Name: `Linus Torvalds`
     - Email: `linus@kernel.test`
     - Title: `Chief Architect`
     - Years of Experience: `25`
     - Skills: `C, Linux, Git, Operating Systems`
   - Click **"Save Lead"**. Verify it appears with `NEW` status.
3. Update Lead Status:
   - Change status to `CONTACTED` or `INVITED`.
4. Bulk CSV Ingestion:
   - Click **"Import CSV"**.
   - Select `tools/candidate-importer/sample_candidates.csv`.
   - Click **"Start Upload"**.
   - Verify the import report displays total processed, imported count, and skipped duplicates.
   - Verify newly imported leads populate the talent directory.

---

### Scenario 5: Secondary Tool Importer CLI Testing
**Goal:** Verify the standalone Python candidate validation and import tool.

1. Open a terminal in `tools/candidate-importer`:
   ```bash
   cd tools/candidate-importer
   ```
2. Run automated validation tests:
   ```bash
   pytest -v
   ```
   *(9 tests run and pass in ~0.5s)*
3. Execute dry-run validation on sample data:
   ```bash
   python import_candidates.py --file sample_candidates.csv --dry-run
   ```
   - Verify summary table displays valid rows and invalid row exclusions without side-effects.

---

### Scenario 6: Security, Isolation & Negative Edge Cases
**Goal:** Verify defensive backend controls and boundary enforcement.

| Test Case | Procedure | Expected System Behavior |
|---|---|---|
| **Cross-Tenant Isolation** | Sign in as Recruiter A (`recruiter@innosoft.com`) and attempt to access or modify TechCorp's applications or talent pool leads via API. | Server returns `404 Not Found` or `403 Forbidden`. |
| **Unapproved Company Gate** | Sign in as Pending Recruiter (`recruiter@pendingco.com`) and try to publish a job. | System blocks publishing with error: *"Company must be approved by platform administrator before publishing jobs."* |
| **Duplicate Applications** | Apply to the same job opening twice as the same candidate. | Application is rejected with `409 Conflict`: *"You have already submitted an application for this position."* |
| **Invalid Enum Values** | Call `PATCH /api/v1/recruiter/talent-pool/leads/{id}/status?status=INVALID_STATUS`. | Server returns `400 Bad Request`: *"Invalid value 'INVALID_STATUS' for parameter 'status'"*. |
| **Malformed Credentials** | Submit incorrect password on `/api/v1/auth/login`. | Server returns `401 Unauthorized`: *"Invalid email or password"*. |
| **Non-Admin RBAC Block** | As a Candidate or Recruiter, attempt to access `/api/v1/admin/companies`. | Server returns `403 Forbidden`: *"Access denied: you do not have permission to access this resource"*. |
| **Oversized Document Upload** | Attempt to upload a resume larger than 10MB. | Server returns `413 Payload Too Large`. |

---

### Scenario 7: Interactive API Verification via Swagger UI
1. Open [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html).
2. Authenticate:
   - Call `POST /api/v1/auth/login` with `admin@hireflow.dev` / `AdminPass123!`.
   - Copy the returned `accessToken`.
   - Click the green **Authorize** button at the top of Swagger UI and enter `Bearer <YOUR_TOKEN>`.
3. Test endpoints interactively (e.g., `GET /api/v1/admin/audit-logs`, `GET /api/v1/jobs`, `GET /api/v1/companies/me`).
