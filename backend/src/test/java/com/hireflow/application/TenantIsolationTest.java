package com.hireflow.application;

import com.hireflow.audit.AuditService;
import com.hireflow.candidate.CandidateEducationRepository;
import com.hireflow.candidate.CandidateExperienceRepository;
import com.hireflow.candidate.CandidateProfile;
import com.hireflow.candidate.CandidateService;
import com.hireflow.common.exception.ForbiddenException;
import com.hireflow.company.Company;
import com.hireflow.company.CompanyService;
import com.hireflow.job.*;
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

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantIsolationTest {

    @Mock private ApplicationRepository applicationRepository;
    @Mock private ApplicationStatusHistoryRepository historyRepository;
    @Mock private ApplicationStateMachine stateMachine;
    @Mock private EligibilityEvaluationService eligibilityService;
    @Mock private JobService jobService;
    @Mock private JobEligibilityCriteriaRepository criteriaRepository;
    @Mock private JobEligibleBranchRepository branchRepository;
    @Mock private JobEligibleDegreeRepository degreeRepository;
    @Mock private CandidateService candidateService;
    @Mock private CandidateEducationRepository educationRepository;
    @Mock private CandidateExperienceRepository experienceRepository;
    @Mock private CompanyService companyService;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private AuditService auditService;

    private ApplicationService applicationService;

    @BeforeEach
    void setUp() {
        applicationService = new ApplicationService(
                applicationRepository, historyRepository, stateMachine, eligibilityService,
                jobService, criteriaRepository, branchRepository, degreeRepository,
                candidateService, educationRepository, experienceRepository, companyService,
                userRepository, notificationService, auditService
        );
    }

    @Test
    @DisplayName("Company A recruiter cannot transition status for Company B application")
    void testCrossCompanyApplicationTransitionBlocked() {
        UUID companyAId = UUID.randomUUID();
        UUID companyBId = UUID.randomUUID();
        UUID recruiterAUserId = UUID.randomUUID();
        UUID appId = UUID.randomUUID();

        Company companyA = new Company();
        companyA.setId(companyAId);
        companyA.setName("Company A");

        Company companyB = new Company();
        companyB.setId(companyBId);
        companyB.setName("Company B");

        Job jobB = new Job();
        jobB.setCompany(companyB);

        Application app = new Application();
        app.setId(appId);
        app.setJob(jobB);
        app.setApplicationStatus(ApplicationStatus.SUBMITTED);

        User recruiterA = new User();
        recruiterA.setId(recruiterAUserId);
        recruiterA.setRole(Role.RECRUITER);

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(app));
        when(userRepository.findById(recruiterAUserId)).thenReturn(Optional.of(recruiterA));
        when(companyService.getCompanyForRecruiter(recruiterAUserId)).thenReturn(companyA);

        assertThrows(ForbiddenException.class, () -> applicationService.transitionStatus(
                appId, recruiterAUserId, Role.RECRUITER, ApplicationStatus.UNDER_REVIEW, "Attempt cross-company transition"
        ));
    }
}
