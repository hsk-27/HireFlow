package com.hireflow.interview;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, UUID> {

    @Query("SELECT COUNT(i) > 0 FROM Interview i WHERE " +
           "i.candidate.id = :candidateId AND " +
           "i.interviewStatus IN ('SCHEDULED', 'RESCHEDULED') AND " +
           "(:excludeInterviewId IS NULL OR i.id != :excludeInterviewId) AND " +
           "(i.scheduledStart < :end AND i.scheduledEnd > :start)")
    boolean existsCandidateConflict(
            @Param("candidateId") UUID candidateId,
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("excludeInterviewId") UUID excludeInterviewId
    );

    @Query("SELECT COUNT(i) > 0 FROM Interview i WHERE " +
           "i.interviewer.id = :interviewerId AND " +
           "i.interviewStatus IN ('SCHEDULED', 'RESCHEDULED') AND " +
           "(:excludeInterviewId IS NULL OR i.id != :excludeInterviewId) AND " +
           "(i.scheduledStart < :end AND i.scheduledEnd > :start)")
    boolean existsInterviewerConflict(
            @Param("interviewerId") UUID interviewerId,
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("excludeInterviewId") UUID excludeInterviewId
    );

    List<Interview> findByApplicationIdOrderByScheduledStartDesc(UUID applicationId);

    @Query("SELECT i FROM Interview i WHERE i.application.job.company.id = :companyId ORDER BY i.scheduledStart DESC")
    Page<Interview> findCompanyInterviews(@Param("companyId") UUID companyId, Pageable pageable);

    @Query("SELECT i FROM Interview i WHERE i.candidate.user.id = :candidateUserId ORDER BY i.scheduledStart DESC")
    Page<Interview> findCandidateInterviews(@Param("candidateUserId") UUID candidateUserId, Pageable pageable);

    @Query("SELECT i FROM Interview i WHERE i.id = :id AND i.application.job.company.id = :companyId")
    Optional<Interview> findByIdAndCompanyId(@Param("id") UUID id, @Param("companyId") UUID companyId);

    long countByApplicationJobCompanyId(UUID companyId);
    long countByApplicationJobCompanyIdAndInterviewStatus(UUID companyId, InterviewStatus status);
}
