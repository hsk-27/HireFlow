package com.hireflow.offer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {

    List<Offer> findByApplicationId(UUID applicationId);

    Optional<Offer> findByApplicationIdAndOfferStatusIn(UUID applicationId, Collection<OfferStatus> statuses);

    @Query("SELECT o FROM Offer o WHERE o.application.candidate.user.id = :candidateUserId ORDER BY o.createdAt DESC")
    Page<Offer> findCandidateOffers(@Param("candidateUserId") UUID candidateUserId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.application.job.company.id = :companyId ORDER BY o.createdAt DESC")
    Page<Offer> findCompanyOffers(@Param("companyId") UUID companyId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.id = :id AND o.application.job.company.id = :companyId")
    Optional<Offer> findByIdAndCompanyId(@Param("id") UUID id, @Param("companyId") UUID companyId);

    @Query("SELECT o FROM Offer o WHERE o.id = :id AND o.application.candidate.user.id = :candidateUserId")
    Optional<Offer> findByIdAndCandidateUserId(@Param("id") UUID id, @Param("candidateUserId") UUID candidateUserId);

    long countByApplicationJobCompanyIdAndOfferStatus(UUID companyId, OfferStatus status);
}
