package com.wissen.ims.service;

import com.wissen.ims.model.Intern;
import com.wissen.ims.model.Offer;
import com.wissen.ims.repository.InternRepository;
import com.wissen.ims.repository.OfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OfferService {

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private InternRepository internRepository;

    public List<Offer> getAllOffers() {
        return offerRepository.findAll();
    }

    public Offer getOfferById(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found with id: " + id));
    }

    public List<Offer> getOffersByStatus(Offer.OfferStatus status) {
        return offerRepository.findByStatus(status);
    }

    public List<Offer> getOffersByInternId(Long internId) {
        return offerRepository.findByInternId(internId);
    }

    public Offer createOffer(Offer offer) {
        if (offer.getStatus() == null) {
            offer.setStatus(Offer.OfferStatus.GENERATED);
        }
        return offerRepository.save(offer);
    }

    public Offer updateOffer(Long id, Offer offerDetails) {
        Offer offer = getOfferById(id);
        
        offer.setPosition(offerDetails.getPosition());
        offer.setDepartment(offerDetails.getDepartment());
        offer.setStipend(offerDetails.getStipend());
        offer.setDuration(offerDetails.getDuration());
        offer.setStartDate(offerDetails.getStartDate());
        offer.setLocation(offerDetails.getLocation());
        offer.setReportingManager(offerDetails.getReportingManager());
        offer.setWorkMode(offerDetails.getWorkMode());
        offer.setStatus(offerDetails.getStatus());
        offer.setGeneratedBy(offerDetails.getGeneratedBy());

        return offerRepository.save(offer);
    }

    public Offer sendOffer(Long id) {
        Offer offer = getOfferById(id);
        offer.setStatus(Offer.OfferStatus.SENT);
        offer.setSentAt(LocalDateTime.now());
        return offerRepository.save(offer);
    }

    public Offer acceptOffer(Long id) {
        Offer offer = getOfferById(id);
        offer.setStatus(Offer.OfferStatus.ACCEPTED);
        return offerRepository.save(offer);
    }

    public Offer rejectOffer(Long id) {
        Offer offer = getOfferById(id);
        offer.setStatus(Offer.OfferStatus.REJECTED);
        return offerRepository.save(offer);
    }

    public void deleteOffer(Long id) {
        Offer offer = getOfferById(id);
        offerRepository.delete(offer);
    }

    public long countByStatus(Offer.OfferStatus status) {
        return offerRepository.findByStatus(status).size();
    }
}
