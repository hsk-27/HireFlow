package com.hireflow.audit;

import java.time.Instant;
import java.util.UUID;

public record AuditLogDto(
        UUID id,
        UUID actorUserId,
        UUID companyId,
        String action,
        String entityType,
        UUID entityId,
        String metadata,
        String ipAddress,
        String userAgent,
        Instant createdAt
) {
    public static AuditLogDto from(AuditLog log) {
        return new AuditLogDto(
                log.getId(),
                log.getActorUserId(),
                log.getCompanyId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getMetadata(),
                log.getIpAddress(),
                log.getUserAgent(),
                log.getCreatedAt()
        );
    }
}
