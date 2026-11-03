package com.hireflow.company;

import jakarta.validation.constraints.Size;

public record UpdateCompanyRequest(
        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        @Size(max = 255, message = "Website URL must not exceed 255 characters")
        String website,

        @Size(max = 100, message = "Industry must not exceed 100 characters")
        String industry,

        String companySize,

        @Size(max = 255, message = "Headquarters location must not exceed 255 characters")
        String headquartersLocation
) {}
