package com.hireflow.talentpool;

import java.math.BigDecimal;

public record UpdateLeadRequest(
        String fullName,
        String phone,
        String currentCompany,
        String currentDesignation,
        BigDecimal yearsOfExperience,
        String location,
        String skills,
        String source,
        LeadStatus leadStatus
) {}
