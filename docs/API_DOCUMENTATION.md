# HireFlow API Documentation

HireFlow exposes a versioned RESTful API under the `/api/v1` namespace. All request and response bodies use JSON encoding (except multipart file uploads). All timestamp properties use ISO 8601 UTC format (`YYYY-MM-DDTHH:mm:ssZ`).

Interactive Swagger UI documentation is available at runtime at:  
`http://localhost:8080/swagger-ui/index.html` (or through the frontend proxy at `/swagger-ui/index.html`).

---

## 1. Global Response & Error Schemas

### 1.1 Success Response (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-11-03T10:15:30Z"
}
```

### 1.2 Paginated Success Response (`ApiResponse<PagedResponse<T>>`)
```json
{
  "success": true,
  "message": "Results retrieved",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 10,
    "totalElements": 42,
    "totalPages": 5,
    "last": false
  },
  "timestamp": "2026-11-03T10:15:30Z"
}
```

### 1.3 Error Response
```json
{
  "success": false,
  "message": "Validation failed on incoming request payload",
  "data": null,
  "errors": {
    "email": "Must be a valid email address",
    "password": "Password must be at least 8 characters long"
  },
  "timestamp": "2026-11-03T10:15:30Z"
}
```

---

## 2. Authentication & Session Endpoints (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register/candidate` | Public | Register new candidate account |
| `POST` | `/auth/register/recruiter` | Public | Register new recruiter & company (status set to `PENDING`) |
| `POST` | `/auth/login` | Public | Authenticate user; returns access token & rotation refresh token |
| `POST` | `/auth/refresh` | Public | Rotate refresh token; returns new access & refresh tokens |
| `POST` | `/auth/logout` | Authenticated | Revoke refresh token and invalidate session |
| `GET` | `/auth/me` | Authenticated | Retrieve authenticated user identity & claims |
| `POST` | `/auth/change-password` | Authenticated | Update user password |

---

## 3. Public Job Board Endpoints (`/api/v1/jobs`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/jobs` | Public | Search published jobs (`keyword`, `location`, `workplaceType`, `employmentType`, `page`, `size`) |
| `GET` | `/jobs/{id}` | Public | Retrieve job details and eligibility screening criteria |

---

## 4. Candidate Portal Endpoints (`/api/v1/candidate`)

Requires `ROLE_CANDIDATE`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/candidate/profile` | Retrieve candidate profile, educations, experiences, and skills |
| `PUT` | `/candidate/profile` | Update professional summary, headline, and external links |
| `POST` | `/candidate/educations` | Add academic record (degrees, branches, CGPA, backlogs) |
| `DELETE` | `/candidate/educations/{id}` | Delete academic record |
| `POST` | `/candidate/experiences` | Add professional work experience |
| `DELETE` | `/candidate/experiences/{id}` | Delete work experience |
| `POST` | `/candidate/skills` | Add technical skill with years of experience |
| `DELETE` | `/candidate/skills/{id}` | Remove technical skill |
| `POST` | `/candidate/documents/resume` | Upload PDF/DOCX resume file (max 10MB, Tika validated) |
| `DELETE` | `/candidate/documents/{id}` | Delete uploaded candidate document |
| `POST` | `/candidate/applications` | Apply for a published job requisition |
| `GET` | `/candidate/applications` | View submitted applications, current stage, and status history |
| `POST` | `/candidate/applications/{id}/withdraw` | Withdraw active application |
| `GET` | `/candidate/interviews` | View upcoming and completed interview schedules |
| `GET` | `/candidate/offers` | View extended employment offers |
| `POST` | `/candidate/offers/{id}/accept` | Accept job offer (sets application to `HIRED`) |
| `POST` | `/candidate/offers/{id}/decline` | Decline job offer with feedback |

---

## 5. Recruiter Operations Endpoints (`/api/v1/recruiter`)

Requires `ROLE_RECRUITER` and company association. All endpoints enforce tenant isolation.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/recruiter/jobs` | List company job requisitions (paged, filterable by status) |
| `POST` | `/recruiter/jobs` | Create requisition with automated eligibility rules |
| `GET` | `/recruiter/jobs/{id}` | Get requisition details |
| `PATCH` | `/recruiter/jobs/{id}/status` | Update requisition status (`PUBLISHED`, `CLOSED`, `ARCHIVED`) |
| `GET` | `/recruiter/applications` | View company candidate pipeline (`jobId`, `status`, pagination) |
| `GET` | `/recruiter/applications/{id}` | Inspect applicant details, eligibility audit, and history |
| `PATCH` | `/recruiter/applications/{id}/status` | Transition application stage (`UNDER_REVIEW`, `SHORTLISTED`, etc.) |
| `GET` | `/recruiter/interviews` | View scheduled company interviews |
| `POST` | `/recruiter/interviews` | Schedule candidate interview round |
| `POST` | `/recruiter/interviews/{id}/feedback` | Submit 5-point evaluation scorecard & recommendation |
| `POST` | `/recruiter/interviews/{id}/cancel` | Cancel interview round with reason |
| `GET` | `/recruiter/offers` | List issued company job offers |
| `POST` | `/recruiter/offers` | Extend official job offer |
| `POST` | `/recruiter/offers/{id}/withdraw` | Withdraw active offer |
| `GET` | `/recruiter/talent-pool/leads` | List sourced leads |
| `POST` | `/recruiter/talent-pool/leads` | Manually add sourced lead |
| `POST` | `/recruiter/talent-pool/import` | Bulk ingest leads from CSV file |
| `PATCH` | `/recruiter/talent-pool/leads/{id}/status` | Update lead status (`CONTACTED`, `CONVERTED`, etc.) |

---

## 6. Company Management Endpoints (`/api/v1/companies`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/companies/me` | Recruiter | Retrieve authenticated recruiter's organization profile |
| `PUT` | `/companies/me` | Recruiter | Update organization profile details |
| `GET` | `/companies/me/status` | Recruiter | Check organization approval and verification status |

---

## 7. Platform Administration Endpoints (`/api/v1/admin`)

Requires `ROLE_ADMIN`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/companies` | List all registered employer organizations |
| `POST` | `/admin/companies/{id}/approve` | Approve company registration (enables job publishing) |
| `POST` | `/admin/companies/{id}/reject` | Reject company registration with justification |
| `POST` | `/admin/companies/{id}/suspend` | Suspend company hiring rights |
| `GET` | `/admin/audit-logs` | Filter and paginate immutable system audit logs |

---

## 8. In-App Notification Endpoints (`/api/v1/notifications`)

Requires authenticated user.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/notifications` | List user notifications (`unreadOnly=true` filter) |
| `GET` | `/notifications/unread-count` | Polling endpoint for unread badge count |
| `PATCH` | `/notifications/{id}/read` | Mark individual notification as read |
| `PATCH` | `/notifications/read-all` | Mark all user notifications as read |
