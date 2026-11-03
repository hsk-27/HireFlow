package com.hireflow.auth;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.security.SecurityUtils;
import com.hireflow.user.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Candidate & Recruiter registration, login, refresh rotation, and profile")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/candidate")
    @Operation(summary = "Register candidate account")
    public ResponseEntity<ApiResponse<AuthResponse>> registerCandidate(@Valid @RequestBody RegisterCandidateRequest request) {
        AuthResponse response = authService.registerCandidate(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Candidate account registered successfully"));
    }

    @PostMapping("/register/recruiter")
    @Operation(summary = "Register recruiter and submit company for approval")
    public ResponseEntity<ApiResponse<AuthResponse>> registerRecruiter(@Valid @RequestBody RegisterRecruiterRequest request) {
        AuthResponse response = authService.registerRecruiter(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Recruiter and company registered successfully. Pending administrator review."));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token and issue new JWT access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        AuthResponse response = authService.refreshToken(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke refresh tokens and log out")
    public ResponseEntity<ApiResponse<Void>> logout() {
        UUID userId = SecurityUtils.getCurrentUserId();
        authService.logout(userId);
        return ResponseEntity.ok(ApiResponse.message("Logged out successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUser(userId)));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password and revoke existing sessions")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.message("Password changed successfully"));
    }
}
