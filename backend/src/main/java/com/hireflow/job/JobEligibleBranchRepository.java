package com.hireflow.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobEligibleBranchRepository extends JpaRepository<JobEligibleBranch, JobEligibleBranch.BranchId> {
    List<JobEligibleBranch> findByJobId(UUID jobId);
    void deleteByJobId(UUID jobId);
}
