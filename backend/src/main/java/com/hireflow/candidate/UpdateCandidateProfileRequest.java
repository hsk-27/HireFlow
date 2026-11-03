package com.hireflow.candidate;

import jakarta.validation.constraints.Size;

public record UpdateCandidateProfileRequest(
        @Size(max = 2000, message = "Summary cannot exceed 2000 characters")
        String professionalSummary,

        @Size(max = 255)
        String currentLocation,

        @Size(max = 255)
        String preferredLocation,

        @Size(max = 255)
        String portfolioUrl,

        @Size(max = 255)
        String linkedinUrl,

        @Size(max = 255)
        String githubUrl
) {}
