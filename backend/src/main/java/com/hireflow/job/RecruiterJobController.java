package com.hireflow.job;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.response.PagedResponse;
import com.hireflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruiter/jobs")
@Tag(name = "Recruiter Jobs", description = "Recruiter job creation, draft management, and publishing")
@PreAuthorize("hasRole('RECRUITER')")
public class RecruiterJobController {

    private final JobService jobService;

    public RecruiterJobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    @Operation(summary = "Create new draft job opening")
    public ResponseEntity<ApiResponse<JobDto>> createJob(@Valid @RequestBody CreateJobRequest request) {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        JobDto created = jobService.createJob(recruiterId, request);
        return ResponseEntity.ok(ApiResponse.success(created, "Draft job opening created"));
    }

    @GetMapping
    @Operation(summary = "Get all jobs for current recruiter's company")
    public ResponseEntity<ApiResponse<PagedResponse<JobDto>>> getCompanyJobs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(jobService.getRecruiterJobs(recruiterId, pageable))
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific company job by ID")
    public ResponseEntity<ApiResponse<JobDto>> getJobById(@PathVariable UUID id) {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(jobService.getRecruiterJobById(id, recruiterId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update company job details")
    public ResponseEntity<ApiResponse<JobDto>> updateJob(@PathVariable UUID id, @Valid @RequestBody UpdateJobRequest request) {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        JobDto updated = jobService.updateJob(id, recruiterId, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Job opening updated"));
    }

    @PostMapping("/{id}/publish")
    @Operation(summary = "Publish job opening (requires company to be approved)")
    public ResponseEntity<ApiResponse<JobDto>> publishJob(@PathVariable UUID id) {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        JobDto published = jobService.publishJob(id, recruiterId);
        return ResponseEntity.ok(ApiResponse.success(published, "Job published successfully"));
    }

    @PostMapping("/{id}/close")
    @Operation(summary = "Close active job opening")
    public ResponseEntity<ApiResponse<JobDto>> closeJob(@PathVariable UUID id) {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        JobDto closed = jobService.closeJob(id, recruiterId);
        return ResponseEntity.ok(ApiResponse.success(closed, "Job closed"));
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive job opening")
    public ResponseEntity<ApiResponse<JobDto>> archiveJob(@PathVariable UUID id) {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        JobDto archived = jobService.archiveJob(id, recruiterId);
        return ResponseEntity.ok(ApiResponse.success(archived, "Job archived"));
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.POST})
    @Operation(summary = "Update job status dynamically (PUBLISHED, CLOSED, ARCHIVED, DRAFT)")
    public ResponseEntity<ApiResponse<JobDto>> updateJobStatus(
            @PathVariable UUID id,
            @RequestParam(required = false) JobStatus status,
            @RequestBody(required = false) java.util.Map<String, String> body
    ) {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        JobStatus newStatus = status;
        if (newStatus == null && body != null && body.containsKey("status")) {
            newStatus = JobStatus.valueOf(body.get("status").toUpperCase());
        }
        if (newStatus == null) {
            throw new com.hireflow.common.exception.BadRequestException("Job status is required");
        }
        JobDto updated = jobService.updateJobStatus(id, recruiterId, newStatus);
        return ResponseEntity.ok(ApiResponse.success(updated, "Job status updated to " + newStatus));
    }

    @PutMapping("/{id}/eligibility")
    @Operation(summary = "Update job eligibility criteria")
    public ResponseEntity<ApiResponse<JobEligibilityDto>> updateEligibility(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEligibilityRequest request
    ) {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        JobDto job = jobService.getRecruiterJobById(id, recruiterId);
        JobEligibilityDto updated = jobService.updateEligibilityCriteria(id, job.companyId(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Job eligibility criteria updated"));
    }
}
