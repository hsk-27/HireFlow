package com.hireflow.application;

import com.hireflow.audit.AuditService;
import com.hireflow.candidate.*;
import com.hireflow.common.exception.BadRequestException;
import com.hireflow.common.exception.ConflictException;
import com.hireflow.common.exception.ForbiddenException;
import com.hireflow.common.exception.ResourceNotFoundException;
import com.hireflow.company.Company;
import com.hireflow.company.CompanyService;
import com.hireflow.job.*;
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
import java.util.UUID;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final ApplicationStateMachine stateMachine;
    private final EligibilityEvaluationService eligibilityEvaluationService;
    private final JobService jobService;
    private final JobEligibilityCriteriaRepository criteriaRepository;
    private final JobEligibleBranchRepository branchRepository;
    private final JobEligibleDegreeRepository degreeRepository;
    private final CandidateService candidateService;
    private final CandidateEducationRepository educationRepository;
    private final CandidateExperienceRepository experienceRepository;
    private final CompanyService companyService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              ApplicationStatusHistoryRepository historyRepository,
                              ApplicationStateMachine stateMachine,
                              EligibilityEvaluationService eligibilityEvaluationService,
                              JobService jobService,
                              JobEligibilityCriteriaRepository criteriaRepository,
                              JobEligibleBranchRepository branchRepository,
                              JobEligibleDegreeRepository degreeRepository,
                              CandidateService candidateService,
                              CandidateEducationRepository educationRepository,
                              CandidateExperienceRepository experienceRepository,
                              CompanyService companyService,
                              UserRepository userRepository,
                              NotificationService notificationService,
                              AuditService auditService) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.stateMachine = stateMachine;
        this.eligibilityEvaluationService = eligibilityEvaluationService;
        this.jobService = jobService;
        this.criteriaRepository = criteriaRepository;
        this.branchRepository = branchRepository;
        this.degreeRepository = degreeRepository;
        this.candidateService = candidateService;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.companyService = companyService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public ApplicationDto applyForJob(UUID candidateUserId, UUID jobId, ApplyJobRequest req) {
        CandidateProfile candidate = candidateService.getOrCreateProfile(candidateUserId);
        User candidateUser = candidate.getUser();

        Job job = jobService.getEntityById(jobId);

        // 1. Confirm job is published and not expired
        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new BadRequestException("This position is not currently open for applications");
        }
        if (job.getApplicationDeadline() != null && job.getApplicationDeadline().isBefore(Instant.now())) {
            throw new BadRequestException("The application deadline for this position has passed");
        }

        // 2. Prevent duplicate applications
        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidate.getId())) {
            throw new ConflictException("You have already submitted an application for this position");
        }

        // 3. Obtain snapshot resume
        Document resume = candidate.getCurrentResume();
        if (resume == null) {
            throw new BadRequestException("You must upload a resume to your profile before applying for jobs");
        }

        // 4. Evaluate eligibility criteria
        JobEligibilityCriteria criteria = criteriaRepository.findByJobId(jobId).orElse(null);
        List<JobEligibleBranch> branches = branchRepository.findByJobId(jobId);
        List<JobEligibleDegree> degrees = degreeRepository.findByJobId(jobId);
        List<CandidateEducation> educations = educationRepository.findByCandidateIdOrderByGraduationYearDesc(candidate.getId());
        List<CandidateExperience> experiences = experienceRepository.findByCandidateIdOrderByStartDateDesc(candidate.getId());

        EligibilityEvaluationService.EvaluationResult evalResult = eligibilityEvaluationService.evaluate(
                criteria, branches, degrees, candidate, educations, experiences
        );

        // 5. Create application record
        Application application = new Application();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setResumeDocument(resume);
        application.setCoverLetter(req != null ? req.coverLetter() : null);
        application.setApplicationStatus(ApplicationStatus.SUBMITTED);
        application.setEligibilityStatus(evalResult.status());
        application.setEligibilityReasons(evalResult.explanation());

        Application saved = applicationRepository.save(application);

        // 6. Record initial history
        ApplicationStatusHistory history = new ApplicationStatusHistory(
                saved, null, ApplicationStatus.SUBMITTED, candidateUser, "Candidate submitted application"
        );
        historyRepository.save(history);

        // 7. Notify recruiter
        if (job.getCreatedBy() != null) {
            notificationService.sendNotification(
                    job.getCreatedBy().getId(),
                    NotificationType.APPLICATION_RECEIVED,
                    "New Job Application Received",
                    String.format("%s applied for '%s'", candidateUser.getFullName(), job.getTitle()),
                    "Application",
                    saved.getId()
            );
        }

        // 8. Log audit event
        auditService.logEvent(candidateUserId, job.getCompany().getId(), "APPLICATION_SUBMITTED",
                "Application", saved.getId(), "Submitted application for job: " + job.getTitle());

        return ApplicationDto.from(saved);
    }

    @Transactional
    public ApplicationDto transitionStatus(UUID applicationId, UUID actorUserId, Role actorRole,
                                           ApplicationStatus newStatus, String reason) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        User actor = userRepository.findById(actorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorUserId));

        // Company isolation check for recruiter: Application's job MUST belong to recruiter's company!
        if (actorRole == Role.RECRUITER) {
            Company recruiterCompany = companyService.getCompanyForRecruiter(actorUserId);
            if (!application.getJob().getCompany().getId().equals(recruiterCompany.getId())) {
                throw new ForbiddenException("Access denied: You cannot modify applications belonging to another company");
            }
        }

        ApplicationStatus previousStatus = application.getApplicationStatus();
        stateMachine.validateTransition(previousStatus, newStatus, actorRole);

        application.setApplicationStatus(newStatus);
        Application saved = applicationRepository.save(application);

        ApplicationStatusHistory history = new ApplicationStatusHistory(
                saved, previousStatus, newStatus, actor, reason != null ? reason : "Status updated by " + actor.getFullName()
        );
        historyRepository.save(history);

        // Notify candidate of status change
        NotificationType notifType = switch (newStatus) {
            case SHORTLISTED -> NotificationType.APPLICATION_SHORTLISTED;
            case REJECTED -> NotificationType.APPLICATION_REJECTED;
            default -> NotificationType.GENERAL;
        };

        notificationService.sendNotification(
                application.getCandidate().getUser().getId(),
                notifType,
                "Application Status Update",
                String.format("Your application for '%s' is now %s.", application.getJob().getTitle(), newStatus),
                "Application",
                saved.getId()
        );

        auditService.logEvent(actorUserId, application.getJob().getCompany().getId(),
                "APPLICATION_STATUS_TRANSITION", "Application", saved.getId(),
                String.format("Transitioned from %s to %s. Reason: %s", previousStatus, newStatus, reason));

        return ApplicationDto.from(saved);
    }

    @Transactional
    public ApplicationDto withdrawApplication(UUID applicationId, UUID candidateUserId, String reason) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (!application.getCandidate().getUser().getId().equals(candidateUserId)) {
            throw new ForbiddenException("You cannot withdraw an application that does not belong to you");
        }

        return transitionStatus(applicationId, candidateUserId, Role.CANDIDATE, ApplicationStatus.WITHDRAWN,
                reason != null ? reason : "Withdrawn by candidate");
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDto> getCandidateApplications(UUID candidateUserId, Pageable pageable) {
        CandidateProfile candidate = candidateService.getOrCreateProfile(candidateUserId);
        return applicationRepository.findByCandidateIdOrderBySubmittedAtDesc(candidate.getId(), pageable)
                .map(ApplicationDto::from);
    }

    @Transactional(readOnly = true)
    public ApplicationDto getCandidateApplicationDetail(UUID applicationId, UUID candidateUserId) {
        CandidateProfile candidate = candidateService.getOrCreateProfile(candidateUserId);
        Application app = applicationRepository.findByIdAndCandidateId(applicationId, candidate.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found or unauthorized"));
        return ApplicationDto.from(app);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDto> getRecruiterApplications(UUID recruiterUserId, UUID jobId, ApplicationStatus status,
                                                         EligibilityStatus eligibilityStatus, String search, Pageable pageable) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        return applicationRepository.findRecruiterApplications(company.getId(), jobId, status, eligibilityStatus, search, pageable)
                .map(ApplicationDto::from);
    }

    @Transactional(readOnly = true)
    public ApplicationDto getRecruiterApplicationDetail(UUID applicationId, UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Application app = applicationRepository.findByIdAndCompanyId(applicationId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found or unauthorized"));
        return ApplicationDto.from(app);
    }

    @Transactional(readOnly = true)
    public List<ApplicationStatusHistoryDto> getApplicationHistory(UUID applicationId, UUID requesterUserId, Role role) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        // Authorization check: Candidate owns app OR recruiter company owns app OR admin
        if (role == Role.CANDIDATE && !app.getCandidate().getUser().getId().equals(requesterUserId)) {
            throw new ForbiddenException("Unauthorized to view this application history");
        } else if (role == Role.RECRUITER) {
            Company recruiterCompany = companyService.getCompanyForRecruiter(requesterUserId);
            if (!app.getJob().getCompany().getId().equals(recruiterCompany.getId())) {
                throw new ForbiddenException("Unauthorized: Application belongs to another company");
            }
        }

        return historyRepository.findByApplicationIdOrderByCreatedAtAsc(applicationId)
                .stream().map(ApplicationStatusHistoryDto::from).toList();
    }

    @Transactional(readOnly = true)
    public Application getEntityById(UUID applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));
    }
}
