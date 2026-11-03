package com.hireflow.company;

import com.hireflow.user.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String website;

    private String industry;

    @Column(name = "company_size")
    private String companySize;

    @Column(name = "headquarters_location")
    private String headquartersLocation;

    @Column(name = "logo_document_id")
    private UUID logoDocumentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "company_status", nullable = false)
    private CompanyStatus companyStatus = CompanyStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "review_reason", columnDefinition = "TEXT")
    private String reviewReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public Company() {
    }

    public Company(String name, String description, String website, String industry, String companySize, String headquartersLocation, User createdBy) {
        this.name = name;
        this.description = description;
        this.website = website;
        this.industry = industry;
        this.companySize = companySize;
        this.headquartersLocation = headquartersLocation;
        this.createdBy = createdBy;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getHeadquartersLocation() {
        return headquartersLocation;
    }

    public void setHeadquartersLocation(String headquartersLocation) {
        this.headquartersLocation = headquartersLocation;
    }

    public UUID getLogoDocumentId() {
        return logoDocumentId;
    }

    public String getLogoUrl() {
        return logoDocumentId != null ? "/api/v1/documents/" + logoDocumentId + "/download" : null;
    }

    public void setLogoDocumentId(UUID logoDocumentId) {
        this.logoDocumentId = logoDocumentId;
    }

    public CompanyStatus getCompanyStatus() {
        return companyStatus;
    }

    public void setCompanyStatus(CompanyStatus companyStatus) {
        this.companyStatus = companyStatus;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public User getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(User reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public String getReviewReason() {
        return reviewReason;
    }

    public void setReviewReason(String reviewReason) {
        this.reviewReason = reviewReason;
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

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}
