package com.hireflow.talentpool;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record BulkImportResultDto(
        int totalProcessed,
        int importedCount,
        int skippedDuplicateCount,
        int failedCount,
        List<String> errors
) {
    @JsonProperty("successfulImports")
    public int successfulImports() {
        return importedCount;
    }

    @JsonProperty("skippedCount")
    public int skippedCount() {
        return skippedDuplicateCount;
    }
}
