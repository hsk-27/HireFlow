package com.hireflow.job;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "job_eligible_branches")
@IdClass(JobEligibleBranch.BranchId.class)
public class JobEligibleBranch {

    @Id
    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Id
    @Column(nullable = false, length = 100)
    private String branch;

    public JobEligibleBranch() {
    }

    public JobEligibleBranch(UUID jobId, String branch) {
        this.jobId = jobId;
        this.branch = branch;
    }

    public UUID getJobId() {
        return jobId;
    }

    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public static class BranchId implements Serializable {
        private UUID jobId;
        private String branch;

        public BranchId() {}

        public BranchId(UUID jobId, String branch) {
            this.jobId = jobId;
            this.branch = branch;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            BranchId branchId = (BranchId) o;
            return Objects.equals(jobId, branchId.jobId) && Objects.equals(branch, branchId.branch);
        }

        @Override
        public int hashCode() {
            return Objects.hash(jobId, branch);
        }
    }
}
