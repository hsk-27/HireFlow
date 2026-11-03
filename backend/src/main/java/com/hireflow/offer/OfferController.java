package com.hireflow.offer;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.response.PagedResponse;
import com.hireflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidate/offers")
@Tag(name = "Candidate Offers", description = "Candidate offer acceptance, declination, and viewing")
@PreAuthorize("hasRole('CANDIDATE')")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @GetMapping
    @Operation(summary = "Get list of offers extended to current candidate")
    public ResponseEntity<ApiResponse<PagedResponse<OfferDto>>> getCandidateOffers(
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID candidateUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.from(offerService.getCandidateOffers(candidateUserId, pageable))
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed offer specifications")
    public ResponseEntity<ApiResponse<OfferDto>> getOfferById(@PathVariable UUID id) {
        UUID candidateUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(offerService.getCandidateOfferById(id, candidateUserId)));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept employment offer (moves application to HIRED)")
    public ResponseEntity<ApiResponse<OfferDto>> acceptOffer(@PathVariable UUID id) {
        UUID candidateUserId = SecurityUtils.getCurrentUserId();
        OfferDto accepted = offerService.candidateRespondOffer(id, candidateUserId, true, null);
        return ResponseEntity.ok(ApiResponse.success(accepted, "Congratulations! Offer accepted. You are now officially hired!"));
    }

    @PostMapping("/{id}/decline")
    @Operation(summary = "Decline employment offer (moves application to OFFER_DECLINED)")
    public ResponseEntity<ApiResponse<OfferDto>> declineOffer(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        UUID candidateUserId = SecurityUtils.getCurrentUserId();
        String reason = body != null ? body.get("reason") : "Declined by candidate";
        OfferDto declined = offerService.candidateRespondOffer(id, candidateUserId, false, reason);
        return ResponseEntity.ok(ApiResponse.success(declined, "Offer declined"));
    }
}
