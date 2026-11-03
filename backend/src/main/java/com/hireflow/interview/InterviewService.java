package com.hireflow.interview;

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
import java.util.UUID;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final ApplicationService applicationService;
    private final CompanyService companyService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public InterviewService(InterviewRepository interviewRepository,
                            InterviewFeedbackRepository feedbackRepository,
                            ApplicationService applicationService,
                            CompanyService companyService,
                            UserRepository userRepository,
                            NotificationService notificationService,
                            AuditService auditService) {
        this.interviewRepository = interviewRepository;
        this.feedbackRepository = feedbackRepository;
        this.applicationService = applicationService;
        this.companyService = companyService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public InterviewDto scheduleInterview(UUID recruiterUserId, ScheduleInterviewRequest req) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        User creator = userRepository.findById(recruiterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterUserId));

        Application application = applicationService.getEntityById(req.applicationId());

        // Company isolation check
        if (!application.getJob().getCompany().getId().equals(company.getId())) {
            throw new ForbiddenException("Cannot schedule interview for an application belonging to another company");
        }

        // Time validation
        if (req.scheduledEnd().isBefore(req.scheduledStart()) || req.scheduledEnd().equals(req.scheduledStart())) {
            throw new BadRequestException("Interview scheduled end time must be strictly after the start time");
        }
        if (req.scheduledStart().isBefore(Instant.now())) {
            throw new BadRequestException("Interview start time must be in the future");
        }

        UUID interviewerId = req.interviewerId() != null ? req.interviewerId() : recruiterUserId;
        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Interviewer user", "id", interviewerId));

        // Conflict checks
        if (interviewRepository.existsCandidateConflict(application.getCandidate().getId(), req.scheduledStart(), req.scheduledEnd(), null)) {
            throw new ConflictException("Candidate already has an active interview scheduled during this time slot");
        }
        if (interviewRepository.existsInterviewerConflict(interviewerId, req.scheduledStart(), req.scheduledEnd(), null)) {
            throw new ConflictException("Interviewer already has an active interview scheduled during this time slot");
        }

        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setCandidate(application.getCandidate());
        interview.setInterviewer(interviewer);
        interview.setScheduledStart(req.scheduledStart());
        interview.setScheduledEnd(req.scheduledEnd());
        if (req.timezone() != null) interview.setTimezone(req.timezone());
        interview.setInterviewType(req.interviewType());
        interview.setMeetingLocation(req.meetingLocation());
        interview.setMeetingLink(req.meetingLink());
        interview.setInterviewStatus(InterviewStatus.SCHEDULED);
        interview.setCreatedBy(creator);

        Interview saved = interviewRepository.save(interview);

        // Transition application state to INTERVIEW if eligible
        if (application.getApplicationStatus() == ApplicationStatus.SUBMITTED ||
            application.getApplicationStatus() == ApplicationStatus.UNDER_REVIEW ||
            application.getApplicationStatus() == ApplicationStatus.SHORTLISTED) {
            applicationService.transitionStatus(application.getId(), recruiterUserId, Role.RECRUITER,
                    ApplicationStatus.INTERVIEW, "Interview scheduled for " + req.scheduledStart());
        }

        // Notify candidate
        notificationService.sendNotification(
                application.getCandidate().getUser().getId(),
                NotificationType.INTERVIEW_SCHEDULED,
                "Interview Scheduled",
                String.format("You have a %s interview scheduled for '%s' on %s.",
                        req.interviewType(), application.getJob().getTitle(), req.scheduledStart()),
                "Interview",
                saved.getId()
        );

        auditService.logEvent(recruiterUserId, company.getId(), "INTERVIEW_SCHEDULED", "Interview", saved.getId(),
                String.format("Scheduled %s interview with %s", req.interviewType(), application.getCandidate().getUser().getFullName()));

        return InterviewDto.from(saved, null);
    }

    @Transactional
    public InterviewDto rescheduleInterview(UUID interviewId, UUID recruiterUserId, RescheduleInterviewRequest req) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Interview interview = interviewRepository.findByIdAndCompanyId(interviewId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found or unauthorized"));

        if (req.scheduledEnd().isBefore(req.scheduledStart()) || req.scheduledEnd().equals(req.scheduledStart())) {
            throw new BadRequestException("Interview end time must be after start time");
        }

        // Conflict checks excluding this interview
        if (interviewRepository.existsCandidateConflict(interview.getCandidate().getId(), req.scheduledStart(), req.scheduledEnd(), interviewId)) {
            throw new ConflictException("Candidate has a scheduling conflict during the new time slot");
        }
        if (interviewRepository.existsInterviewerConflict(interview.getInterviewer().getId(), req.scheduledStart(), req.scheduledEnd(), interviewId)) {
            throw new ConflictException("Interviewer has a scheduling conflict during the new time slot");
        }

        interview.setScheduledStart(req.scheduledStart());
        interview.setScheduledEnd(req.scheduledEnd());
        if (req.meetingLink() != null) interview.setMeetingLink(req.meetingLink());
        interview.setInterviewStatus(InterviewStatus.RESCHEDULED);

        Interview saved = interviewRepository.save(interview);

        notificationService.sendNotification(
                interview.getCandidate().getUser().getId(),
                NotificationType.INTERVIEW_RESCHEDULED,
                "Interview Rescheduled",
                String.format("Your interview for '%s' has been rescheduled to %s. Reason: %s",
                        interview.getApplication().getJob().getTitle(), req.scheduledStart(), req.reason()),
                "Interview",
                saved.getId()
        );

        auditService.logEvent(recruiterUserId, company.getId(), "INTERVIEW_RESCHEDULED", "Interview", saved.getId(),
                "Rescheduled interview to " + req.scheduledStart());

        InterviewFeedbackDto feedbackDto = feedbackRepository.findByInterviewId(saved.getId())
                .map(InterviewFeedbackDto::from).orElse(null);
        return InterviewDto.from(saved, feedbackDto);
    }

    @Transactional
    public InterviewDto cancelInterview(UUID interviewId, UUID recruiterUserId, String reason) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Interview interview = interviewRepository.findByIdAndCompanyId(interviewId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found or unauthorized"));

        interview.setInterviewStatus(InterviewStatus.CANCELLED);
        Interview saved = interviewRepository.save(interview);

        notificationService.sendNotification(
                interview.getCandidate().getUser().getId(),
                NotificationType.INTERVIEW_CANCELLED,
                "Interview Cancelled",
                String.format("Your interview for '%s' scheduled for %s has been cancelled. Reason: %s",
                        interview.getApplication().getJob().getTitle(), interview.getScheduledStart(), reason),
                "Interview",
                saved.getId()
        );

        auditService.logEvent(recruiterUserId, company.getId(), "INTERVIEW_CANCELLED", "Interview", saved.getId(),
                "Cancelled interview. Reason: " + reason);

        return InterviewDto.from(saved, null);
    }

    @Transactional
    public InterviewFeedbackDto submitFeedback(UUID interviewId, UUID recruiterUserId, SubmitFeedbackRequest req) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Interview interview = interviewRepository.findByIdAndCompanyId(interviewId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found or unauthorized"));

        User reviewer = userRepository.findById(recruiterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterUserId));

        if (feedbackRepository.findByInterviewId(interviewId).isPresent()) {
            throw new ConflictException("Feedback has already been submitted for this interview");
        }

        InterviewFeedback feedback = new InterviewFeedback();
        feedback.setInterview(interview);
        feedback.setInterviewer(reviewer);
        feedback.setTechnicalRating(req.technicalRating());
        feedback.setCommunicationRating(req.communicationRating());
        feedback.setProblemSolvingRating(req.problemSolvingRating());
        feedback.setOverallRating(req.overallRating());
        feedback.setRecommendation(req.recommendation());
        feedback.setFeedbackText(req.feedbackText());

        InterviewFeedback saved = feedbackRepository.save(feedback);

        interview.setInterviewStatus(InterviewStatus.COMPLETED);
        interviewRepository.save(interview);

        auditService.logEvent(recruiterUserId, company.getId(), "INTERVIEW_FEEDBACK_SUBMITTED",
                "InterviewFeedback", saved.getId(), "Submitted feedback: " + req.recommendation());

        return InterviewFeedbackDto.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<InterviewDto> getRecruiterInterviews(UUID recruiterUserId, Pageable pageable) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        return interviewRepository.findCompanyInterviews(company.getId(), pageable)
                .map(i -> {
                    InterviewFeedbackDto feedback = feedbackRepository.findByInterviewId(i.getId())
                            .map(InterviewFeedbackDto::from).orElse(null);
                    return InterviewDto.from(i, feedback);
                });
    }

    @Transactional(readOnly = true)
    public InterviewDto getRecruiterInterviewById(UUID interviewId, UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Interview i = interviewRepository.findByIdAndCompanyId(interviewId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found or unauthorized"));
        InterviewFeedbackDto feedback = feedbackRepository.findByInterviewId(i.getId())
                .map(InterviewFeedbackDto::from).orElse(null);
        return InterviewDto.from(i, feedback);
    }

    @Transactional(readOnly = true)
    public Page<InterviewDto> getCandidateInterviews(UUID candidateUserId, Pageable pageable) {
        return interviewRepository.findCandidateInterviews(candidateUserId, pageable)
                .map(i -> InterviewDto.from(i, null)); // Feedback is confidential to company recruiters
    }
}
