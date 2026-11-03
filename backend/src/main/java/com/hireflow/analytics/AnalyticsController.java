package com.hireflow.analytics;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruiter/analytics")
@Tag(name = "Recruiter Analytics", description = "Company-level hiring analytics, pipeline funnel, and metrics")
@PreAuthorize("hasRole('RECRUITER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get comprehensive company recruitment dashboard metrics")
    public ResponseEntity<ApiResponse<RecruiterDashboardDto>> getDashboardMetrics() {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRecruiterDashboard(recruiterUserId)));
    }

    @GetMapping("/application-funnel")
    @Operation(summary = "Get recruitment stage conversion funnel")
    public ResponseEntity<ApiResponse<List<FunnelStageDto>>> getFunnel() {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRecruitmentFunnel(recruiterUserId)));
    }
}
