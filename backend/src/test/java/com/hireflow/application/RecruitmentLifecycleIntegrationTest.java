package com.hireflow.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireflow.common.security.JwtTokenProvider;
import com.hireflow.interview.FeedbackRecommendation;
import com.hireflow.interview.InterviewType;
import com.hireflow.interview.ScheduleInterviewRequest;
import com.hireflow.interview.SubmitFeedbackRequest;
import com.hireflow.job.*;
import com.hireflow.offer.CreateOfferRequest;
import com.hireflow.user.AccountStatus;
import com.hireflow.user.Role;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RecruitmentLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private String adminToken;

    @BeforeEach
    void setupAdmin() {
        if (!userRepository.existsByEmail("test_admin@hireflow.dev")) {
            User admin = new User();
            admin.setEmail("test_admin@hireflow.dev");
            admin.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setRole(Role.ADMIN);
            admin.setAccountStatus(AccountStatus.ACTIVE);
            User saved = userRepository.save(admin);
            adminToken = tokenProvider.generateAccessToken(saved);
        } else {
            User admin = userRepository.findByEmail("test_admin@hireflow.dev").orElseThrow();
            adminToken = tokenProvider.generateAccessToken(admin);
        }
    }

    @Test
    @DisplayName("Complete end-to-end recruitment lifecycle from job post to offer acceptance")
    void testFullRecruitmentLifecycle() throws Exception {
        long ts = System.currentTimeMillis();

        // 1. RECRUITER REGISTRATION (Company initially PENDING)
        String recruiterEmail = "recruiter_" + ts + "@nexus.com";
        String regRecruiterJson = """
            {
                "email": "%s",
                "password": "Password123!",
                "firstName": "Alex",
                "lastName": "Vance",
                "phoneNumber": "+1 555-4321",
                "companyName": "Nexus Technologies %d",
                "companyDescription": "Cloud AI platforms",
                "companyWebsite": "https://nexus%d.com",
                "industry": "Technology",
                "companySize": "100-500",
                "headquartersLocation": "Seattle, WA"
            }
        """.formatted(recruiterEmail, ts, ts);

        MvcResult recruiterRegResult = mockMvc.perform(post("/api/v1/auth/register/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(regRecruiterJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.company.status").value("PENDING"))
                .andReturn();

        String recruiterToken = objectMapper.readTree(recruiterRegResult.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
        String companyId = objectMapper.readTree(recruiterRegResult.getResponse().getContentAsString())
                .path("data").path("company").path("id").asText();

        // 2. RECRUITER CREATES DRAFT JOB
        String createJobJson = """
            {
                "title": "Senior Backend Architect",
                "department": "Engineering",
                "description": "Lead the core distributed transaction platform architecture.",
                "responsibilities": "Architect high-throughput microservices and mentor senior engineers.",
                "requiredQualifications": "7+ years backend engineering with Java or Go.",
                "preferredQualifications": "AWS or GCP infrastructure experience.",
                "employmentType": "FULL_TIME",
                "workplaceType": "HYBRID",
                "location": "Seattle, WA",
                "salaryMin": 160000,
                "salaryMax": 210000,
                "currency": "USD",
                "experienceMin": 5,
                "experienceMax": 10
            }
        """;

        MvcResult createJobResult = mockMvc.perform(post("/api/v1/recruiter/jobs")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJobJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andReturn();

        String jobId = objectMapper.readTree(createJobResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 3. CANNOT PUBLISH JOB BEFORE COMPANY APPROVAL
        mockMvc.perform(post("/api/v1/recruiter/jobs/" + jobId + "/publish")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("must be approved by an administrator")));

        // 4. ADMIN APPROVES COMPANY
        mockMvc.perform(post("/api/v1/admin/companies/" + companyId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // 5. RECRUITER NOW PUBLISHES JOB
        mockMvc.perform(post("/api/v1/recruiter/jobs/" + jobId + "/publish")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"));

        // 6. PUBLIC JOB DIRECTORY VERIFICATION
        mockMvc.perform(get("/api/v1/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", not(empty())));

        mockMvc.perform(get("/api/v1/jobs/" + jobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Senior Backend Architect"));

        // 7. CANDIDATE REGISTRATION & PROFILE SETUP
        String candidateEmail = "candidate_" + ts + "@talent.org";
        String regCandidateJson = """
            {
                "email": "%s",
                "password": "Password123!",
                "firstName": "Gordon",
                "lastName": "Freeman",
                "phoneNumber": "+1 555-9000"
            }
        """.formatted(candidateEmail);

        MvcResult candidateRegResult = mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(regCandidateJson))
                .andExpect(status().isOk())
                .andReturn();

        String candidateToken = objectMapper.readTree(candidateRegResult.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        // 8. CANDIDATE UPLOADS VALID PDF RESUME
        byte[] validPdfBytes = "%PDF-1.4\n%\\xe2\\xe3\\xcf\\xd3\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF".getBytes(StandardCharsets.US_ASCII);
        MockMultipartFile resumeFile = new MockMultipartFile(
                "file", "Gordon_Freeman_Resume.pdf", "application/pdf", validPdfBytes
        );

        mockMvc.perform(multipart("/api/v1/candidate/resume")
                        .file(resumeFile)
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.originalFilename").value("Gordon_Freeman_Resume.pdf"));

        // 9. CANDIDATE APPLIES FOR JOB
        String applyJson = """
            {
                "coverLetter": "Excited to architect distributed systems for Nexus."
            }
        """;

        MvcResult applyResult = mockMvc.perform(post("/api/v1/candidate/jobs/" + jobId + "/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(applyJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.data.eligibilityStatus").isNotEmpty())
                .andReturn();

        String applicationId = objectMapper.readTree(applyResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 10. DUPLICATE APPLICATION REJECTED
        mockMvc.perform(post("/api/v1/candidate/jobs/" + jobId + "/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(applyJson))
                .andExpect(status().isConflict());

        // 11. RECRUITER PIPELINE PROGRESSION: SUBMITTED -> UNDER_REVIEW -> SHORTLISTED -> INTERVIEW
        mockMvc.perform(patch("/api/v1/recruiter/applications/" + applicationId + "/status?status=UNDER_REVIEW")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("UNDER_REVIEW"));

        mockMvc.perform(patch("/api/v1/recruiter/applications/" + applicationId + "/status?status=SHORTLISTED")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SHORTLISTED"));

        mockMvc.perform(patch("/api/v1/recruiter/applications/" + applicationId + "/status?status=INTERVIEW")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INTERVIEW"));

        // 12. RECRUITER SCHEDULES INTERVIEW
        Instant interviewStart = Instant.now().plus(2, ChronoUnit.DAYS);
        Instant interviewEnd = interviewStart.plus(1, ChronoUnit.HOURS);
        ScheduleInterviewRequest scheduleReq = new ScheduleInterviewRequest(
                UUID.fromString(applicationId),
                null,
                interviewStart,
                interviewEnd,
                "America/Los_Angeles",
                InterviewType.TECHNICAL,
                "Google Meet",
                "https://meet.google.com/xyz-abc"
        );

        MvcResult interviewResult = mockMvc.perform(post("/api/v1/recruiter/interviews")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scheduleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SCHEDULED"))
                .andReturn();

        String interviewId = objectMapper.readTree(interviewResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 13. CANDIDATE SEES SCHEDULED INTERVIEW
        mockMvc.perform(get("/api/v1/candidate/interviews")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", not(empty())));

        // 14. RECRUITER SUBMITS SCORECARD FEEDBACK
        SubmitFeedbackRequest feedbackReq = new SubmitFeedbackRequest(
                5, 5, 5, 5, FeedbackRecommendation.STRONG_YES, "Exceptional deep systems knowledge."
        );

        mockMvc.perform(post("/api/v1/recruiter/interviews/" + interviewId + "/feedback")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(feedbackReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.recommendation").value("STRONG_YES"));

        // 15. RECRUITER ISSUES EMPLOYMENT OFFER
        CreateOfferRequest offerReq = new CreateOfferRequest(
                UUID.fromString(applicationId),
                new BigDecimal("195000.00"),
                "USD",
                "FULL_TIME",
                LocalDate.now().plusDays(30),
                Instant.now().plus(14, ChronoUnit.DAYS),
                "Standard health, 401(k), 25 days PTO."
        );

        MvcResult offerResult = mockMvc.perform(post("/api/v1/recruiter/offers")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SENT"))
                .andExpect(jsonPath("$.data.salary").value(195000.00))
                .andReturn();

        String offerId = objectMapper.readTree(offerResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 16. CANDIDATE ACCEPTS OFFER -> STATUS BECOMES HIRED
        mockMvc.perform(post("/api/v1/candidate/offers/" + offerId + "/accept")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"));

        // 17. VERIFY FINAL APPLICATION STATUS IS HIRED
        mockMvc.perform(get("/api/v1/recruiter/applications/" + applicationId)
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("HIRED"));
    }
}
