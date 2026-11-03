package com.hireflow.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:actorUserId IS NULL OR a.actorUserId = :actorUserId) AND " +
           "(:companyId IS NULL OR a.companyId = :companyId) AND " +
           "(:action IS NULL OR LOWER(a.action) = LOWER(:action)) AND " +
           "(:entityType IS NULL OR LOWER(a.entityType) = LOWER(:entityType)) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> findFiltered(
            @Param("actorUserId") UUID actorUserId,
            @Param("companyId") UUID companyId,
            @Param("action") String action,
            @Param("entityType") String entityType,
            Pageable pageable
    );
}
