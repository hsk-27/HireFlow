package com.hireflow.interview;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record InterviewFeedbackDto(
        UUID id,
        UUID interviewId,
        String interviewerName,
        int technicalRating,
        int communicationRating,
        int problemSolvingRating,
        int overallRating,
        FeedbackRecommendation recommendation,
        String feedbackText,
        Instant submittedAt
) {
    @JsonProperty("technicalScore")
    public int technicalScore() {
        return technicalRating;
    }

    @JsonProperty("communicationScore")
    public int communicationScore() {
        return communicationRating;
    }

    @JsonProperty("problemSolvingScore")
    public int problemSolvingScore() {
        return problemSolvingRating;
    }

    @JsonProperty("detailedNotes")
    public String detailedNotes() {
        return feedbackText;
    }

    public static InterviewFeedbackDto from(InterviewFeedback feedback) {
        return new InterviewFeedbackDto(
                feedback.getId(),
                feedback.getInterview().getId(),
                feedback.getInterviewer().getFullName(),
                feedback.getTechnicalRating(),
                feedback.getCommunicationRating(),
                feedback.getProblemSolvingRating(),
                feedback.getOverallRating(),
                feedback.getRecommendation(),
                feedback.getFeedbackText(),
                feedback.getSubmittedAt()
        );
    }
}
