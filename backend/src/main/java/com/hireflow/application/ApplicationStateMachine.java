package com.hireflow.application;

import com.hireflow.common.exception.InvalidStateTransitionException;
import com.hireflow.user.Role;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class ApplicationStateMachine {

    private static final Map<ApplicationStatus, Set<ApplicationStatus>> VALID_TRANSITIONS = Map.of(
            ApplicationStatus.SUBMITTED, Set.of(
                    ApplicationStatus.UNDER_REVIEW,
                    ApplicationStatus.SHORTLISTED,
                    ApplicationStatus.REJECTED,
                    ApplicationStatus.WITHDRAWN
            ),
            ApplicationStatus.UNDER_REVIEW, Set.of(
                    ApplicationStatus.SHORTLISTED,
                    ApplicationStatus.INTERVIEW,
                    ApplicationStatus.REJECTED,
                    ApplicationStatus.WITHDRAWN
            ),
            ApplicationStatus.SHORTLISTED, Set.of(
                    ApplicationStatus.INTERVIEW,
                    ApplicationStatus.OFFERED,
                    ApplicationStatus.REJECTED,
                    ApplicationStatus.WITHDRAWN
            ),
            ApplicationStatus.INTERVIEW, Set.of(
                    ApplicationStatus.SHORTLISTED,
                    ApplicationStatus.OFFERED,
                    ApplicationStatus.REJECTED,
                    ApplicationStatus.WITHDRAWN
            ),
            ApplicationStatus.OFFERED, Set.of(
                    ApplicationStatus.HIRED,
                    ApplicationStatus.OFFER_DECLINED,
                    ApplicationStatus.REJECTED
            )
    );

    private static final Set<ApplicationStatus> TERMINAL_STATUSES = Set.of(
            ApplicationStatus.HIRED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.WITHDRAWN,
            ApplicationStatus.OFFER_DECLINED
    );

    public void validateTransition(ApplicationStatus current, ApplicationStatus target, Role actorRole) {
        if (current == target) {
            throw new InvalidStateTransitionException(current.name(), target.name(), "Application is already in state " + current);
        }

        if (TERMINAL_STATUSES.contains(current)) {
            throw new InvalidStateTransitionException(current.name(), target.name(),
                    "Cannot transition out of terminal state " + current);
        }

        Set<ApplicationStatus> allowed = VALID_TRANSITIONS.get(current);
        if (allowed == null || !allowed.contains(target)) {
            throw new InvalidStateTransitionException(current.name(), target.name(),
                    "Transition from " + current + " to " + target + " is not permitted by ATS workflow");
        }

        // Role-based restrictions
        if (actorRole == Role.CANDIDATE) {
            if (target != ApplicationStatus.WITHDRAWN) {
                throw new InvalidStateTransitionException(current.name(), target.name(),
                        "Candidates are only permitted to withdraw their application");
            }
        } else if (actorRole == Role.RECRUITER) {
            if (target == ApplicationStatus.WITHDRAWN) {
                throw new InvalidStateTransitionException(current.name(), target.name(),
                        "Recruiters cannot withdraw a candidate application");
            }
            if (target == ApplicationStatus.HIRED || target == ApplicationStatus.OFFER_DECLINED) {
                throw new InvalidStateTransitionException(current.name(), target.name(),
                        "Offer outcome states (HIRED / OFFER_DECLINED) are triggered only via candidate offer responses");
            }
        }
    }

    public boolean isValidTransition(ApplicationStatus current, ApplicationStatus target) {
        if (TERMINAL_STATUSES.contains(current)) return false;
        Set<ApplicationStatus> allowed = VALID_TRANSITIONS.get(current);
        return allowed != null && allowed.contains(target);
    }
}
