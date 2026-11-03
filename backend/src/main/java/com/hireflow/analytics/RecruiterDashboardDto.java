package com.hireflow.analytics;

import com.hireflow.application.ApplicationStatus;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record RecruiterDashboardDto(
        long totalJobs,
        long activeJobs,
        long closedJobs,
        long totalApplications,
        long applicationsAwaitingReview,
        long shortlistedCandidates,
        long interviewsScheduled,
        long offersIssued,
        long hiresCount,
        Map<ApplicationStatus, Long> statusDistribution,
        List<JobApplicationCountDto> topJobs,
        List<FunnelStageDto> funnel
) {}
