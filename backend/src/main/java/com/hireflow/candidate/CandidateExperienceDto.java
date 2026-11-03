package com.hireflow.candidate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CandidateExperienceDto(
        UUID id,
        String companyName,
        String jobTitle,
        String employmentType,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        boolean currentlyWorking
) {
    public static CandidateExperienceDto from(CandidateExperience exp) {
        return new CandidateExperienceDto(
                exp.getId(),
                exp.getCompanyName(),
                exp.getJobTitle(),
                exp.getEmploymentType(),
                exp.getDescription(),
                exp.getStartDate(),
                exp.getEndDate(),
                exp.isCurrentlyWorking()
        );
    }
}
