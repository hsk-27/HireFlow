package com.hireflow.application;

import jakarta.validation.constraints.NotNull;

public record TransitionStatusRequest(
        @NotNull(message = "New application status is required")
        ApplicationStatus newStatus,

        String reason
) {}
