package com.hireflow.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecruiterCompanyRepository extends JpaRepository<RecruiterCompany, UUID> {
    Optional<RecruiterCompany> findByUserId(UUID userId);

    @Query("SELECT rc.company FROM RecruiterCompany rc WHERE rc.user.id = :userId")
    Optional<Company> findCompanyByUserId(UUID userId);

    boolean existsByCompanyIdAndUserId(UUID companyId, UUID userId);
}
