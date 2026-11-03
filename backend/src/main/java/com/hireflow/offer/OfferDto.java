package com.hireflow.offer;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record OfferDto(
        UUID id,
        UUID applicationId,
        UUID jobId,
        String jobTitle,
        UUID companyId,
        String companyName,
        UUID candidateId,
        String candidateName,
        String candidateEmail,
        BigDecimal compensation,
        String currency,
        String employmentType,
        LocalDate joiningDate,
        Instant expiresAt,
        OfferStatus offerStatus,
        Instant issuedAt,
        Instant respondedAt,
        Instant createdAt
) {
    @JsonProperty("status")
    public OfferStatus status() {
        return offerStatus;
    }

    @JsonProperty("salary")
    public BigDecimal salary() {
        return compensation;
    }

    @JsonProperty("startDate")
    public LocalDate startDate() {
        return joiningDate;
    }

    @JsonProperty("expirationDate")
    public Instant expirationDate() {
        return expiresAt;
    }

    public static OfferDto from(Offer offer) {
        return new OfferDto(
                offer.getId(),
                offer.getApplication().getId(),
                offer.getApplication().getJob().getId(),
                offer.getApplication().getJob().getTitle(),
                offer.getApplication().getJob().getCompany().getId(),
                offer.getApplication().getJob().getCompany().getName(),
                offer.getApplication().getCandidate().getId(),
                offer.getApplication().getCandidate().getUser().getFullName(),
                offer.getApplication().getCandidate().getUser().getEmail(),
                offer.getCompensation(),
                offer.getCurrency(),
                offer.getEmploymentType(),
                offer.getJoiningDate(),
                offer.getExpiresAt(),
                offer.getOfferStatus(),
                offer.getIssuedAt(),
                offer.getRespondedAt(),
                offer.getCreatedAt()
        );
    }
}
