package com.hireflow.candidate;

import java.util.UUID;

public record CandidateProfileDto(
        UUID id,
        UUID userId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String professionalSummary,
        String currentLocation,
        String preferredLocation,
        String portfolioUrl,
        String linkedinUrl,
        String githubUrl,
        UUID currentResumeId,
        String currentResumeName,
        int profileCompletionPercentage
) {
    public static CandidateProfileDto from(CandidateProfile profile) {
        return new CandidateProfileDto(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getFirstName(),
                profile.getUser().getLastName(),
                profile.getUser().getEmail(),
                profile.getUser().getPhoneNumber(),
                profile.getProfessionalSummary(),
                profile.getCurrentLocation(),
                profile.getPreferredLocation(),
                profile.getPortfolioUrl(),
                profile.getLinkedinUrl(),
                profile.getGithubUrl(),
                profile.getCurrentResume() != null ? profile.getCurrentResume().getId() : null,
                profile.getCurrentResume() != null ? profile.getCurrentResume().getOriginalFilename() : null,
                profile.getProfileCompletionPercentage()
        );
    }
}
