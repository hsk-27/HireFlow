package com.hireflow.offer;

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

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruiter")
@Tag(name = "Recruiter Offers", description = "Drafting, issuing, and managing candidate job offers")
@PreAuthorize("hasRole('RECRUITER')")
public class RecruiterOfferController {

    private final OfferService offerService;

    public RecruiterOfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping("/applications/{applicationId}/offers")
    @Operation(summary = "Create draft employment offer for an application")
    public ResponseEntity<ApiResponse<OfferDto>> createDraftOffer(
            @PathVariable UUID applicationId,
            @Valid @RequestBody CreateOfferRequest request
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        OfferDto created = offerService.createDraftOffer(recruiterUserId, applicationId, request);
        return ResponseEntity.ok(ApiResponse.success(created, "Draft offer created successfully"));
    }

    @PostMapping("/offers")
    @Operation(summary = "Create and issue employment offer (direct route)")
    public ResponseEntity<ApiResponse<OfferDto>> createOfferDirect(
            @Valid @RequestBody CreateOfferRequest request
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        if (request.applicationId() == null) {
            throw new IllegalArgumentException("Application ID is required");
        }
        OfferDto draft = offerService.createDraftOffer(recruiterUserId, request.applicationId(), request);
        OfferDto issued = offerService.issueOffer(draft.id(), recruiterUserId);
        return ResponseEntity.ok(ApiResponse.success(issued, "Offer issued successfully"));
    }

    @GetMapping("/offers")
    @Operation(summary = "Get list of offers extended by current company")
    public ResponseEntity<ApiResponse<PagedResponse<OfferDto>>> getCompanyOffers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(offerService.getCompanyOffers(recruiterUserId, pageable))
        ));
    }

    @GetMapping("/offers/{id}")
    @Operation(summary = "Get specific company offer by ID")
    public ResponseEntity<ApiResponse<OfferDto>> getOfferById(@PathVariable UUID id) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(offerService.getCompanyOfferById(id, recruiterUserId)));
    }

    @PostMapping("/offers/{id}/issue")
    @Operation(summary = "Formally issue offer to candidate (updates application to OFFERED)")
    public ResponseEntity<ApiResponse<OfferDto>> issueOffer(@PathVariable UUID id) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        OfferDto issued = offerService.issueOffer(id, recruiterUserId);
        return ResponseEntity.ok(ApiResponse.success(issued, "Offer issued to candidate successfully"));
    }

    @PostMapping("/offers/{id}/withdraw")
    @Operation(summary = "Withdraw an active offer before candidate response")
    public ResponseEntity<ApiResponse<OfferDto>> withdrawOffer(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            @RequestBody(required = false) Map<String, String> body
    ) {
        UUID recruiterUserId = SecurityUtils.getCurrentUserId();
        String withdrawReason = reason != null ? reason : (body != null ? body.get("reason") : "Withdrawn by company");
        OfferDto withdrawn = offerService.withdrawOffer(id, recruiterUserId, withdrawReason);
        return ResponseEntity.ok(ApiResponse.success(withdrawn, "Offer withdrawn"));
    }
}
