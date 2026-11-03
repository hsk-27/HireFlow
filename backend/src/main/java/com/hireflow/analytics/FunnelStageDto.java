package com.hireflow.analytics;

public record FunnelStageDto(
        String stage,
        long count,
        double conversionPercentage
) {}
