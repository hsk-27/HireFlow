package com.hireflow.candidate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record CandidateEducationDto(
        UUID id,
        String institution,
        String degree,
        String branch,
        String qualificationLevel,
        int graduationYear,
        BigDecimal score,
        BigDecimal scoreScale,
        Integer startYear,
        Integer endYear,
        boolean isPrimary
) {
    public static CandidateEducationDto from(CandidateEducation edu) {
        return new CandidateEducationDto(
                edu.getId(),
                edu.getInstitution(),
                edu.getDegree(),
                edu.getBranch(),
                edu.getQualificationLevel(),
                edu.getGraduationYear(),
                edu.getScore(),
                edu.getScoreScale(),
                edu.getStartYear(),
                edu.getEndYear(),
                edu.isPrimary()
        );
    }
}
