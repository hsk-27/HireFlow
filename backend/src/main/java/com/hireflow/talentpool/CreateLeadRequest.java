package com.hireflow.talentpool;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;

public record CreateLeadRequest(
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        String phone,
        String currentCompany,
        String currentDesignation,
        BigDecimal yearsOfExperience,
        String location,
        String skills,
        String source
) {
    @JsonCreator
    public static CreateLeadRequest create(
            @JsonProperty("fullName") String fullName,
            @JsonProperty("firstName") String firstName,
            @JsonProperty("lastName") String lastName,
            @JsonProperty("email") String email,
            @JsonProperty("phone") String phone,
            @JsonProperty("phoneNumber") String phoneNumber,
            @JsonProperty("currentCompany") String currentCompany,
            @JsonProperty("currentDesignation") String currentDesignation,
            @JsonProperty("currentTitle") String currentTitle,
            @JsonProperty("yearsOfExperience") BigDecimal yearsOfExperience,
            @JsonProperty("yearsExperience") BigDecimal yearsExperience,
            @JsonProperty("location") String location,
            @JsonProperty("skills") Object skillsObj,
            @JsonProperty("source") String source
    ) {
        String resolvedName = fullName;
        if (resolvedName == null || resolvedName.isBlank()) {
            resolvedName = ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
        }
        String resolvedPhone = phone != null ? phone : phoneNumber;
        String resolvedDesignation = currentDesignation != null ? currentDesignation : currentTitle;
        BigDecimal resolvedExp = yearsOfExperience != null ? yearsOfExperience : yearsExperience;

        String resolvedSkills = null;
        if (skillsObj instanceof List<?> list) {
            resolvedSkills = String.join(", ", list.stream().map(Object::toString).toList());
        } else if (skillsObj != null) {
            resolvedSkills = skillsObj.toString();
        }

        return new CreateLeadRequest(
                resolvedName,
                email,
                resolvedPhone,
                currentCompany,
                resolvedDesignation,
                resolvedExp,
                location,
                resolvedSkills,
                source
        );
    }
}
