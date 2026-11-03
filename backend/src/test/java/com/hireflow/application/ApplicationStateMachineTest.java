package com.hireflow.application;

import com.hireflow.common.exception.InvalidStateTransitionException;
import com.hireflow.user.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationStateMachineTest {

    private ApplicationStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new ApplicationStateMachine();
    }

    @Test
    @DisplayName("Valid recruiter transitions should succeed")
    void testValidRecruiterTransitions() {
        assertDoesNotThrow(() -> stateMachine.validateTransition(
                ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW, Role.RECRUITER));
        assertDoesNotThrow(() -> stateMachine.validateTransition(
                ApplicationStatus.UNDER_REVIEW, ApplicationStatus.SHORTLISTED, Role.RECRUITER));
        assertDoesNotThrow(() -> stateMachine.validateTransition(
                ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW, Role.RECRUITER));
        assertDoesNotThrow(() -> stateMachine.validateTransition(
                ApplicationStatus.INTERVIEW, ApplicationStatus.OFFERED, Role.RECRUITER));
        assertDoesNotThrow(() -> stateMachine.validateTransition(
                ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED, Role.RECRUITER));
    }

    @Test
    @DisplayName("Candidate can withdraw active application")
    void testCandidateWithdrawal() {
        assertDoesNotThrow(() -> stateMachine.validateTransition(
                ApplicationStatus.SUBMITTED, ApplicationStatus.WITHDRAWN, Role.CANDIDATE));
        assertDoesNotThrow(() -> stateMachine.validateTransition(
                ApplicationStatus.UNDER_REVIEW, ApplicationStatus.WITHDRAWN, Role.CANDIDATE));
        assertDoesNotThrow(() -> stateMachine.validateTransition(
                ApplicationStatus.SHORTLISTED, ApplicationStatus.WITHDRAWN, Role.CANDIDATE));
        assertDoesNotThrow(() -> stateMachine.validateTransition(
                ApplicationStatus.INTERVIEW, ApplicationStatus.WITHDRAWN, Role.CANDIDATE));
    }

    @Test
    @DisplayName("Candidate cannot perform recruiter transitions")
    void testCandidateIllegalTransition() {
        assertThrows(InvalidStateTransitionException.class, () -> stateMachine.validateTransition(
                ApplicationStatus.SUBMITTED, ApplicationStatus.SHORTLISTED, Role.CANDIDATE));
        assertThrows(InvalidStateTransitionException.class, () -> stateMachine.validateTransition(
                ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW, Role.CANDIDATE));
    }

    @Test
    @DisplayName("Recruiter cannot withdraw candidate application")
    void testRecruiterCannotWithdraw() {
        assertThrows(InvalidStateTransitionException.class, () -> stateMachine.validateTransition(
                ApplicationStatus.SUBMITTED, ApplicationStatus.WITHDRAWN, Role.RECRUITER));
    }

    @Test
    @DisplayName("Illegal transition jumps should be rejected with 409 Conflict")
    void testIllegalJumps() {
        // Cannot jump directly from SUBMITTED to HIRED
        assertThrows(InvalidStateTransitionException.class, () -> stateMachine.validateTransition(
                ApplicationStatus.SUBMITTED, ApplicationStatus.HIRED, Role.RECRUITER));
        // Cannot jump from SUBMITTED to OFFERED
        assertThrows(InvalidStateTransitionException.class, () -> stateMachine.validateTransition(
                ApplicationStatus.SUBMITTED, ApplicationStatus.OFFERED, Role.RECRUITER));
    }

    @ParameterizedTest
    @EnumSource(value = ApplicationStatus.class, names = {"HIRED", "REJECTED", "WITHDRAWN", "OFFER_DECLINED"})
    @DisplayName("Terminal states cannot transition to any other status")
    void testTerminalStates(ApplicationStatus terminalStatus) {
        assertThrows(InvalidStateTransitionException.class, () -> stateMachine.validateTransition(
                terminalStatus, ApplicationStatus.UNDER_REVIEW, Role.RECRUITER));
        assertThrows(InvalidStateTransitionException.class, () -> stateMachine.validateTransition(
                terminalStatus, ApplicationStatus.SHORTLISTED, Role.RECRUITER));
        assertThrows(InvalidStateTransitionException.class, () -> stateMachine.validateTransition(
                terminalStatus, ApplicationStatus.INTERVIEW, Role.RECRUITER));
    }

    @Test
    @DisplayName("Transition to identical state should be rejected")
    void testSameStateTransition() {
        assertThrows(InvalidStateTransitionException.class, () -> stateMachine.validateTransition(
                ApplicationStatus.UNDER_REVIEW, ApplicationStatus.UNDER_REVIEW, Role.RECRUITER));
    }
}
