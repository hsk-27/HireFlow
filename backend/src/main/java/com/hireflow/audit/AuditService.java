package com.hireflow.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEvent(UUID actorUserId, UUID companyId, String action, String entityType, UUID entityId, String metadata) {
        try {
            AuditLog auditLog = new AuditLog(actorUserId, companyId, action, entityType, entityId, metadata);
            auditLogRepository.save(auditLog);
            log.info("Audit: user={} company={} action={} entity={}:{}", actorUserId, companyId, action, entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to record audit log event: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(UUID actorUserId, UUID companyId, String action, String entityType, Pageable pageable) {
        return auditLogRepository.findFiltered(actorUserId, companyId, action, entityType, pageable)
                .map(AuditLogDto::from);
    }
}
