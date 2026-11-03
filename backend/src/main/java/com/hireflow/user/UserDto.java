package com.hireflow.user;

import java.time.Instant;
import java.util.UUID;

public record UserDto(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String phoneNumber,
        Role role,
        AccountStatus accountStatus,
        boolean emailVerified,
        Instant createdAt,
        Instant lastLoginAt
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getRole(),
                user.getAccountStatus(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
