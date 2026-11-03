package com.hireflow.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobEligibilityCriteriaRepository extends JpaRepository<JobEligibilityCriteria, UUID> {
    Optional<JobEligibilityCriteria> findByJobId(UUID jobId);
}
