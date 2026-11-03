package com.hireflow.analytics;

import java.util.Map;

public record AdminDashboardDto(
        long totalCandidates,
        long totalRecruiters,
        long totalCompanies,
        long pendingCompanyApprovals,
        long approvedCompanies,
        long activeJobs,
        long totalApplications,
        Map<String, Long> platformStats
) {}
