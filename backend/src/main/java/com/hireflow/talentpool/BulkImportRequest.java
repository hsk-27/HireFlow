package com.hireflow.talentpool;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BulkImportRequest(
        @NotEmpty(message = "Import leads list cannot be empty")
        List<BulkImportLeadItem> leads,

        @NotNull(message = "Authorization confirmation is required")
        Boolean confirmedAuthorization
) {}
