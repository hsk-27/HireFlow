package com.hireflow.job;

import com.hireflow.company.CompanyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    @Query("SELECT j FROM Job j WHERE j.company.id = :companyId ORDER BY j.createdAt DESC")
    Page<Job> findByCompanyId(@Param("companyId") UUID companyId, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.id = :id AND j.company.id = :companyId")
    Optional<Job> findByIdAndCompanyId(@Param("id") UUID id, @Param("companyId") UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, JobStatus status);
    long countByCompanyId(UUID companyId);
    long countByStatus(JobStatus status);

    @Query("SELECT j FROM Job j WHERE " +
           "j.status = 'PUBLISHED' AND " +
           "j.company.companyStatus = 'APPROVED' AND " +
           "(j.applicationDeadline IS NULL OR j.applicationDeadline > :now) AND " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:employmentType IS NULL OR j.employmentType = :employmentType) AND " +
           "(:workplaceType IS NULL OR j.workplaceType = :workplaceType) AND " +
           "(:companyId IS NULL OR j.company.id = :companyId) " +
           "ORDER BY j.publishedAt DESC")
    Page<Job> searchPublicJobs(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("employmentType") EmploymentType employmentType,
            @Param("workplaceType") WorkplaceType workplaceType,
            @Param("companyId") UUID companyId,
            @Param("now") Instant now,
            Pageable pageable
    );
}
