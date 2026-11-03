package com.hireflow.job;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record JobEligibilityDto(
        UUID id,
        Integer minimumGraduationYear,
        Integer maximumGraduationYear,
        BigDecimal minimumScore,
        BigDecimal scoreScale,
        Integer minimumExperienceYears,
        List<String> eligibleBranches,
        List<String> eligibleDegrees
) {
    public static JobEligibilityDto from(JobEligibilityCriteria criteria, List<String> branches, List<String> degrees) {
        if (criteria == null) {
            return new JobEligibilityDto(null, null, null, null, null, null, branches, degrees);
        }
        return new JobEligibilityDto(
                criteria.getId(),
                criteria.getMinimumGraduationYear(),
                criteria.getMaximumGraduationYear(),
                criteria.getMinimumScore(),
                criteria.getScoreScale(),
                criteria.getMinimumExperienceYears(),
                branches,
                degrees
        );
    }
}
