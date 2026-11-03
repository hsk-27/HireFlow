# HireFlow Developer Guide & Contribution Standards

This guide establishes the coding conventions, domain package structures, and development practices required when modifying or extending HireFlow.

---

## 1. Backend Engineering Guidelines (Java 21 / Spring Boot)

### 1.1 Package by Business Domain
Always place new functionality in its appropriate business package (`com.hireflow.<module>`) rather than grouping by layer (e.g., avoid putting all controllers in one monolithic package).

### 1.2 Invariants & Invariant Enforcement
- Controllers must never perform business logic; they only validate DTO annotations (`@Valid`) and delegate to services.
- Always use DTOs for incoming and outgoing data; never serialize Hibernate entities directly to HTTP responses.
- Enforce business rules and multi-tenant authorization inside the service layer (`@Service`).
- Operations spanning multiple tables or state transitions must be annotated with `@Transactional`.

### 1.3 Exception Handling
- Throw specific subclasses of `ApiException` (e.g. `ResourceNotFoundException`, `ConflictException`, `ForbiddenException`, `InvalidStateTransitionException`).
- The `GlobalExceptionHandler` will automatically transform them into standardized `ApiResponse<T>` error structures with appropriate HTTP status codes.

---

## 2. Frontend Engineering Guidelines (React 18 / TypeScript / Tailwind)

### 2.1 Component Structure
- Reusable UI atoms reside in `src/components/common/`.
- Domain pages reside in `src/features/<domain>/`.
- Centralized API methods reside in `src/services/apiServices.ts`.

### 2.2 Server-State Management (TanStack Query)
- Use descriptive query keys: `['recruiter-jobs', page, statusFilter]`.
- Always invalidate related queries on mutations: `queryClient.invalidateQueries({ queryKey: ['candidate-applications'] })`.
- Never store API responses in Redux or global state when TanStack Query already caches server state.

### 2.3 Styling Standards
- Use Tailwind CSS utility classes.
- Ensure responsive design (`sm:`, `md:`, `lg:` breakpoints).
- Maintain consistent interactive states: hover, focus, disabled, and loading.

---

## 3. Git Workflow & Branch Conventions

- `main`: Production-ready release branch.
- `develop`: Integration branch.
- `feature/<name>`: New domain feature (e.g. `feature/assessment-module`).
- `bugfix/<name>`: Bug resolution (e.g. `bugfix/interview-timezone`).
- `chore/<name>`: Dependency updates, CI/CD, documentation.
