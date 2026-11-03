package com.hireflow.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    boolean existsByJobIdAndCandidateId(UUID jobId, UUID candidateId);
    Optional<Application> findByJobIdAndCandidateId(UUID jobId, UUID candidateId);

    Page<Application> findByCandidateIdOrderBySubmittedAtDesc(UUID candidateId, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.id = :id AND a.candidate.id = :candidateId")
    Optional<Application> findByIdAndCandidateId(@Param("id") UUID id, @Param("candidateId") UUID candidateId);

    @Query("SELECT a FROM Application a WHERE a.id = :id AND a.job.company.id = :companyId")
    Optional<Application> findByIdAndCompanyId(@Param("id") UUID id, @Param("companyId") UUID companyId);

    @Query("SELECT a FROM Application a WHERE " +
           "a.job.company.id = :companyId AND " +
           "(:jobId IS NULL OR a.job.id = :jobId) AND " +
           "(:status IS NULL OR a.applicationStatus = :status) AND " +
           "(:eligibilityStatus IS NULL OR a.eligibilityStatus = :eligibilityStatus) AND " +
           "(:search IS NULL OR LOWER(a.candidate.user.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.candidate.user.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.candidate.user.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.submittedAt DESC")
    Page<Application> findRecruiterApplications(
            @Param("companyId") UUID companyId,
            @Param("jobId") UUID jobId,
            @Param("status") ApplicationStatus status,
            @Param("eligibilityStatus") EligibilityStatus eligibilityStatus,
            @Param("search") String search,
            Pageable pageable
    );

    long countByJobCompanyId(UUID companyId);
    long countByJobCompanyIdAndApplicationStatus(UUID companyId, ApplicationStatus status);
    long countByJobId(UUID jobId);
    long countByApplicationStatus(ApplicationStatus status);
}
