package com.hireflow.application;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record ApplicationStatusHistoryDto(
        UUID id,
        UUID applicationId,
        ApplicationStatus previousStatus,
        ApplicationStatus newStatus,
        String changedByName,
        String changeReason,
        Instant createdAt
) {
    @JsonProperty("fromStatus")
    public ApplicationStatus fromStatus() {
        return previousStatus;
    }

    @JsonProperty("toStatus")
    public ApplicationStatus toStatus() {
        return newStatus;
    }

    @JsonProperty("changedAt")
    public Instant changedAt() {
        return createdAt;
    }

    public static ApplicationStatusHistoryDto from(ApplicationStatusHistory history) {
        return new ApplicationStatusHistoryDto(
                history.getId(),
                history.getApplication().getId(),
                history.getPreviousStatus(),
                history.getNewStatus(),
                history.getChangedBy().getFullName(),
                history.getChangeReason(),
                history.getCreatedAt()
        );
    }
}
