package com.hireflow.application;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.response.PagedResponse;
import com.hireflow.common.security.SecurityUtils;
import com.hireflow.user.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruiter/applications")
@Tag(name = "Recruiter Applications", description = "Candidate application review, status pipeline, and candidate management")
@PreAuthorize("hasRole('RECRUITER')")
public class RecruiterApplicationController {

    private final ApplicationService applicationService;

    public RecruiterApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    @Operation(summary = "Search and filter candidate applications for current company")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationDto>>> getApplications(
            @RequestParam(required = false) UUID jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) EligibilityStatus eligibilityStatus,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "submittedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(applicationService.getRecruiterApplications(recruiterUserId, jobId, status, eligibilityStatus, search, pageable))
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application details for company recruiter review")
    public ResponseEntity<ApiResponse<ApplicationDto>> getApplicationDetail(@PathVariable UUID id) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getRecruiterApplicationDetail(id, recruiterUserId)));
    }

    @PostMapping("/{id}/transition")
    @Operation(summary = "Perform validated status transition on applicant")
    public ResponseEntity<ApiResponse<ApplicationDto>> transitionStatus(
            @PathVariable UUID id,
            @Valid @RequestBody TransitionStatusRequest request
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        ApplicationDto updated = applicationService.transitionStatus(
                id, recruiterUserId, Role.RECRUITER, request.newStatus(), request.reason()
        );
        return ResponseEntity.ok(ApiResponse.success(updated, "Application moved to " + request.newStatus()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update application status (supports query params or request body)")
    public ResponseEntity<ApiResponse<ApplicationDto>> updateStatus(
            @PathVariable UUID id,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String notes,
            @RequestBody(required = false) TransitionStatusRequest body
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        ApplicationStatus targetStatus = status != null ? status : (body != null ? body.newStatus() : null);
        String targetReason = notes != null ? notes : (body != null ? body.reason() : "Recruiter updated status");
        if (targetStatus == null) {
            throw new IllegalArgumentException("Target status must be provided");
        }
        ApplicationDto updated = applicationService.transitionStatus(
                id, recruiterUserId, Role.RECRUITER, targetStatus, targetReason
        );
        return ResponseEntity.ok(ApiResponse.success(updated, "Application moved to " + targetStatus));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get full application history log")
    public ResponseEntity<ApiResponse<List<ApplicationStatusHistoryDto>>> getApplicationHistory(@PathVariable UUID id) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.getApplicationHistory(id, recruiterUserId, Role.RECRUITER)
        ));
    }
}
