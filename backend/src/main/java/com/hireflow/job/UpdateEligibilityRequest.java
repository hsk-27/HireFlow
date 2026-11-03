package com.hireflow.job;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.util.List;

public record UpdateEligibilityRequest(
        Integer minimumGraduationYear,
        Integer maximumGraduationYear,

        @DecimalMin(value = "0.0")
        BigDecimal minimumScore,

        @DecimalMin(value = "1.0")
        BigDecimal scoreScale,

        Integer minimumExperienceYears,
        List<String> eligibleBranches,
        List<String> eligibleDegrees
) {}
