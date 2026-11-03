package com.hireflow.application;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.response.PagedResponse;
import com.hireflow.common.security.SecurityUtils;
import com.hireflow.user.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidate")
@Tag(name = "Candidate Applications", description = "Candidate job applications and withdrawal")
@PreAuthorize("hasRole('CANDIDATE')")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/jobs/{jobId}/apply")
    @Operation(summary = "Submit an application for an open job")
    public ResponseEntity<ApiResponse<ApplicationDto>> applyForJob(
            @PathVariable UUID jobId,
            @RequestBody(required = false) ApplyJobRequest request
    ) {
        UUID candidateUserId = SecurityUtils.getCurrentUserId();
        ApplicationDto submitted = applicationService.applyForJob(candidateUserId, jobId, request);
        return ResponseEntity.ok(ApiResponse.success(submitted, "Application submitted successfully"));
    }

    @GetMapping("/applications")
    @Operation(summary = "Get list of applications submitted by current candidate")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationDto>>> getApplications(
            @PageableDefault(size = 15, sort = "submittedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID candidateUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(applicationService.getCandidateApplications(candidateUserId, pageable))
        ));
    }

    @GetMapping("/applications/{id}")
    @Operation(summary = "Get specific candidate application details")
    public ResponseEntity<ApiResponse<ApplicationDto>> getApplicationDetail(@PathVariable UUID id) {
        UUID candidateUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getCandidateApplicationDetail(id, candidateUserId)));
    }

    @PostMapping("/applications/{id}/withdraw")
    @Operation(summary = "Withdraw an active job application")
    public ResponseEntity<ApiResponse<ApplicationDto>> withdrawApplication(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        UUID candidateUserId = SecurityUtils.getCurrentUserId();
        String reason = body != null ? body.get("reason") : "Withdrawn by candidate";
        ApplicationDto withdrawn = applicationService.withdrawApplication(id, candidateUserId, reason);
        return ResponseEntity.ok(ApiResponse.success(withdrawn, "Application withdrawn"));
    }

    @GetMapping("/applications/{id}/history")
    @Operation(summary = "Get application status timeline/history")
    public ResponseEntity<ApiResponse<List<ApplicationStatusHistoryDto>>> getApplicationHistory(@PathVariable UUID id) {
        UUID candidateUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.getApplicationHistory(id, candidateUserId, Role.CANDIDATE)
        ));
    }
}
