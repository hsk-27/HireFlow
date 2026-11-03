package com.hireflow.common.security;

import com.hireflow.common.exception.UnauthorizedException;
import com.hireflow.user.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static CustomUserDetails getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return userDetails;
    }

    public static UUID getCurrentUserId() {
        return getAuthenticatedUser().getId();
    }

    public static String getCurrentUserEmail() {
        return getAuthenticatedUser().getEmail();
    }

    public static Role getCurrentUserRole() {
        return getAuthenticatedUser().getRole();
    }
}
