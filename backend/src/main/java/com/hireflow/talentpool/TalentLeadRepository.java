package com.hireflow.talentpool;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TalentLeadRepository extends JpaRepository<TalentLead, UUID> {

    Optional<TalentLead> findByCompanyIdAndEmail(UUID companyId, String email);

    boolean existsByCompanyIdAndEmail(UUID companyId, String email);

    @Query("SELECT l FROM TalentLead l WHERE " +
           "l.company.id = :companyId AND " +
           "(:status IS NULL OR l.leadStatus = :status) AND " +
           "(:search IS NULL OR LOWER(l.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.skills) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.currentDesignation) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY l.importedAt DESC")
    Page<TalentLead> findCompanyLeads(
            @Param("companyId") UUID companyId,
            @Param("status") LeadStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT l FROM TalentLead l WHERE l.id = :id AND l.company.id = :companyId")
    Optional<TalentLead> findByIdAndCompanyId(@Param("id") UUID id, @Param("companyId") UUID companyId);
}
