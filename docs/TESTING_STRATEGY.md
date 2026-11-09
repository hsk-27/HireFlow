# HireFlow Automated Testing Strategy & Verification Report

HireFlow enforces rigorous automated testing across all system tiers, ensuring that business invariants, multi-tenant boundaries, and state transitions are verified programmatically.

---

## 1. Testing Pyramid Overview

```text
               / \
              / E2E \              (Playwright Browser Workflows)
             /-------\
            /  Integ  \            (Spring Boot Test + Flyway + PostgreSQL/H2)
           /-----------\
          /  Unit Tests \          (JUnit 5, Mockito, Vitest, pytest)
         /---------------\
```

---

## 2. Test Suites by Component

### 2.1 Backend Tests (Java 21 / Spring Boot / JUnit 5)
Located in `backend/src/test/java/com/hireflow/`:

| Test Class | Focus Area | Test Count | Status |
|---|---|---|---|
| `ApplicationStateMachineTest` | Valid transitions, candidate offer acceptance/rejection, illegal status jumps, terminal state checks | 11 | **PASSED** |
| `EligibilityEvaluationServiceTest` | CGPA boundaries, backlogs check, degree and branch white-listing | 4 | **PASSED** |
| `TenantIsolationTest` | Verifies cross-company data access prevention (`ForbiddenException`) | 1 | **PASSED** |
| `AuthServiceTest` | Password verification, JWT generation, refresh token rotation & revocation | 4 | **PASSED** |
| `InterviewServiceTest` | Interview scheduling, round ordering, feedback scorecard recording | 2 | **PASSED** |
| `AuthControllerIntegrationTest` | Full candidate & recruiter auth, login, refresh-token rotation, password change, 401 rejection | 3 | **PASSED** |
| `RecruitmentLifecycleIntegrationTest` | Full end-to-end recruitment pipeline (company approval → job publication → application → eligibility → interview → offer → hire) | 1 | **PASSED** |
| `AdminCompanyIntegrationTest` | Administrative governance: approvals, rejections with justification, suspensions, audit trail verification, RBAC guards | 2 | **PASSED** |
| `TalentPoolIntegrationTest` | Manual lead sourcing, multipart CSV ingestion with deduplication, status updates, tenant isolation, 400 Bad Request enum validation | 1 | **PASSED** |
| **Total Backend Tests** | | **29** | **100% PASS** |

### 2.2 Secondary Tool Tests (Python 3 / pytest)
Located in `tools/candidate-importer/tests/`:

| Test Function | Invariant Verified | Status |
|---|---|---|
| `test_validate_email` | Standard and invalid email regex format checking | **PASSED** |
| `test_validate_phone` | International and domestic phone number parsing | **PASSED** |
| `test_validate_experience` | Numerical experience validation, negative number handling | **PASSED** |
| `test_valid_csv` | Successful end-to-end processing of well-formed candidate CSV | **PASSED** |
| `test_missing_required_columns` | Header mismatch and required field missing error detection | **PASSED** |
| `test_invalid_email_and_experience` | Segregation of invalid records into failure reports | **PASSED** |
| `test_duplicate_records_in_csv` | In-file duplicate email deduplication | **PASSED** |
| `test_empty_file` | Graceful error handling for empty CSV files | **PASSED** |
| `test_unicode_names` | UTF-8 international character encoding support | **PASSED** |
| **Total Importer Tests** | | **9** | **100% PASS** |

### 2.3 Frontend Tests (React 18 / TypeScript / Vitest)
Located in `frontend/src/components/common/__tests__/`:

| Test Suite | Assertions Verified | Status |
|---|---|---|
| `Button.test.tsx` | Child text rendering, loading spinner state, variant styling (`danger`, `outline`) | **PASSED** |
| `Badge.test.tsx` | Variant styling (`primary`, `success`, `warning`, `danger`, `info`, `neutral`) | **PASSED** |
| `StatusBadge.test.tsx` | Label normalization, color-coded variants across application, offer, and company states | **PASSED** |
| `Modal.test.tsx` | Open/closed rendering, title and children display, backdrop click, Escape key listener | **PASSED** |
| `Pagination.test.tsx` | Boundary conditions (hidden if totalPages <= 1), previous/next page button disabling and events | **PASSED** |
| **Total Frontend Tests** | | **15** | **100% PASS** |

---

## 3. Running Automated Tests Locally

### Run All Backend Tests
```bash
cd backend
mvn test
```

### Run Python Importer Tests
```bash
cd tools/candidate-importer
pytest -v
```

### Run Frontend Vitest Tests
```bash
cd frontend
npm test
```

---

## 4. Continuous Integration Pipeline (GitHub Actions)

A multi-job GitHub Actions workflow (`.github/workflows/ci.yml`) automatically executes on every commit and pull request:
1. **`backend-test`**: Sets up JDK 21, caches Maven repository, builds `jar`, and executes JUnit tests.
2. **`frontend-test`**: Sets up Node.js 20, runs `npm ci`, runs TypeScript type check (`tsc`), builds production bundle, and executes Vitest test suite.
3. **`python-importer-test`**: Sets up Python 3.11, installs dependencies, and runs `pytest`.
