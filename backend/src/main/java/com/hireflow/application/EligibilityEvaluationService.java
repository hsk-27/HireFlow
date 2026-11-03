package com.hireflow.application;

import com.hireflow.candidate.*;
import com.hireflow.job.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class EligibilityEvaluationService {

    public record EvaluationResult(
            EligibilityStatus status,
            String explanation
    ) {}

    public EvaluationResult evaluate(
            JobEligibilityCriteria criteria,
            List<JobEligibleBranch> branchRestrictions,
            List<JobEligibleDegree> degreeRestrictions,
            CandidateProfile candidate,
            List<CandidateEducation> educations,
            List<CandidateExperience> experiences
    ) {
        if (criteria == null && branchRestrictions.isEmpty() && degreeRestrictions.isEmpty()) {
            return new EvaluationResult(EligibilityStatus.ELIGIBLE, "No restrictive eligibility criteria configured for this position.");
        }

        List<String> reasons = new ArrayList<>();
        boolean hasIneligible = false;
        boolean hasReviewRequired = false;

        // 1. Primary Education evaluation
        CandidateEducation primaryEdu = educations.stream()
                .filter(CandidateEducation::isPrimary)
                .findFirst()
                .orElse(educations.isEmpty() ? null : educations.get(0));

        if (primaryEdu == null) {
            hasReviewRequired = true;
            reasons.add("Review Required: Candidate has not provided education history.");
        } else {
            // Check Degree
            if (!degreeRestrictions.isEmpty()) {
                boolean degreeMatch = degreeRestrictions.stream()
                        .anyMatch(d -> d.getDegree().equalsIgnoreCase(primaryEdu.getDegree()));
                if (!degreeMatch) {
                    hasIneligible = true;
                    reasons.add(String.format("Ineligible: Degree '%s' does not match required degrees.", primaryEdu.getDegree()));
                } else {
                    reasons.add(String.format("Eligible: Degree '%s' matches criteria.", primaryEdu.getDegree()));
                }
            }

            // Check Branch
            if (!branchRestrictions.isEmpty()) {
                boolean branchMatch = branchRestrictions.stream()
                        .anyMatch(b -> b.getBranch().equalsIgnoreCase(primaryEdu.getBranch()));
                if (!branchMatch) {
                    hasIneligible = true;
                    reasons.add(String.format("Ineligible: Branch '%s' does not match eligible branches.", primaryEdu.getBranch()));
                } else {
                    reasons.add(String.format("Eligible: Branch '%s' matches criteria.", primaryEdu.getBranch()));
                }
            }

            // Check Graduation Year
            if (criteria != null) {
                if (criteria.getMinimumGraduationYear() != null && primaryEdu.getGraduationYear() < criteria.getMinimumGraduationYear()) {
                    hasIneligible = true;
                    reasons.add(String.format("Ineligible: Graduation year %d is before minimum %d.",
                            primaryEdu.getGraduationYear(), criteria.getMinimumGraduationYear()));
                }
                if (criteria.getMaximumGraduationYear() != null && primaryEdu.getGraduationYear() > criteria.getMaximumGraduationYear()) {
                    hasIneligible = true;
                    reasons.add(String.format("Ineligible: Graduation year %d is after maximum %d.",
                            primaryEdu.getGraduationYear(), criteria.getMaximumGraduationYear()));
                }

                // Check Score & Scale (Specification: Do NOT convert across scales!)
                if (criteria.getMinimumScore() != null) {
                    if (criteria.getScoreScale() != null) {
                        if (primaryEdu.getScoreScale() == null) {
                            hasReviewRequired = true;
                            reasons.add("Review Required: Candidate education score scale is missing.");
                        } else if (primaryEdu.getScoreScale().compareTo(criteria.getScoreScale()) != 0) {
                            hasReviewRequired = true;
                            reasons.add(String.format("Review Required: Grading scale mismatch (Candidate: %s-scale, Job: %s-scale). Manual review needed.",
                                    primaryEdu.getScoreScale(), criteria.getScoreScale()));
                        } else {
                            // Scales match, compare score
                            if (primaryEdu.getScore().compareTo(criteria.getMinimumScore()) < 0) {
                                hasIneligible = true;
                                reasons.add(String.format("Ineligible: Score %s/%s is below minimum %s/%s.",
                                        primaryEdu.getScore(), primaryEdu.getScoreScale(),
                                        criteria.getMinimumScore(), criteria.getScoreScale()));
                            } else {
                                reasons.add(String.format("Eligible: Score %s/%s meets minimum threshold.",
                                        primaryEdu.getScore(), primaryEdu.getScoreScale()));
                            }
                        }
                    } else {
                        hasReviewRequired = true;
                        reasons.add("Review Required: Job criteria does not specify score scale.");
                    }
                }
            }
        }

        // 2. Experience evaluation
        if (criteria != null && criteria.getMinimumExperienceYears() != null && criteria.getMinimumExperienceYears() > 0) {
            double totalYearsExperience = calculateTotalExperienceYears(experiences);
            if (totalYearsExperience < criteria.getMinimumExperienceYears()) {
                hasIneligible = true;
                reasons.add(String.format("Ineligible: Total experience (%.1f years) is below required minimum (%d years).",
                        totalYearsExperience, criteria.getMinimumExperienceYears()));
            } else {
                reasons.add(String.format("Eligible: Total experience (%.1f years) meets requirement (%d years).",
                        totalYearsExperience, criteria.getMinimumExperienceYears()));
            }
        }

        EligibilityStatus finalStatus;
        if (hasIneligible) {
            finalStatus = EligibilityStatus.INELIGIBLE;
        } else if (hasReviewRequired) {
            finalStatus = EligibilityStatus.REVIEW_REQUIRED;
        } else {
            finalStatus = EligibilityStatus.ELIGIBLE;
        }

        return new EvaluationResult(finalStatus, String.join("\n", reasons));
    }

    private double calculateTotalExperienceYears(List<CandidateExperience> experiences) {
        if (experiences == null || experiences.isEmpty()) {
            return 0.0;
        }
        long totalDays = 0;
        LocalDate today = LocalDate.now();
        for (CandidateExperience exp : experiences) {
            LocalDate start = exp.getStartDate();
            LocalDate end = exp.isCurrentlyWorking() || exp.getEndDate() == null ? today : exp.getEndDate();
            if (start != null && end.isAfter(start)) {
                totalDays += ChronoUnit.DAYS.between(start, end);
            }
        }
        return totalDays / 365.25;
    }
}
