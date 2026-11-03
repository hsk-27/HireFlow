package com.hireflow.talentpool;

import java.math.BigDecimal;

public record BulkImportLeadItem(
        String fullName,
        String email,
        String phone,
        String currentCompany,
        String currentDesignation,
        BigDecimal yearsOfExperience,
        String location,
        String skills,
        String source
) {}
