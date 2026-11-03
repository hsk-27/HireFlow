package com.hireflow.job;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record JobDto(
        UUID id,
        UUID companyId,
        String companyName,
        String companyLogoUrl,
        String companyWebsite,
        String title,
        String description,
        String responsibilities,
        String requiredQualifications,
        String preferredQualifications,
        EmploymentType employmentType,
        WorkplaceType workplaceType,
        String location,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String salaryCurrency,
        Integer experienceMin,
        Integer experienceMax,
        JobStatus status,
        Instant applicationDeadline,
        Instant publishedAt,
        Instant createdAt,
        JobEligibilityDto eligibility
) {
    @JsonProperty("requirements")
    public String getRequirements() {
        return requiredQualifications;
    }

    @JsonProperty("currency")
    public String getCurrency() {
        return salaryCurrency;
    }

    @JsonProperty("eligibilityCriteria")
    public JobEligibilityDto getEligibilityCriteria() {
        return eligibility;
    }

    public static JobDto from(Job job, JobEligibilityDto eligibility) {
        return new JobDto(
                job.getId(),
                job.getCompany().getId(),
                job.getCompany().getName(),
                job.getCompany().getLogoUrl(),
                job.getCompany().getWebsite(),
                job.getTitle(),
                job.getDescription(),
                job.getResponsibilities(),
                job.getRequiredQualifications(),
                job.getPreferredQualifications(),
                job.getEmploymentType(),
                job.getWorkplaceType(),
                job.getLocation(),
                job.getSalaryMin(),
                job.getSalaryMax(),
                job.getSalaryCurrency(),
                job.getExperienceMin(),
                job.getExperienceMax(),
                job.getStatus(),
                job.getApplicationDeadline(),
                job.getPublishedAt(),
                job.getCreatedAt(),
                eligibility
        );
    }
}
