package com.hireflow.candidate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateExperienceRequest(
        @NotBlank(message = "Company name is required")
        String companyName,

        @NotBlank(message = "Job title is required")
        String jobTitle,

        String employmentType,
        String description,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        LocalDate endDate,
        boolean currentlyWorking
) {}
