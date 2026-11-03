package com.hireflow.interview;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.response.PagedResponse;
import com.hireflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidate/interviews")
@Tag(name = "Candidate Interviews", description = "Candidate scheduled interviews overview")
@PreAuthorize("hasRole('CANDIDATE')")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping
    @Operation(summary = "Get all interviews scheduled for the authenticated candidate")
    public ResponseEntity<ApiResponse<PagedResponse<InterviewDto>>> getCandidateInterviews(
            @PageableDefault(size = 20, sort = "scheduledStart", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        UUID candidateUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(interviewService.getCandidateInterviews(candidateUserId, pageable))
        ));
    }
}
