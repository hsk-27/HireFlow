package com.hireflow.application;

import com.hireflow.candidate.CandidateEducation;
import com.hireflow.candidate.CandidateExperience;
import com.hireflow.candidate.CandidateProfile;
import com.hireflow.job.JobEligibilityCriteria;
import com.hireflow.job.JobEligibleBranch;
import com.hireflow.job.JobEligibleDegree;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class EligibilityEvaluationServiceTest {

    private EligibilityEvaluationService evaluationService;

    @BeforeEach
    void setUp() {
        evaluationService = new EligibilityEvaluationService();
    }

    @Test
    @DisplayName("Candidate meeting all criteria should evaluate to ELIGIBLE")
    void testEligibleCandidate() {
        UUID jobId = UUID.randomUUID();
        JobEligibilityCriteria criteria = new JobEligibilityCriteria();
        criteria.setMinimumGraduationYear(2018);
        criteria.setMaximumGraduationYear(2024);
        criteria.setMinimumScore(new BigDecimal("3.0"));
        criteria.setScoreScale(new BigDecimal("4.0"));
        criteria.setMinimumExperienceYears(2);

        List<JobEligibleBranch> branches = List.of(new JobEligibleBranch(jobId, "Computer Science"));
        List<JobEligibleDegree> degrees = List.of(new JobEligibleDegree(jobId, "B.S."));

        CandidateProfile candidate = new CandidateProfile();

        CandidateEducation edu = new CandidateEducation();
        edu.setDegree("B.S.");
        edu.setBranch("Computer Science");
        edu.setGraduationYear(2021);
        edu.setScore(new BigDecimal("3.8"));
        edu.setScoreScale(new BigDecimal("4.0"));
        edu.setPrimary(true);

        CandidateExperience exp = new CandidateExperience();
        exp.setStartDate(LocalDate.now().minusYears(3));
        exp.setCurrentlyWorking(true);

        var result = evaluationService.evaluate(criteria, branches, degrees, candidate, List.of(edu), List.of(exp));
        assertEquals(EligibilityStatus.ELIGIBLE, result.status());
    }

    @Test
    @DisplayName("Candidate with mismatched degree should evaluate to INELIGIBLE")
    void testDegreeMismatch() {
        UUID jobId = UUID.randomUUID();
        List<JobEligibleDegree> degrees = List.of(new JobEligibleDegree(jobId, "B.S."));

        CandidateEducation edu = new CandidateEducation();
        edu.setDegree("B.A.");
        edu.setBranch("Economics");
        edu.setPrimary(true);

        var result = evaluationService.evaluate(null, List.of(), degrees, new CandidateProfile(), List.of(edu), List.of());
        assertEquals(EligibilityStatus.INELIGIBLE, result.status());
        assertTrue(result.explanation().contains("does not match required degrees"));
    }

    @Test
    @DisplayName("Candidate with different score scale should produce REVIEW_REQUIRED (no invented conversion)")
    void testScaleMismatchReviewRequired() {
        JobEligibilityCriteria criteria = new JobEligibilityCriteria();
        criteria.setMinimumScore(new BigDecimal("7.0"));
        criteria.setScoreScale(new BigDecimal("10.0")); // 10-point scale

        CandidateEducation edu = new CandidateEducation();
        edu.setDegree("B.S.");
        edu.setBranch("Computer Science");
        edu.setGraduationYear(2022);
        edu.setScore(new BigDecimal("3.5"));
        edu.setScoreScale(new BigDecimal("4.0")); // 4-point scale
        edu.setPrimary(true);

        var result = evaluationService.evaluate(criteria, List.of(), List.of(), new CandidateProfile(), List.of(edu), List.of());
        assertEquals(EligibilityStatus.REVIEW_REQUIRED, result.status());
        assertTrue(result.explanation().contains("Grading scale mismatch"));
    }

    @Test
    @DisplayName("Candidate with missing education should produce REVIEW_REQUIRED")
    void testMissingEducationReviewRequired() {
        JobEligibilityCriteria criteria = new JobEligibilityCriteria();
        criteria.setMinimumGraduationYear(2020);

        var result = evaluationService.evaluate(criteria, List.of(), List.of(), new CandidateProfile(), List.of(), List.of());
        assertEquals(EligibilityStatus.REVIEW_REQUIRED, result.status());
    }
}
