package com.hireflow.offer;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CreateOfferRequest(
        UUID applicationId,

        @NotNull(message = "Compensation amount is required")
        @DecimalMin(value = "0.0", message = "Compensation must be non-negative")
        @JsonAlias({"compensation", "salary", "baseSalary"})
        BigDecimal compensation,

        String currency,

        @JsonAlias({"employmentType", "type"})
        String employmentType,

        @NotNull(message = "Joining date is required")
        @JsonAlias({"joiningDate", "startDate"})
        LocalDate joiningDate,

        @JsonAlias({"expiresAt", "expirationDate"})
        Instant expiresAt,

        @JsonAlias({"terms", "notes", "offerTerms"})
        String terms
) {}
