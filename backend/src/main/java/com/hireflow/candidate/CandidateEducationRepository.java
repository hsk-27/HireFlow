package com.hireflow.candidate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateEducationRepository extends JpaRepository<CandidateEducation, UUID> {
    List<CandidateEducation> findByCandidateIdOrderByGraduationYearDesc(UUID candidateId);
    Optional<CandidateEducation> findByCandidateIdAndIsPrimaryTrue(UUID candidateId);
}
