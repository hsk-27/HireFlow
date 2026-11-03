package com.hireflow.common.exception;

import org.springframework.http.HttpStatus;

public class InvalidStateTransitionException extends ApiException {
    public InvalidStateTransitionException(String currentStatus, String targetStatus, String reason) {
        super(String.format("Cannot transition application from %s to %s: %s", currentStatus, targetStatus, reason),
                HttpStatus.CONFLICT, "INVALID_STATE_TRANSITION");
    }

    public InvalidStateTransitionException(String message) {
        super(message, HttpStatus.CONFLICT, "INVALID_STATE_TRANSITION");
    }
}
