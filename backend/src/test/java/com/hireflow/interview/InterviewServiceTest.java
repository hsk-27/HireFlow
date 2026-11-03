package com.hireflow.interview;

import com.hireflow.application.Application;
import com.hireflow.application.ApplicationService;
import com.hireflow.application.ApplicationStatus;
import com.hireflow.audit.AuditService;
import com.hireflow.candidate.CandidateProfile;
import com.hireflow.common.exception.BadRequestException;
import com.hireflow.common.exception.ConflictException;
import com.hireflow.common.exception.ForbiddenException;
import com.hireflow.company.Company;
import com.hireflow.company.CompanyService;
import com.hireflow.job.Job;
import com.hireflow.notification.NotificationService;
import com.hireflow.user.Role;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewServiceTest {

    @Mock private InterviewRepository interviewRepository;
    @Mock private InterviewFeedbackRepository feedbackRepository;
    @Mock private ApplicationService applicationService;
    @Mock private CompanyService companyService;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private AuditService auditService;

    private InterviewService interviewService;

    @BeforeEach
    void setUp() {
        interviewService = new InterviewService(
                interviewRepository, feedbackRepository, applicationService, companyService,
                userRepository, notificationService, auditService
        );
    }

    @Test
    @DisplayName("Interview end time must be after start time")
    void testEndBeforeStartFails() {
        UUID recruiterId = UUID.randomUUID();
        UUID appId = UUID.randomUUID();

        Company company = new Company();
        company.setId(UUID.randomUUID());

        Job job = new Job();
        job.setCompany(company);

        Application app = new Application();
        app.setId(appId);
        app.setJob(job);

        User recruiter = new User();
        recruiter.setId(recruiterId);
        recruiter.setRole(Role.RECRUITER);

        when(companyService.getCompanyForRecruiter(recruiterId)).thenReturn(company);
        when(userRepository.findById(recruiterId)).thenReturn(Optional.of(recruiter));
        when(applicationService.getEntityById(appId)).thenReturn(app);

        Instant start = Instant.now().plus(2, ChronoUnit.DAYS);
        Instant end = start.minus(30, ChronoUnit.MINUTES); // End is BEFORE start!

        ScheduleInterviewRequest req = new ScheduleInterviewRequest(
                appId, recruiterId, start, end, "UTC", InterviewType.TECHNICAL, "Online", null
        );

        assertThrows(BadRequestException.class, () -> interviewService.scheduleInterview(recruiterId, req));
    }

    @Test
    @DisplayName("Candidate interview conflict must be rejected with 409 Conflict")
    void testCandidateConflictDetected() {
        UUID recruiterId = UUID.randomUUID();
        UUID appId = UUID.randomUUID();
        UUID candProfileId = UUID.randomUUID();

        Company company = new Company();
        company.setId(UUID.randomUUID());

        Job job = new Job();
        job.setCompany(company);

        CandidateProfile candProfile = new CandidateProfile();
        candProfile.setId(candProfileId);

        Application app = new Application();
        app.setId(appId);
        app.setJob(job);
        app.setCandidate(candProfile);

        User recruiter = new User();
        recruiter.setId(recruiterId);
        recruiter.setRole(Role.RECRUITER);

        Instant start = Instant.now().plus(1, ChronoUnit.DAYS);
        Instant end = start.plus(45, ChronoUnit.MINUTES);

        when(companyService.getCompanyForRecruiter(recruiterId)).thenReturn(company);
        when(userRepository.findById(recruiterId)).thenReturn(Optional.of(recruiter));
        when(applicationService.getEntityById(appId)).thenReturn(app);
        when(interviewRepository.existsCandidateConflict(candProfileId, start, end, null)).thenReturn(true);

        ScheduleInterviewRequest req = new ScheduleInterviewRequest(
                appId, recruiterId, start, end, "UTC", InterviewType.TECHNICAL, "Online", null
        );

        assertThrows(ConflictException.class, () -> interviewService.scheduleInterview(recruiterId, req));
    }
}
