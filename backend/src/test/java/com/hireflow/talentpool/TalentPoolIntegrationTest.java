package com.hireflow.talentpool;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireflow.auth.RegisterRecruiterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TalentPoolIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Talent Pool end-to-end: Manual creation, CSV ingestion, status progression, and tenant isolation")
    void testTalentPoolCompleteFlow() throws Exception {
        long ts = System.currentTimeMillis();

        // 1. Register Recruiter for Company A
        String emailA = "recruiter_a_" + ts + "@companya.test";
        RegisterRecruiterRequest regA = new RegisterRecruiterRequest(
                emailA, "RecruiterPass123!", "Elena", "Rostova", "+1 555-8001",
                "TalentCorp Alpha", "https://alpha.test", "Staffing", "50-100", "London, UK", "Global executive search"
        );
        MvcResult resA = mockMvc.perform(post("/api/v1/auth/register/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regA)))
                .andExpect(status().isOk())
                .andReturn();
        String tokenA = objectMapper.readTree(resA.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        // 2. Register Recruiter for Company B (to test tenant isolation)
        String emailB = "recruiter_b_" + ts + "@companyb.test";
        RegisterRecruiterRequest regB = new RegisterRecruiterRequest(
                emailB, "RecruiterPass123!", "Boris", "Ivanov", "+1 555-8002",
                "Beta Staffing", "https://beta.test", "Technology", "20-50", "Berlin, DE", "Technical staffing"
        );
        MvcResult resB = mockMvc.perform(post("/api/v1/auth/register/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regB)))
                .andExpect(status().isOk())
                .andReturn();
        String tokenB = objectMapper.readTree(resB.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        // 3. Company A creates an individual lead manually
        CreateLeadRequest createReq = new CreateLeadRequest(
                "Marcus Aurelius",
                "marcus_" + ts + "@stoic.test",
                "+1 555-3001",
                "Roman Technologies",
                "Principal Architect",
                BigDecimal.valueOf(12.5),
                "Rome, IT",
                "Java, Spring Boot, Architecture, Kubernetes",
                "DIRECT_SOURCING"
        );
        MvcResult leadRes = mockMvc.perform(post("/api/v1/recruiter/talent-pool")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Marcus Aurelius"))
                .andExpect(jsonPath("$.data.status").value("NEW"))
                .andReturn();

        String leadId = objectMapper.readTree(leadRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 4. Retrieve leads for Company A
        mockMvc.perform(get("/api/v1/recruiter/talent-pool")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[*].id", hasItem(leadId)));

        // Also test the /recruiter/talent-pool/leads alias
        mockMvc.perform(get("/api/v1/recruiter/talent-pool/leads?search=Marcus")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[*].fullName", hasItem("Marcus Aurelius")));

        // 5. Update lead pipeline status to CONTACTED
        mockMvc.perform(patch("/api/v1/recruiter/talent-pool/leads/" + leadId + "/status?status=CONTACTED")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONTACTED"));

        // 6. Bulk import leads via CSV file
        String csvContent = "first_name,last_name,email,phone_number,current_company,current_title,years_experience,skills\n" +
                "Ada,Lovelace,ada_" + ts + "@computing.org,+1 555-4001,Babbage Labs,Algorithm Architect,8,Algorithms, Math, Logic\n" +
                "Alan,Turing,alan_" + ts + "@enigma.org,+1 555-4002,Bletchley Inc,Cryptography Lead,10,Crypto, Java, AI\n" +
                "Duplicate,Marcus,marcus_" + ts + "@stoic.test,+1 555-3001,Roman Technologies,Architect,12,Java\n";

        MockMultipartFile csvFile = new MockMultipartFile(
                "file",
                "candidates.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/v1/recruiter/talent-pool/import")
                        .file(csvFile)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalProcessed").value(3))
                .andExpect(jsonPath("$.data.importedCount").value(2))
                .andExpect(jsonPath("$.data.skippedDuplicateCount").value(1));

        // 7. Verify all imported leads are in Company A's talent pool
        mockMvc.perform(get("/api/v1/recruiter/talent-pool")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(3));

        // 8. Strict Tenant Isolation: Company B cannot view or modify Company A's leads
        mockMvc.perform(get("/api/v1/recruiter/talent-pool")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));

        mockMvc.perform(get("/api/v1/recruiter/talent-pool/" + leadId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch("/api/v1/recruiter/talent-pool/leads/" + leadId + "/status?status=ARCHIVED")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // 9. Verify 400 Bad Request on invalid enum parameter
        mockMvc.perform(patch("/api/v1/recruiter/talent-pool/leads/" + leadId + "/status?status=NON_EXISTENT_STATUS")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Invalid value 'NON_EXISTENT_STATUS'")));
    }
}
