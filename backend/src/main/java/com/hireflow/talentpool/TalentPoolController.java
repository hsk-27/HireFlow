package com.hireflow.talentpool;

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
@RequestMapping("/api/v1/recruiter/talent-pool")
@Tag(name = "Recruiter Talent Pool", description = "Company talent pool prospect management and bulk CSV import")
@PreAuthorize("hasRole('RECRUITER')")
public class TalentPoolController {

    private final TalentPoolService talentPoolService;

    public TalentPoolController(TalentPoolService talentPoolService) {
        this.talentPoolService = talentPoolService;
    }

    @GetMapping({"", "/leads"})
    @Operation(summary = "Search and filter talent leads for current company")
    public ResponseEntity<ApiResponse<PagedResponse<TalentLeadDto>>> getLeads(
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "importedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(talentPoolService.getCompanyLeads(recruiterUserId, status, search, pageable))
        ));
    }

    @PostMapping({"", "/leads"})
    @Operation(summary = "Create individual talent lead")
    public ResponseEntity<ApiResponse<TalentLeadDto>> createLead(@Valid @RequestBody CreateLeadRequest request) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        TalentLeadDto created = talentPoolService.createLead(recruiterUserId, request);
        return ResponseEntity.ok(ApiResponse.success(created, "Talent lead created"));
    }

    @PatchMapping({"/leads/{id}/status", "/{id}/status"})
    @Operation(summary = "Update lead pipeline status")
    public ResponseEntity<ApiResponse<TalentLeadDto>> updateLeadStatus(
            @PathVariable UUID id,
            @RequestParam(required = false) LeadStatus status,
            @RequestBody(required = false) java.util.Map<String, String> body
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        LeadStatus targetStatus = status;
        if (targetStatus == null && body != null && body.containsKey("status")) {
            targetStatus = LeadStatus.valueOf(body.get("status"));
        }
        if (targetStatus == null) {
            throw new IllegalArgumentException("Lead status must be provided");
        }
        UpdateLeadRequest updateReq = new UpdateLeadRequest(null, null, null, null, null, null, null, null, targetStatus);
        TalentLeadDto updated = talentPoolService.updateLead(id, recruiterUserId, updateReq);
        return ResponseEntity.ok(ApiResponse.success(updated, "Lead status updated"));
    }

    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk import talent leads from CSV file")
    public ResponseEntity<ApiResponse<BulkImportResultDto>> bulkImportCsv(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        BulkImportResultDto result = talentPoolService.importFromCsv(recruiterUserId, file);
        return ResponseEntity.ok(ApiResponse.success(result, "Bulk CSV import completed"));
    }

    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Bulk import talent leads with validation and duplicate skipping (JSON)")
    public ResponseEntity<ApiResponse<BulkImportResultDto>> bulkImportJson(@Valid @RequestBody BulkImportRequest request) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        BulkImportResultDto result = talentPoolService.bulkImport(recruiterUserId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Bulk import completed"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific talent lead by ID")
    public ResponseEntity<ApiResponse<TalentLeadDto>> getLeadById(@PathVariable UUID id) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(talentPoolService.getLeadById(id, recruiterUserId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update talent lead details")
    public ResponseEntity<ApiResponse<TalentLeadDto>> updateLead(
            @PathVariable UUID id,
            @RequestBody UpdateLeadRequest request
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        TalentLeadDto updated = talentPoolService.updateLead(id, recruiterUserId, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Talent lead updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete talent lead from company pool")
    public ResponseEntity<ApiResponse<Void>> deleteLead(@PathVariable UUID id) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        talentPoolService.deleteLead(id, recruiterUserId);
        return ResponseEntity.ok(ApiResponse.message("Talent lead deleted"));
    }
}
