package com.hireflow.interview;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record RescheduleInterviewRequest(
        @NotNull(message = "New scheduled start time is required")
        Instant scheduledStart,

        @NotNull(message = "New scheduled end time is required")
        Instant scheduledEnd,

        String meetingLink,
        String reason
) {}
