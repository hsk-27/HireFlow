package com.hireflow.company;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.response.PagedResponse;
import com.hireflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/companies")
@Tag(name = "Admin Companies", description = "Administrative company approval and moderation")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCompanyController {

    private final CompanyService companyService;

    public AdminCompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    @Operation(summary = "List all companies with optional status filter")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyDto>>> getCompanies(
            @RequestParam(required = false) CompanyStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(companyService.getCompaniesForAdmin(status, pageable).map(CompanyDto::from))
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company details by ID for review")
    public ResponseEntity<ApiResponse<CompanyDto>> getCompanyById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(CompanyDto.from(companyService.getCompanyById(id))));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve pending company registration")
    public ResponseEntity<ApiResponse<CompanyDto>> approveCompany(@PathVariable UUID id) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        Company approved = companyService.approveCompany(id, adminId);
        return ResponseEntity.ok(ApiResponse.success(CompanyDto.from(approved), "Company approved successfully"));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject company registration with reason")
    public ResponseEntity<ApiResponse<CompanyDto>> rejectCompany(@PathVariable UUID id, @RequestBody(required = false) ReviewCompanyRequest request) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        String reason = request != null ? request.reason() : "Did not meet platform criteria";
        Company rejected = companyService.rejectCompany(id, reason, adminId);
        return ResponseEntity.ok(ApiResponse.success(CompanyDto.from(rejected), "Company registration rejected"));
    }

    @PostMapping("/{id}/suspend")
    @Operation(summary = "Suspend active company")
    public ResponseEntity<ApiResponse<CompanyDto>> suspendCompany(@PathVariable UUID id, @RequestBody(required = false) ReviewCompanyRequest request) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        String reason = request != null ? request.reason() : "Suspended by administrator";
        Company suspended = companyService.suspendCompany(id, reason, adminId);
        return ResponseEntity.ok(ApiResponse.success(CompanyDto.from(suspended), "Company suspended"));
    }
}
