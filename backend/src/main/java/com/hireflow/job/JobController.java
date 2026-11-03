package com.hireflow.job;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.response.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/jobs")
@Tag(name = "Public Jobs", description = "Public job search and job details for candidates and visitors")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    @Operation(summary = "Search published job openings")
    public ResponseEntity<ApiResponse<PagedResponse<JobDto>>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) WorkplaceType workplaceType,
            @RequestParam(required = false) UUID companyId,
            @PageableDefault(size = 12, sort = "publishedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(jobService.searchPublicJobs(keyword, location, employmentType, workplaceType, companyId, pageable))
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get published job details by ID")
    public ResponseEntity<ApiResponse<JobDto>> getJobDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getPublicJobById(id)));
    }
}
