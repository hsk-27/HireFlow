package com.hireflow.candidate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record AddSkillRequest(
        @NotBlank(message = "Skill name is required")
        String skillName,

        @DecimalMin(value = "0.0", message = "Years of experience cannot be negative")
        BigDecimal yearsOfExperience
) {}
