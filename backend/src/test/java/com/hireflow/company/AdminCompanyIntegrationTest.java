package com.hireflow.company;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireflow.auth.LoginRequest;
import com.hireflow.auth.RegisterRecruiterRequest;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminCompanyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;

    @BeforeEach
    void setUpAdmin() throws Exception {
        String adminEmail = "admin@hireflow.test";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("AdminSecret123!"));
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setRole(Role.ADMIN);
            admin.setAccountStatus(AccountStatus.ACTIVE);
            admin.setEmailVerified(true);
            userRepository.save(admin);
        }

        LoginRequest login = new LoginRequest(adminEmail, "AdminSecret123!");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        adminToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("Admin end-to-end governance: Approve, Reject, Suspend, and Audit Verification")
    void testAdminCompanyLifecycleAndAudit() throws Exception {
        long ts = System.currentTimeMillis();

        // 1. Recruiter registers Company 1 (will be rejected)
        String recEmail1 = "recruiter1_" + ts + "@startup.test";
        RegisterRecruiterRequest regCo1 = new RegisterRecruiterRequest(
                recEmail1,
                "RecruiterPass123!",
                "Alice",
                "Founder",
                "+1 555-0101",
                "Unverified Tech",
                "https://unverifiedtech.test",
                "Technology",
                "10-50",
                "San Francisco, CA",
                "Small startup"
        );
        MvcResult regRes1 = mockMvc.perform(post("/api/v1/auth/register/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regCo1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.company.status").value("PENDING"))
                .andReturn();

        String co1Id = objectMapper.readTree(regRes1.getResponse().getContentAsString())
                .path("data").path("company").path("id").asText();

        // 2. Admin retrieves pending companies
        mockMvc.perform(get("/api/v1/admin/companies?status=PENDING")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[*].id", hasItem(co1Id)));

        // 3. Admin rejects Company 1 with reason
        ReviewCompanyRequest rejectReq = new ReviewCompanyRequest("Incomplete incorporation documents");
        mockMvc.perform(post("/api/v1/admin/companies/" + co1Id + "/reject")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REJECTED"))
                .andExpect(jsonPath("$.data.reviewReason").value("Incomplete incorporation documents"));

        // 4. Recruiter registers Company 2 (will be approved then suspended)
        String recEmail2 = "recruiter2_" + ts + "@globex.test";
        RegisterRecruiterRequest regCo2 = new RegisterRecruiterRequest(
                recEmail2,
                "RecruiterPass123!",
                "Bob",
                "Manager",
                "+1 555-0102",
                "Globex Global",
                "https://globex.test",
                "Logistics",
                "500+",
                "New York, NY",
                "Global leader"
        );
        MvcResult regRes2 = mockMvc.perform(post("/api/v1/auth/register/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regCo2)))
                .andExpect(status().isOk())
                .andReturn();

        String co2Id = objectMapper.readTree(regRes2.getResponse().getContentAsString())
                .path("data").path("company").path("id").asText();

        // 5. Admin approves Company 2
        mockMvc.perform(post("/api/v1/admin/companies/" + co2Id + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // 6. Admin suspends Company 2
        ReviewCompanyRequest suspendReq = new ReviewCompanyRequest("Suspected fraudulent job posting");
        mockMvc.perform(post("/api/v1/admin/companies/" + co2Id + "/suspend")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suspendReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SUSPENDED"))
                .andExpect(jsonPath("$.data.reviewReason").value("Suspected fraudulent job posting"));

        // 7. Admin queries Audit Logs
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", not(empty())))
                .andExpect(jsonPath("$.data.content[*].action", hasItems(
                        "COMPANY_REJECTED", "COMPANY_APPROVED", "COMPANY_SUSPENDED"
                )));

        // 8. Test action filter in Audit Logs
        mockMvc.perform(get("/api/v1/admin/audit-logs?action=COMPANY_APPROVED")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[*].action", everyItem(equalTo("COMPANY_APPROVED"))));
    }

    @Test
    @DisplayName("Non-admin role access control: Recruiters and anonymous users are blocked from admin APIs")
    void testAdminAuthorizationGuards() throws Exception {
        // Anonymous request blocked
        mockMvc.perform(get("/api/v1/admin/companies"))
                .andExpect(status().isUnauthorized());

        // Recruiter request blocked with 403 Forbidden
        String recEmail = "recruiter_unauth_" + System.currentTimeMillis() + "@test.com";
        RegisterRecruiterRequest regCo = new RegisterRecruiterRequest(
                recEmail, "RecruiterPass123!", "Sam", "Smith", "+1 555-9999",
                "Unauth Co", "https://unauth.test", "Technology", "10-50", "Austin, TX", "Desc"
        );
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regCo)))
                .andExpect(status().isOk())
                .andReturn();

        String recToken = objectMapper.readTree(regRes.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        mockMvc.perform(get("/api/v1/admin/companies")
                        .header("Authorization", "Bearer " + recToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .header("Authorization", "Bearer " + recToken))
                .andExpect(status().isForbidden());
    }
}
