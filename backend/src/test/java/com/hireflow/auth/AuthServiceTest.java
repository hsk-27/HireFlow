package com.hireflow.auth;

import com.hireflow.audit.AuditService;
import com.hireflow.candidate.CandidateProfileRepository;
import com.hireflow.common.exception.ConflictException;
import com.hireflow.common.exception.ForbiddenException;
import com.hireflow.common.exception.UnauthorizedException;
import com.hireflow.common.security.JwtTokenProvider;
import com.hireflow.company.CompanyService;
import com.hireflow.company.RecruiterCompanyRepository;
import com.hireflow.user.AccountStatus;
import com.hireflow.user.Role;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CandidateProfileRepository profileRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private RecruiterCompanyRepository recruiterCompanyRepository;
    @Mock private CompanyService companyService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private AuditService auditService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository, profileRepository, refreshTokenRepository, recruiterCompanyRepository,
                companyService, passwordEncoder, tokenProvider, auditService, 900000, 604800000
        );
    }

    @Test
    @DisplayName("Candidate registration should normalize email and hash password")
    void testRegisterCandidate() {
        RegisterCandidateRequest req = new RegisterCandidateRequest(
                "  Test.Candidate@Example.COM  ",
                "Password123!",
                "Test",
                "Candidate",
                "+1 555-0100"
        );

        when(userRepository.existsByEmail("test.candidate@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashed_secret");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(tokenProvider.generateAccessToken(any())).thenReturn("mock.jwt.token");

        AuthResponse resp = authService.registerCandidate(req);

        assertNotNull(resp);
        assertEquals("test.candidate@example.com", resp.user().email());
        assertEquals(Role.CANDIDATE, resp.user().role());
        assertNotNull(resp.accessToken());
        assertNotNull(resp.refreshToken());
        verify(passwordEncoder).encode("Password123!");
    }

    @Test
    @DisplayName("Duplicate email registration should fail with ConflictException")
    void testDuplicateEmailRegistration() {
        RegisterCandidateRequest req = new RegisterCandidateRequest(
                "duplicate@example.com", "Password123!", "Jane", "Doe", null
        );

        when(userRepository.existsByEmail("duplicate@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.registerCandidate(req));
    }

    @Test
    @DisplayName("Suspended account login should be rejected with ForbiddenException")
    void testSuspendedAccountLoginRejected() {
        User suspendedUser = new User();
        suspendedUser.setEmail("suspended@example.com");
        suspendedUser.setPasswordHash("hashed_pass");
        suspendedUser.setAccountStatus(AccountStatus.SUSPENDED);

        when(userRepository.findByEmail("suspended@example.com")).thenReturn(Optional.of(suspendedUser));
        when(passwordEncoder.matches("Password123!", "hashed_pass")).thenReturn(true);

        LoginRequest req = new LoginRequest("suspended@example.com", "Password123!");
        assertThrows(ForbiddenException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Invalid password should throw UnauthorizedException")
    void testInvalidPasswordThrowsUnauthorized() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setPasswordHash("hashed_pass");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashed_pass")).thenReturn(false);

        LoginRequest req = new LoginRequest("user@example.com", "WrongPassword");
        assertThrows(UnauthorizedException.class, () -> authService.login(req));
    }
}
