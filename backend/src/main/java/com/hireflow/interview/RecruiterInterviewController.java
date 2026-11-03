package com.hireflow.interview;

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

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruiter/interviews")
@Tag(name = "Recruiter Interviews", description = "Interview scheduling, calendar management, and feedback submission")
@PreAuthorize("hasRole('RECRUITER')")
public class RecruiterInterviewController {

    private final InterviewService interviewService;

    public RecruiterInterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    @Operation(summary = "Schedule a new candidate interview")
    public ResponseEntity<ApiResponse<InterviewDto>> scheduleInterview(@Valid @RequestBody ScheduleInterviewRequest request) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        InterviewDto created = interviewService.scheduleInterview(recruiterUserId, request);
        return ResponseEntity.ok(ApiResponse.success(created, "Interview scheduled successfully"));
    }

    @GetMapping
    @Operation(summary = "Get list of company interviews")
    public ResponseEntity<ApiResponse<PagedResponse<InterviewDto>>> getCompanyInterviews(
            @PageableDefault(size = 20, sort = "scheduledStart", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(interviewService.getRecruiterInterviews(recruiterUserId, pageable))
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get interview details and associated feedback")
    public ResponseEntity<ApiResponse<InterviewDto>> getInterviewById(@PathVariable UUID id) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(interviewService.getRecruiterInterviewById(id, recruiterUserId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Reschedule an existing interview")
    public ResponseEntity<ApiResponse<InterviewDto>> rescheduleInterview(
            @PathVariable UUID id,
            @Valid @RequestBody RescheduleInterviewRequest request
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        InterviewDto updated = interviewService.rescheduleInterview(id, recruiterUserId, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Interview rescheduled"));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a scheduled interview")
    public ResponseEntity<ApiResponse<InterviewDto>> cancelInterview(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        String reason = body != null ? body.get("reason") : "Cancelled by recruiter";
        InterviewDto cancelled = interviewService.cancelInterview(id, recruiterUserId, reason);
        return ResponseEntity.ok(ApiResponse.success(cancelled, "Interview cancelled"));
    }

    @PostMapping("/{id}/feedback")
    @Operation(summary = "Submit evaluation feedback and rating for an interview")
    public ResponseEntity<ApiResponse<InterviewFeedbackDto>> submitFeedback(
            @PathVariable UUID id,
            @Valid @RequestBody SubmitFeedbackRequest request
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        InterviewFeedbackDto feedback = interviewService.submitFeedback(id, recruiterUserId, request);
        return ResponseEntity.ok(ApiResponse.success(feedback, "Interview feedback submitted"));
    }
}
