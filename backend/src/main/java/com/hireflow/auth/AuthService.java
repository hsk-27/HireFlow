package com.hireflow.auth;

import com.hireflow.audit.AuditService;
import com.hireflow.candidate.CandidateProfile;
import com.hireflow.candidate.CandidateProfileRepository;
import com.hireflow.common.exception.BadRequestException;
import com.hireflow.common.exception.ConflictException;
import com.hireflow.common.exception.ForbiddenException;
import com.hireflow.common.exception.ResourceNotFoundException;
import com.hireflow.common.exception.UnauthorizedException;
import com.hireflow.common.security.JwtTokenProvider;
import com.hireflow.common.util.ChecksumUtils;
import com.hireflow.company.Company;
import com.hireflow.company.CompanyDto;
import com.hireflow.company.CompanyService;
import com.hireflow.company.RecruiterCompanyRepository;
import com.hireflow.user.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RecruiterCompanyRepository recruiterCompanyRepository;
    private final CompanyService companyService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public AuthService(
            UserRepository userRepository,
            CandidateProfileRepository profileRepository,
            RefreshTokenRepository refreshTokenRepository,
            RecruiterCompanyRepository recruiterCompanyRepository,
            CompanyService companyService,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            AuditService auditService,
            @Value("${hireflow.security.jwt.access-expiration-ms:900000}") long accessExpirationMs,
            @Value("${hireflow.security.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs
    ) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.recruiterCompanyRepository = recruiterCompanyRepository;
        this.companyService = companyService;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    @Transactional
    public AuthResponse registerCandidate(RegisterCandidateRequest req) {
        String normalizedEmail = req.email().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("An account with this email address already exists");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFirstName(req.firstName().trim());
        user.setLastName(req.lastName().trim());
        user.setPhoneNumber(req.phoneNumber());
        user.setRole(Role.CANDIDATE);
        user.setAccountStatus(AccountStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        // Create initial candidate profile
        CandidateProfile profile = new CandidateProfile(savedUser);
        profileRepository.save(profile);

        auditService.logEvent(savedUser.getId(), null, "USER_REGISTERED_CANDIDATE", "User", savedUser.getId(),
                "Registered candidate account");

        return generateAuthResponse(savedUser, null);
    }

    @Transactional
    public AuthResponse registerRecruiter(RegisterRecruiterRequest req) {
        String normalizedEmail = req.email().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("An account with this email address already exists");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFirstName(req.firstName().trim());
        user.setLastName(req.lastName().trim());
        user.setPhoneNumber(req.phoneNumber());
        user.setRole(Role.RECRUITER);
        user.setAccountStatus(AccountStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        // Create company in PENDING status
        Company company = companyService.createCompany(
                req.companyName().trim(),
                req.companyDescription(),
                req.companyWebsite(),
                req.industry(),
                req.companySize(),
                req.headquartersLocation(),
                savedUser
        );

        auditService.logEvent(savedUser.getId(), company.getId(), "USER_REGISTERED_RECRUITER", "User", savedUser.getId(),
                "Registered recruiter account for company: " + company.getName());

        return generateAuthResponse(savedUser, company);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        String normalizedEmail = req.email().toLowerCase().trim();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getAccountStatus() == AccountStatus.SUSPENDED || user.getAccountStatus() == AccountStatus.DISABLED) {
            throw new ForbiddenException("Your account is currently " + user.getAccountStatus() + ". Please contact support.");
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        Company company = null;
        if (user.getRole() == Role.RECRUITER) {
            company = recruiterCompanyRepository.findCompanyByUserId(user.getId()).orElse(null);
        }

        auditService.logEvent(user.getId(), company != null ? company.getId() : null, "USER_LOGIN", "User", user.getId(),
                "User successfully logged in");

        return generateAuthResponse(user, company);
    }

    @Transactional
    public AuthResponse refreshToken(String opaqueRefreshToken) {
        if (opaqueRefreshToken == null || opaqueRefreshToken.isBlank()) {
            throw new BadRequestException("Refresh token cannot be blank");
        }

        String tokenHash = ChecksumUtils.calculateSha256(opaqueRefreshToken.getBytes(StandardCharsets.UTF_8));
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid or revoked refresh token"));

        if (token.isRevoked() || token.isExpired()) {
            throw new UnauthorizedException("Refresh token is expired or has been revoked");
        }

        // Token rotation: revoke old token
        token.setRevoked(true);
        token.setRevokedAt(Instant.now());
        refreshTokenRepository.save(token);

        User user = token.getUser();
        if (user.getAccountStatus() == AccountStatus.SUSPENDED || user.getAccountStatus() == AccountStatus.DISABLED) {
            throw new ForbiddenException("Account is suspended");
        }

        Company company = null;
        if (user.getRole() == Role.RECRUITER) {
            company = recruiterCompanyRepository.findCompanyByUserId(user.getId()).orElse(null);
        }

        return generateAuthResponse(user, company);
    }

    @Transactional
    public void logout(UUID userId) {
        refreshTokenRepository.revokeAllUserTokens(userId, Instant.now());
        auditService.logEvent(userId, null, "USER_LOGOUT", "User", userId, "User logged out");
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        // Revoke all existing refresh tokens for security
        refreshTokenRepository.revokeAllUserTokens(userId, Instant.now());

        auditService.logEvent(userId, null, "PASSWORD_CHANGED", "User", userId, "User changed password");
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserDto.from(user);
    }

    private AuthResponse generateAuthResponse(User user, Company company) {
        String accessToken = tokenProvider.generateAccessToken(user);

        // Generate opaque cryptographic random refresh token
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String opaqueRefreshToken = HexFormat.of().formatHex(randomBytes);

        String tokenHash = ChecksumUtils.calculateSha256(opaqueRefreshToken.getBytes(StandardCharsets.UTF_8));
        Instant expiresAt = Instant.now().plusMillis(refreshExpirationMs);

        RefreshToken refreshToken = new RefreshToken(user, tokenHash, expiresAt);
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                opaqueRefreshToken,
                "Bearer",
                accessExpirationMs / 1000,
                UserDto.from(user),
                company != null ? CompanyDto.from(company) : null
        );
    }
}
