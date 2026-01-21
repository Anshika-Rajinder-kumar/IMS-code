package com.wissen.ims.repository;

import com.wissen.ims.model.Offer;
import com.wissen.ims.model.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByStatus(Offer.OfferStatus status);
    Optional<Offer> findByIntern(Intern intern);
    List<Offer> findByInternId(Long internId);
}
