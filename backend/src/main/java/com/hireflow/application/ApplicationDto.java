package com.hireflow.application;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record ApplicationDto(
        UUID id,
        UUID jobId,
        String jobTitle,
        UUID companyId,
        String companyName,
        UUID candidateId,
        String candidateName,
        String candidateEmail,
        UUID resumeDocumentId,
        String resumeFilename,
        String coverLetter,
        ApplicationStatus applicationStatus,
        EligibilityStatus eligibilityStatus,
        String eligibilityReasons,
        Instant submittedAt,
        Instant updatedAt
) {
    @JsonProperty("status")
    public ApplicationStatus status() {
        return applicationStatus;
    }

    @JsonProperty("appliedAt")
    public Instant appliedAt() {
        return submittedAt;
    }

    @JsonProperty("eligibilityReason")
    public String eligibilityReason() {
        return eligibilityReasons;
    }

    @JsonProperty("resumeUrl")
    public String resumeUrl() {
        return resumeDocumentId != null ? "/api/v1/candidate/resume/" + resumeDocumentId + "/download" : null;
    }

    public static ApplicationDto from(Application app) {
        return new ApplicationDto(
                app.getId(),
                app.getJob().getId(),
                app.getJob().getTitle(),
                app.getJob().getCompany().getId(),
                app.getJob().getCompany().getName(),
                app.getCandidate().getId(),
                app.getCandidate().getUser().getFullName(),
                app.getCandidate().getUser().getEmail(),
                app.getResumeDocument().getId(),
                app.getResumeDocument().getOriginalFilename(),
                app.getCoverLetter(),
                app.getApplicationStatus(),
                app.getEligibilityStatus(),
                app.getEligibilityReasons(),
                app.getSubmittedAt(),
                app.getUpdatedAt()
        );
    }
}
