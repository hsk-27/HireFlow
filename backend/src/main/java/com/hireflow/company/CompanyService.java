package com.hireflow.company;

import com.hireflow.audit.AuditService;
import com.hireflow.common.exception.BadRequestException;
import com.hireflow.common.exception.ResourceNotFoundException;
import com.hireflow.notification.NotificationService;
import com.hireflow.notification.NotificationType;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final RecruiterCompanyRepository recruiterCompanyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public CompanyService(CompanyRepository companyRepository,
                          RecruiterCompanyRepository recruiterCompanyRepository,
                          UserRepository userRepository,
                          NotificationService notificationService,
                          AuditService auditService) {
        this.companyRepository = companyRepository;
        this.recruiterCompanyRepository = recruiterCompanyRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Company getCompanyForRecruiter(UUID recruiterUserId) {
        return recruiterCompanyRepository.findCompanyByUserId(recruiterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter is not associated with any company"));
    }

    @Transactional(readOnly = true)
    public Company getCompanyById(UUID companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));
    }

    @Transactional
    public Company createCompany(String name, String description, String website, String industry,
                                 String size, String location, User creator) {
        Company company = new Company(name, description, website, industry, size, location, creator);
        company.setCompanyStatus(CompanyStatus.PENDING);
        company = companyRepository.save(company);

        RecruiterCompany rc = new RecruiterCompany(creator, company, true);
        recruiterCompanyRepository.save(rc);

        auditService.logEvent(creator.getId(), company.getId(), "COMPANY_REGISTERED", "Company", company.getId(),
                "Registered company: " + company.getName());

        return company;
    }

    @Transactional
    public Company updateCompany(UUID recruiterUserId, UpdateCompanyRequest request) {
        Company company = getCompanyForRecruiter(recruiterUserId);

        if (request.description() != null) company.setDescription(request.description());
        if (request.website() != null) company.setWebsite(request.website());
        if (request.industry() != null) company.setIndustry(request.industry());
        if (request.companySize() != null) company.setCompanySize(request.companySize());
        if (request.headquartersLocation() != null) company.setHeadquartersLocation(request.headquartersLocation());

        Company updated = companyRepository.save(company);
        auditService.logEvent(recruiterUserId, updated.getId(), "COMPANY_UPDATED", "Company", updated.getId(),
                "Updated company details");
        return updated;
    }

    @Transactional
    public Company approveCompany(UUID companyId, UUID adminUserId) {
        Company company = getCompanyById(companyId);
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminUserId));

        company.setCompanyStatus(CompanyStatus.APPROVED);
        company.setReviewedBy(admin);
        company.setReviewedAt(Instant.now());
        company.setReviewReason("Approved by administrator");
        Company saved = companyRepository.save(company);

        if (company.getCreatedBy() != null) {
            notificationService.sendNotification(
                    company.getCreatedBy().getId(),
                    NotificationType.COMPANY_APPROVED,
                    "Company Approved",
                    "Your company " + company.getName() + " has been approved! You can now publish job openings.",
                    "Company",
                    company.getId()
            );
        }

        auditService.logEvent(adminUserId, company.getId(), "COMPANY_APPROVED", "Company", company.getId(),
                "Approved company: " + company.getName());
        return saved;
    }

    @Transactional
    public Company rejectCompany(UUID companyId, String reason, UUID adminUserId) {
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Rejection reason must be provided");
        }
        Company company = getCompanyById(companyId);
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminUserId));

        company.setCompanyStatus(CompanyStatus.REJECTED);
        company.setReviewedBy(admin);
        company.setReviewedAt(Instant.now());
        company.setReviewReason(reason);
        Company saved = companyRepository.save(company);

        if (company.getCreatedBy() != null) {
            notificationService.sendNotification(
                    company.getCreatedBy().getId(),
                    NotificationType.COMPANY_REJECTED,
                    "Company Registration Rejected",
                    "Your company registration for " + company.getName() + " was rejected: " + reason,
                    "Company",
                    company.getId()
            );
        }

        auditService.logEvent(adminUserId, company.getId(), "COMPANY_REJECTED", "Company", company.getId(),
                "Rejected company: " + company.getName() + ", reason: " + reason);
        return saved;
    }

    @Transactional
    public Company suspendCompany(UUID companyId, String reason, UUID adminUserId) {
        Company company = getCompanyById(companyId);
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminUserId));

        company.setCompanyStatus(CompanyStatus.SUSPENDED);
        company.setReviewedBy(admin);
        company.setReviewedAt(Instant.now());
        company.setReviewReason(reason != null ? reason : "Suspended by administrator");
        Company saved = companyRepository.save(company);

        if (company.getCreatedBy() != null) {
            notificationService.sendNotification(
                    company.getCreatedBy().getId(),
                    NotificationType.COMPANY_SUSPENDED,
                    "Company Suspended",
                    "Your company " + company.getName() + " has been suspended: " + company.getReviewReason(),
                    "Company",
                    company.getId()
            );
        }

        auditService.logEvent(adminUserId, company.getId(), "COMPANY_SUSPENDED", "Company", company.getId(),
                "Suspended company: " + company.getName());
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Company> getCompaniesForAdmin(CompanyStatus status, Pageable pageable) {
        if (status != null) {
            return companyRepository.findByCompanyStatus(status, pageable);
        }
        return companyRepository.findAll(pageable);
    }
}
