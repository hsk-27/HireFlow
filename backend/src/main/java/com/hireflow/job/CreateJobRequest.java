package com.hireflow.job;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;

public record CreateJobRequest(
        @NotBlank(message = "Job title is required")
        @Size(max = 255)
        String title,

        @NotBlank(message = "Job description is required")
        String description,

        String responsibilities,

        @JsonAlias({"requirements", "required_qualifications"})
        String requiredQualifications,

        String preferredQualifications,

        @NotNull(message = "Employment type is required")
        EmploymentType employmentType,

        @NotNull(message = "Workplace type is required")
        WorkplaceType workplaceType,

        @NotBlank(message = "Location is required")
        String location,

        BigDecimal salaryMin,
        BigDecimal salaryMax,

        @JsonAlias({"currency", "salary_currency"})
        String salaryCurrency,

        Integer experienceMin,
        Integer experienceMax,
        Instant applicationDeadline,

        @JsonAlias({"eligibilityCriteria", "eligibility_criteria"})
        UpdateEligibilityRequest eligibility
) {}
