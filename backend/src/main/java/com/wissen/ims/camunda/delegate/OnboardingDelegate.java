package com.wissen.ims.camunda.delegate;

import com.wissen.ims.model.Intern;
import com.wissen.ims.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

/**
 * Camunda Delegate for Onboarding Process Initiation
 * Triggers when candidate accepts offer
 */
@Slf4j
@Component("onboardingDelegate")
@RequiredArgsConstructor
public class OnboardingDelegate implements JavaDelegate {

    private final InternRepository internRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        log.info("=== Starting Onboarding Process ===");
        
        Long internId = (Long) execution.getVariable("internId");
        if (internId == null) {
            internId = (Long) execution.getVariable("candidateId");
        }
        final Long finalInternId = internId; // Make effectively final for lambda
        log.info("Initiating onboarding for intern ID: {}", finalInternId);
        
        Intern intern = internRepository.findById(finalInternId)
                .orElseThrow(() -> new RuntimeException("Intern not found: " + finalInternId));
        
        // Update intern status to ONBOARDING
        intern.setStatus(Intern.InternStatus.ONBOARDING);
        internRepository.save(intern);
        
        log.info("Intern status updated to ONBOARDING");
        
        // Set notification variables
        execution.setVariable("notificationType", "ONBOARDING_STARTED");
        execution.setVariable("candidateEmail", intern.getEmail());
        execution.setVariable("candidateName", intern.getName());
        
        log.info("=== Onboarding Process Initiated Successfully ===");
    }
}
