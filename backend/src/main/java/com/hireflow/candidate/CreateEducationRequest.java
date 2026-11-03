package com.hireflow.candidate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateEducationRequest(
        @NotBlank(message = "Institution is required")
        String institution,

        @NotBlank(message = "Degree is required")
        String degree,

        @NotBlank(message = "Branch/Major is required")
        String branch,

        String qualificationLevel,

        @NotNull(message = "Graduation year is required")
        Integer graduationYear,

        @NotNull(message = "Score is required")
        @DecimalMin(value = "0.0", message = "Score must be positive")
        BigDecimal score,

        @NotNull(message = "Score scale is required")
        @DecimalMin(value = "1.0", message = "Score scale must be at least 1.0")
        BigDecimal scoreScale,

        Integer startYear,
        Integer endYear,
        boolean isPrimary
) {}
