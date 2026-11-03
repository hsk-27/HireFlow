package com.hireflow.auth;

import com.hireflow.company.CompanyDto;
import com.hireflow.user.UserDto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserDto user,
        CompanyDto company
) {}
