package com.hireflow.talentpool;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TalentLeadDto(
        UUID id,
        UUID companyId,
        String fullName,
        String email,
        String phone,
        String currentCompany,
        String currentDesignation,
        BigDecimal yearsOfExperience,
        String location,
        String skills,
        String source,
        LeadStatus leadStatus,
        Instant importedAt
) {
    @JsonProperty("firstName")
    public String firstName() {
        if (fullName == null) return "";
        int idx = fullName.indexOf(' ');
        return idx > 0 ? fullName.substring(0, idx) : fullName;
    }

    @JsonProperty("lastName")
    public String lastName() {
        if (fullName == null) return "";
        int idx = fullName.indexOf(' ');
        return idx > 0 ? fullName.substring(idx + 1) : "";
    }

    @JsonProperty("phoneNumber")
    public String phoneNumber() {
        return phone;
    }

    @JsonProperty("currentTitle")
    public String currentTitle() {
        return currentDesignation;
    }

    @JsonProperty("yearsExperience")
    public BigDecimal yearsExperience() {
        return yearsOfExperience;
    }

    @JsonProperty("status")
    public LeadStatus status() {
        return leadStatus;
    }

    public static TalentLeadDto from(TalentLead lead) {
        return new TalentLeadDto(
                lead.getId(),
                lead.getCompany().getId(),
                lead.getFullName(),
                lead.getEmail(),
                lead.getPhone(),
                lead.getCurrentCompany(),
                lead.getCurrentDesignation(),
                lead.getYearsOfExperience(),
                lead.getLocation(),
                lead.getSkills(),
                lead.getSource(),
                lead.getLeadStatus(),
                lead.getImportedAt()
        );
    }
}
