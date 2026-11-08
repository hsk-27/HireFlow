package com.hireflow.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Complete authentication lifecycle: Candidate registration, login, profile, and logout")
    void testCandidateAuthLifecycle() throws Exception {
        String email = "candidate_" + System.currentTimeMillis() + "@test.com";

        // 1. Register candidate
        RegisterCandidateRequest regReq = new RegisterCandidateRequest(
                email,
                "StrongPass123!",
                "Sarah",
                "Connor",
                "+1 555-1234"
        );

        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.role").value("CANDIDATE"))
                .andExpect(jsonPath("$.data.user.email").value(email.toLowerCase()))
                .andReturn();

        String token = objectMapper.readTree(regResult.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        // 2. Fetch authenticated profile
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(email.toLowerCase()))
                .andExpect(jsonPath("$.data.fullName").value("Sarah Connor"));

        // 3. Login with credentials
        LoginRequest loginReq = new LoginRequest(email, "StrongPass123!");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        String refreshToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .path("data").path("refreshToken").asText();

        // 4. Token refresh rotation
        TokenRefreshRequest refreshReq = new TokenRefreshRequest(refreshToken);
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").value(not(refreshToken)));

        // 5. Change password
        ChangePasswordRequest changeReq = new ChangePasswordRequest("StrongPass123!", "NewStrongPass456!");
        mockMvc.perform(post("/api/v1/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 6. Login with new password
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "NewStrongPass456!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 7. Old password rejected
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "StrongPass123!"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Recruiter registration creates company in PENDING status")
    void testRecruiterRegistration() throws Exception {
        String email = "recruiter_" + System.currentTimeMillis() + "@acme.com";

        RegisterRecruiterRequest req = new RegisterRecruiterRequest(
                email,
                "RecruiterPass123!",
                "Robert",
                "California",
                "+1 555-9876",
                "Dunder Mifflin " + System.currentTimeMillis(),
                "Leading paper supplier",
                "https://dundermifflin.com",
                "Paper & Office Supplies",
                "50-200",
                "Scranton, PA"
        );

        mockMvc.perform(post("/api/v1/auth/register/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.role").value("RECRUITER"))
                .andExpect(jsonPath("$.data.company").isNotEmpty())
                .andExpect(jsonPath("$.data.company.status").value("PENDING"));
    }

    @Test
    @DisplayName("Invalid login credentials return 401 Unauthorized")
    void testInvalidLoginCredentials() throws Exception {
        LoginRequest loginReq = new LoginRequest("nonexistent@example.com", "WrongPassword!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("Invalid email or password")));
    }
}
