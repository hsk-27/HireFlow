package com.hireflow.job;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "job_eligibility_criteria")
public class JobEligibilityCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false, unique = true)
    private Job job;

    @Column(name = "minimum_graduation_year")
    private Integer minimumGraduationYear;

    @Column(name = "maximum_graduation_year")
    private Integer maximumGraduationYear;

    @Column(name = "minimum_score", precision = 5, scale = 2)
    private BigDecimal minimumScore;

    @Column(name = "score_scale", precision = 5, scale = 2)
    private BigDecimal scoreScale;

    @Column(name = "minimum_experience_years")
    private Integer minimumExperienceYears;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public JobEligibilityCriteria() {
    }

    public JobEligibilityCriteria(Job job) {
        this.job = job;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public Integer getMinimumGraduationYear() {
        return minimumGraduationYear;
    }

    public void setMinimumGraduationYear(Integer minimumGraduationYear) {
        this.minimumGraduationYear = minimumGraduationYear;
    }

    public Integer getMaximumGraduationYear() {
        return maximumGraduationYear;
    }

    public void setMaximumGraduationYear(Integer maximumGraduationYear) {
        this.maximumGraduationYear = maximumGraduationYear;
    }

    public BigDecimal getMinimumScore() {
        return minimumScore;
    }

    public void setMinimumScore(BigDecimal minimumScore) {
        this.minimumScore = minimumScore;
    }

    public BigDecimal getScoreScale() {
        return scoreScale;
    }

    public void setScoreScale(BigDecimal scoreScale) {
        this.scoreScale = scoreScale;
    }

    public Integer getMinimumExperienceYears() {
        return minimumExperienceYears;
    }

    public void setMinimumExperienceYears(Integer minimumExperienceYears) {
        this.minimumExperienceYears = minimumExperienceYears;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
