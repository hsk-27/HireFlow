package com.hireflow.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRecruiterRequest(
        @NotBlank(message = "Work email is required")
        @Email(message = "Invalid work email format")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        String phoneNumber,

        @NotBlank(message = "Company name is required")
        String companyName,

        String companyWebsite,
        String industry,
        String companySize,
        String headquartersLocation,
        String companyDescription
) {}
