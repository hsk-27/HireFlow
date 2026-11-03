package com.hireflow.interview;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmitFeedbackRequest(
        @NotNull @Min(1) @Max(5)
        @JsonAlias({"technicalRating", "technicalScore"})
        Integer technicalRating,

        @NotNull @Min(1) @Max(5)
        @JsonAlias({"communicationRating", "communicationScore"})
        Integer communicationRating,

        @NotNull @Min(1) @Max(5)
        @JsonAlias({"problemSolvingRating", "problemSolvingScore"})
        Integer problemSolvingRating,

        @NotNull @Min(1) @Max(5)
        Integer overallRating,

        @NotNull
        FeedbackRecommendation recommendation,

        @NotBlank(message = "Feedback text is required")
        @JsonAlias({"feedbackText", "detailedNotes", "notes"})
        String feedbackText
) {}
