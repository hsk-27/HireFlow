package com.hireflow.offer;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record UpdateOfferRequest(
        BigDecimal compensation,
        String currency,
        String employmentType,
        LocalDate joiningDate,
        Instant expiresAt
) {}
