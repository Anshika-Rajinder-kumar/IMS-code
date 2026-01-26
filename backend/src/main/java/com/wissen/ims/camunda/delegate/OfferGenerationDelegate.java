package com.wissen.ims.camunda.delegate;

import com.wissen.ims.model.Intern;
import com.wissen.ims.model.Offer;
import com.wissen.ims.repository.InternRepository;
import com.wissen.ims.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Camunda Delegate for Offer Letter Generation
 * This service task automatically generates offer letters after all rounds are cleared
 */
@Slf4j
@Component("offerGenerationDelegate")
@RequiredArgsConstructor
public class OfferGenerationDelegate implements JavaDelegate {

    private final InternRepository internRepository;
    private final OfferRepository offerRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        log.info("=== Starting Offer Letter Generation Process ===");
        
        // Get intern ID from process variables
        Long internId = (Long) execution.getVariable("internId");
        if (internId == null) {
            internId = (Long) execution.getVariable("candidateId");
        }
        final Long finalInternId = internId; // Make effectively final for lambda
        log.info("Generating offer for intern ID: {}", finalInternId);
        
        // Fetch intern details
        Intern intern = internRepository.findById(finalInternId)
                .orElseThrow(() -> new RuntimeException("Intern not found: " + finalInternId));
        
        // Check if offer already exists
        if (offerRepository.existsByInternId(finalInternId)) {
            log.info("Offer letter already exists for intern: {}", finalInternId);
            execution.setVariable("offerExists", true);
            return;
        }
        
        // Create new offer letter
        Offer offer = new Offer();
        offer.setIntern(intern);
        offer.setPosition("Software Engineering Intern");
        offer.setDepartment("Engineering");
        offer.setStipend(25000); // Default stipend
        offer.setStartDate(LocalDate.now().plusMonths(1));
        offer.setDuration("6 months");
        offer.setLocation("Bangalore, India");
        offer.setWorkMode(Offer.WorkMode.HYBRID);
        offer.setStatus(Offer.OfferStatus.GENERATED);
        
        // Save offer letter
        Offer savedOffer = offerRepository.save(offer);
        log.info("Offer letter generated successfully with ID: {}", savedOffer.getId());
        
        // Update intern status
        intern.setStatus(Intern.InternStatus.OFFER_GENERATED);
        internRepository.save(intern);
        
        // Set process variables
        execution.setVariable("offerId", savedOffer.getId());
        execution.setVariable("offerExists", false);
        execution.setVariable("candidateEmail", intern.getEmail());
        execution.setVariable("candidateName", intern.getName());
        
        log.info("=== Offer Letter Generation Process Completed ===");
    }
}
