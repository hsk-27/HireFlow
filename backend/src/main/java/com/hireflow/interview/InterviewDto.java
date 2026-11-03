package com.hireflow.interview;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record InterviewDto(
        UUID id,
        UUID applicationId,
        UUID jobId,
        String jobTitle,
        UUID candidateId,
        String candidateName,
        String candidateEmail,
        UUID interviewerId,
        String interviewerName,
        Instant scheduledStart,
        Instant scheduledEnd,
        String timezone,
        InterviewType interviewType,
        String meetingLocation,
        String meetingLink,
        InterviewStatus interviewStatus,
        Instant createdAt,
        InterviewFeedbackDto feedback
) {
    @JsonProperty("status")
    public InterviewStatus status() {
        return interviewStatus;
    }

    @JsonProperty("scheduledStartTime")
    public Instant scheduledStartTime() {
        return scheduledStart;
    }

    @JsonProperty("scheduledEndTime")
    public Instant scheduledEndTime() {
        return scheduledEnd;
    }

    @JsonProperty("locationUrl")
    public String locationUrl() {
        return meetingLink;
    }

    public static InterviewDto from(Interview interview, InterviewFeedbackDto feedback) {
        return new InterviewDto(
                interview.getId(),
                interview.getApplication().getId(),
                interview.getApplication().getJob().getId(),
                interview.getApplication().getJob().getTitle(),
                interview.getCandidate().getId(),
                interview.getCandidate().getUser().getFullName(),
                interview.getCandidate().getUser().getEmail(),
                interview.getInterviewer().getId(),
                interview.getInterviewer().getFullName(),
                interview.getScheduledStart(),
                interview.getScheduledEnd(),
                interview.getTimezone(),
                interview.getInterviewType(),
                interview.getMeetingLocation(),
                interview.getMeetingLink(),
                interview.getInterviewStatus(),
                interview.getCreatedAt(),
                feedback
        );
    }
}
