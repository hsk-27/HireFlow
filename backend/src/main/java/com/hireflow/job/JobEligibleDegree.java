package com.hireflow.job;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "job_eligible_degrees")
@IdClass(JobEligibleDegree.DegreeId.class)
public class JobEligibleDegree {

    @Id
    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Id
    @Column(nullable = false, length = 100)
    private String degree;

    public JobEligibleDegree() {
    }

    public JobEligibleDegree(UUID jobId, String degree) {
        this.jobId = jobId;
        this.degree = degree;
    }

    public UUID getJobId() {
        return jobId;
    }

    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public static class DegreeId implements Serializable {
        private UUID jobId;
        private String degree;

        public DegreeId() {}

        public DegreeId(UUID jobId, String degree) {
            this.jobId = jobId;
            this.degree = degree;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            DegreeId degreeId = (DegreeId) o;
            return Objects.equals(jobId, degreeId.jobId) && Objects.equals(degree, degreeId.degree);
        }

        @Override
        public int hashCode() {
            return Objects.hash(jobId, degree);
        }
    }
}
