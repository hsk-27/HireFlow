package com.hireflow.company;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record CompanyDto(
        UUID id,
        String name,
        String description,
        String website,
        String industry,
        String companySize,
        String headquartersLocation,
        CompanyStatus companyStatus,
        String reviewReason,
        Instant createdAt
) {
    @JsonProperty("status")
    public CompanyStatus status() {
        return companyStatus;
    }

    public static CompanyDto from(Company company) {
        return new CompanyDto(
                company.getId(),
                company.getName(),
                company.getDescription(),
                company.getWebsite(),
                company.getIndustry(),
                company.getCompanySize(),
                company.getHeadquartersLocation(),
                company.getCompanyStatus(),
                company.getReviewReason(),
                company.getCreatedAt()
        );
    }
}
