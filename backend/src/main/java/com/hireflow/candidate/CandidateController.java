package com.hireflow.candidate;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.security.SecurityUtils;
import com.hireflow.user.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidate")
@Tag(name = "Candidate Profile", description = "Candidate profile, education, experience, and resume management")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get current candidate profile")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> getProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        CandidateProfile profile = candidateService.getOrCreateProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(CandidateProfileDto.from(profile)));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Update candidate profile summary and links")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> updateProfile(@Valid @RequestBody UpdateCandidateProfileRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        CandidateProfile updated = candidateService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(CandidateProfileDto.from(updated), "Profile updated successfully"));
    }

    // --- Education ---

    @GetMapping("/education")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get candidate education history")
    public ResponseEntity<ApiResponse<List<CandidateEducationDto>>> getEducation() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(candidateService.getEducationList(userId)));
    }

    @PostMapping("/education")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Add education record")
    public ResponseEntity<ApiResponse<CandidateEducationDto>> addEducation(@Valid @RequestBody CreateEducationRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(candidateService.addEducation(userId, request), "Education added"));
    }

    @DeleteMapping("/education/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Delete education record")
    public ResponseEntity<ApiResponse<Void>> deleteEducation(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        candidateService.deleteEducation(userId, id);
        return ResponseEntity.ok(ApiResponse.message("Education record deleted"));
    }

    // --- Experience ---

    @GetMapping("/experience")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get candidate work experience")
    public ResponseEntity<ApiResponse<List<CandidateExperienceDto>>> getExperience() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(candidateService.getExperienceList(userId)));
    }

    @PostMapping("/experience")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Add work experience")
    public ResponseEntity<ApiResponse<CandidateExperienceDto>> addExperience(@Valid @RequestBody CreateExperienceRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(candidateService.addExperience(userId, request), "Experience added"));
    }

    @DeleteMapping("/experience/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Delete work experience")
    public ResponseEntity<ApiResponse<Void>> deleteExperience(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        candidateService.deleteExperience(userId, id);
        return ResponseEntity.ok(ApiResponse.message("Experience record deleted"));
    }

    // --- Skills ---

    @GetMapping("/skills")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get candidate skills")
    public ResponseEntity<ApiResponse<List<SkillDto>>> getSkills() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(candidateService.getCandidateSkills(userId)));
    }

    @PostMapping("/skills")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Add skill to candidate profile")
    public ResponseEntity<ApiResponse<SkillDto>> addSkill(@Valid @RequestBody AddSkillRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(candidateService.addSkill(userId, request), "Skill added"));
    }

    @DeleteMapping("/skills/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Remove skill from profile")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        candidateService.deleteSkill(userId, id);
        return ResponseEntity.ok(ApiResponse.message("Skill removed"));
    }

    // --- Resume ---

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Upload or replace candidate resume")
    public ResponseEntity<ApiResponse<DocumentDto>> uploadResume(@RequestParam("file") MultipartFile file) {
        UUID userId = SecurityUtils.getCurrentUserId();
        DocumentDto doc = candidateService.uploadResume(userId, file);
        return ResponseEntity.ok(ApiResponse.success(doc, "Resume uploaded successfully"));
    }

    @GetMapping("/resume")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get current resume metadata")
    public ResponseEntity<ApiResponse<DocumentDto>> getCurrentResume() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(candidateService.getCurrentResume(userId)));
    }

    @DeleteMapping("/resume")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Remove current resume")
    public ResponseEntity<ApiResponse<Void>> deleteResume() {
        UUID userId = SecurityUtils.getCurrentUserId();
        candidateService.deleteResume(userId);
        return ResponseEntity.ok(ApiResponse.message("Resume removed"));
    }

    @GetMapping("/resume/{documentId}/download")
    @Operation(summary = "Download candidate resume with ownership authorization")
    public ResponseEntity<Resource> downloadResume(@PathVariable UUID documentId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Role role = SecurityUtils.getCurrentUserRole();
        Resource resource = candidateService.downloadResume(userId, role, documentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
