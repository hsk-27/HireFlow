package com.hireflow.offer;

import com.hireflow.application.Application;
import com.hireflow.application.ApplicationService;
import com.hireflow.application.ApplicationStatus;
import com.hireflow.audit.AuditService;
import com.hireflow.common.exception.BadRequestException;
import com.hireflow.common.exception.ConflictException;
import com.hireflow.common.exception.ForbiddenException;
import com.hireflow.common.exception.ResourceNotFoundException;
import com.hireflow.company.Company;
import com.hireflow.company.CompanyService;
import com.hireflow.notification.NotificationService;
import com.hireflow.notification.NotificationType;
import com.hireflow.user.Role;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final ApplicationService applicationService;
    private final CompanyService companyService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public OfferService(OfferRepository offerRepository,
                        ApplicationService applicationService,
                        CompanyService companyService,
                        UserRepository userRepository,
                        NotificationService notificationService,
                        AuditService auditService) {
        this.offerRepository = offerRepository;
        this.applicationService = applicationService;
        this.companyService = companyService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public OfferDto createDraftOffer(UUID recruiterUserId, UUID applicationId, CreateOfferRequest req) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        User creator = userRepository.findById(recruiterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterUserId));

        Application application = applicationService.getEntityById(applicationId);

        // Company isolation check
        if (!application.getJob().getCompany().getId().equals(company.getId())) {
            throw new ForbiddenException("Cannot issue offer for application belonging to another company");
        }

        // Check active offer constraint
        offerRepository.findByApplicationIdAndOfferStatusIn(applicationId, Set.of(OfferStatus.DRAFT, OfferStatus.SENT))
                .ifPresent(existing -> {
                    throw new ConflictException("An active offer (" + existing.getOfferStatus() + ") already exists for this application");
                });

        Instant expires = req.expiresAt() != null ? req.expiresAt() : Instant.now().plus(14, java.time.temporal.ChronoUnit.DAYS);
        if (expires.isBefore(Instant.now())) {
            throw new BadRequestException("Offer expiration date must be in the future");
        }

        Offer offer = new Offer();
        offer.setApplication(application);
        offer.setCompensation(req.compensation());
        offer.setCurrency(req.currency() != null && !req.currency().isBlank() ? req.currency() : "USD");
        offer.setEmploymentType(req.employmentType() != null && !req.employmentType().isBlank() ? req.employmentType() : "FULL_TIME");
        offer.setJoiningDate(req.joiningDate());
        offer.setExpiresAt(expires);
        offer.setOfferStatus(OfferStatus.DRAFT);
        offer.setCreatedBy(creator);

        Offer saved = offerRepository.save(offer);

        auditService.logEvent(recruiterUserId, company.getId(), "OFFER_DRAFT_CREATED", "Offer", saved.getId(),
                "Drafted offer of " + req.compensation() + " " + offer.getCurrency() + " for " + application.getCandidate().getUser().getFullName());

        return OfferDto.from(saved);
    }

    @Transactional
    public OfferDto issueOffer(UUID offerId, UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Offer offer = offerRepository.findByIdAndCompanyId(offerId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found or unauthorized"));

        if (offer.getOfferStatus() != OfferStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT offers can be issued. Current status: " + offer.getOfferStatus());
        }

        if (offer.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Cannot issue an offer with an expiration date in the past");
        }

        offer.setOfferStatus(OfferStatus.SENT);
        offer.setIssuedAt(Instant.now());
        Offer saved = offerRepository.save(offer);

        // Update application state to OFFERED transactionally
        applicationService.transitionStatus(offer.getApplication().getId(), recruiterUserId, Role.RECRUITER,
                ApplicationStatus.OFFERED, "Job offer issued with compensation: " + offer.getCompensation() + " " + offer.getCurrency());

        // Notify candidate
        notificationService.sendNotification(
                offer.getApplication().getCandidate().getUser().getId(),
                NotificationType.OFFER_ISSUED,
                "Job Offer Received!",
                String.format("Congratulations! %s has extended an employment offer for '%s'.",
                        company.getName(), offer.getApplication().getJob().getTitle()),
                "Offer",
                saved.getId()
        );

        auditService.logEvent(recruiterUserId, company.getId(), "OFFER_ISSUED", "Offer", saved.getId(),
                "Issued formal offer to candidate " + offer.getApplication().getCandidate().getUser().getEmail());

        return OfferDto.from(saved);
    }

    @Transactional
    public OfferDto candidateRespondOffer(UUID offerId, UUID candidateUserId, boolean accept, String reason) {
        Offer offer = offerRepository.findByIdAndCandidateUserId(offerId, candidateUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found or unauthorized"));

        if (offer.getOfferStatus() != OfferStatus.SENT) {
            throw new BadRequestException("Cannot respond to offer with status: " + offer.getOfferStatus());
        }

        if (offer.isExpired()) {
            offer.setOfferStatus(OfferStatus.EXPIRED);
            offerRepository.save(offer);
            throw new BadRequestException("This offer has expired and can no longer be accepted");
        }

        offer.setRespondedAt(Instant.now());

        if (accept) {
            offer.setOfferStatus(OfferStatus.ACCEPTED);
            Offer saved = offerRepository.save(offer);

            // Update application status to HIRED
            applicationService.transitionStatus(offer.getApplication().getId(), candidateUserId, Role.CANDIDATE,
                    ApplicationStatus.HIRED, "Candidate accepted offer");

            // Notify recruiter
            if (offer.getCreatedBy() != null) {
                notificationService.sendNotification(
                        offer.getCreatedBy().getId(),
                        NotificationType.OFFER_ACCEPTED,
                        "Offer Accepted!",
                        String.format("%s has accepted the employment offer for '%s'!",
                                offer.getApplication().getCandidate().getUser().getFullName(),
                                offer.getApplication().getJob().getTitle()),
                        "Offer",
                        saved.getId()
                );
            }

            auditService.logEvent(candidateUserId, offer.getApplication().getJob().getCompany().getId(),
                    "OFFER_ACCEPTED", "Offer", saved.getId(), "Candidate accepted job offer");

            return OfferDto.from(saved);
        } else {
            offer.setOfferStatus(OfferStatus.DECLINED);
            Offer saved = offerRepository.save(offer);

            // Update application status to OFFER_DECLINED
            applicationService.transitionStatus(offer.getApplication().getId(), candidateUserId, Role.CANDIDATE,
                    ApplicationStatus.OFFER_DECLINED, "Candidate declined offer: " + reason);

            // Notify recruiter
            if (offer.getCreatedBy() != null) {
                notificationService.sendNotification(
                        offer.getCreatedBy().getId(),
                        NotificationType.OFFER_DECLINED,
                        "Offer Declined",
                        String.format("%s declined the offer for '%s'. Reason: %s",
                                offer.getApplication().getCandidate().getUser().getFullName(),
                                offer.getApplication().getJob().getTitle(),
                                reason != null ? reason : "No reason provided"),
                        "Offer",
                        saved.getId()
                );
            }

            auditService.logEvent(candidateUserId, offer.getApplication().getJob().getCompany().getId(),
                    "OFFER_DECLINED", "Offer", saved.getId(), "Candidate declined job offer. Reason: " + reason);

            return OfferDto.from(saved);
        }
    }

    @Transactional
    public OfferDto withdrawOffer(UUID offerId, UUID recruiterUserId, String reason) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Offer offer = offerRepository.findByIdAndCompanyId(offerId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found or unauthorized"));

        if (offer.getOfferStatus() == OfferStatus.ACCEPTED) {
            throw new BadRequestException("Cannot withdraw an offer that has already been accepted by the candidate");
        }

        offer.setOfferStatus(OfferStatus.WITHDRAWN);
        Offer saved = offerRepository.save(offer);

        auditService.logEvent(recruiterUserId, company.getId(), "OFFER_WITHDRAWN", "Offer", saved.getId(),
                "Recruiter withdrew offer. Reason: " + reason);

        return OfferDto.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<OfferDto> getCandidateOffers(UUID candidateUserId, Pageable pageable) {
        return offerRepository.findCandidateOffers(candidateUserId, pageable).map(OfferDto::from);
    }

    @Transactional(readOnly = true)
    public OfferDto getCandidateOfferById(UUID offerId, UUID candidateUserId) {
        Offer offer = offerRepository.findByIdAndCandidateUserId(offerId, candidateUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found or unauthorized"));
        return OfferDto.from(offer);
    }

    @Transactional(readOnly = true)
    public Page<OfferDto> getCompanyOffers(UUID recruiterUserId, Pageable pageable) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        return offerRepository.findCompanyOffers(company.getId(), pageable).map(OfferDto::from);
    }

    @Transactional(readOnly = true)
    public OfferDto getCompanyOfferById(UUID offerId, UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Offer offer = offerRepository.findByIdAndCompanyId(offerId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found or unauthorized"));
        return OfferDto.from(offer);
    }
}
