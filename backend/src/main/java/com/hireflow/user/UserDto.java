package com.hireflow.user;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("fullName")
    public String fullName() {
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }

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
