package com.hireflow.company;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/companies")
@Tag(name = "Companies", description = "Company management for recruiters")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Get current recruiter company details")
    public ResponseEntity<ApiResponse<CompanyDto>> getMyCompany() {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        Company company = companyService.getCompanyForRecruiter(recruiterId);
        return ResponseEntity.ok(ApiResponse.success(CompanyDto.from(company)));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Update current recruiter company profile")
    public ResponseEntity<ApiResponse<CompanyDto>> updateMyCompany(@Valid @RequestBody UpdateCompanyRequest request) {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        Company updated = companyService.updateCompany(recruiterId, request);
        return ResponseEntity.ok(ApiResponse.success(CompanyDto.from(updated), "Company profile updated successfully"));
    }

    @GetMapping("/me/status")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Get company approval status for current recruiter")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyCompanyStatus() {
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        Company company = companyService.getCompanyForRecruiter(recruiterId);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "companyId", company.getId(),
                "companyName", company.getName(),
                "status", company.getCompanyStatus(),
                "reviewReason", company.getReviewReason() != null ? company.getReviewReason() : "",
                "isApproved", company.getCompanyStatus() == CompanyStatus.APPROVED
        )));
    }
}
