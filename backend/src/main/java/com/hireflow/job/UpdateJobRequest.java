package com.hireflow.job;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;

public record UpdateJobRequest(
        @Size(max = 255)
        String title,

        String description,
        String responsibilities,

        @JsonAlias({"requirements", "required_qualifications"})
        String requiredQualifications,

        String preferredQualifications,
        EmploymentType employmentType,
        WorkplaceType workplaceType,
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
