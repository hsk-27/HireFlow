package com.hireflow.interview;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record ScheduleInterviewRequest(
        @NotNull(message = "Application ID is required")
        UUID applicationId,

        UUID interviewerId, // Optional, defaults to current recruiter if null

        @NotNull(message = "Scheduled start time is required")
        @JsonAlias({"scheduledStartTime", "scheduledStart"})
        Instant scheduledStart,

        @NotNull(message = "Scheduled end time is required")
        @JsonAlias({"scheduledEndTime", "scheduledEnd"})
        Instant scheduledEnd,

        String timezone,

        @NotNull(message = "Interview type is required")
        InterviewType interviewType,

        String meetingLocation,
        @JsonAlias({"locationUrl", "meetingLink"})
        String meetingLink
) {}
