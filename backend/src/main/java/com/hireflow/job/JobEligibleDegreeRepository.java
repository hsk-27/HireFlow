package com.hireflow.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobEligibleDegreeRepository extends JpaRepository<JobEligibleDegree, JobEligibleDegree.DegreeId> {
    List<JobEligibleDegree> findByJobId(UUID jobId);
    void deleteByJobId(UUID jobId);
}
