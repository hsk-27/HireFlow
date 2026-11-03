package com.hireflow.candidate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.UUID;

public record SkillDto(
        UUID id,
        UUID skillId,
        String name,
        String category,
        BigDecimal yearsOfExperience
) {
    public static SkillDto from(CandidateSkill cs) {
        return new SkillDto(
                cs.getId(),
                cs.getSkill().getId(),
                cs.getSkill().getName(),
                cs.getSkill().getCategory(),
                cs.getYearsOfExperience()
        );
    }
}
