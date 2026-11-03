package com.hireflow.analytics;

import java.util.UUID;

public record JobApplicationCountDto(
        UUID jobId,
        String jobTitle,
        long applicationCount
) {}
