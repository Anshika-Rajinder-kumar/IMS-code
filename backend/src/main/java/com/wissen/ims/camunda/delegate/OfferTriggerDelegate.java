package com.wissen.ims.camunda.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Camunda Delegate to Trigger Offer Letter Generation Process
 * Starts the hiring process when all documents are verified
 */
@Slf4j
@Component("offerTriggerDelegate")
@RequiredArgsConstructor
public class OfferTriggerDelegate implements JavaDelegate {

    private final RuntimeService runtimeService;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        log.info("=== Triggering Offer Letter Generation ===");
        
        Long candidateId = (Long) execution.getVariable("candidateId");
        String candidateEmail = (String) execution.getVariable("candidateEmail");
        String candidateName = (String) execution.getVariable("candidateName");
        
        log.info("Starting hiring process for candidate ID: {}", candidateId);
        
        // Prepare variables for hiring process
        Map<String, Object> variables = new HashMap<>();
        variables.put("candidateId", candidateId);
        variables.put("candidateEmail", candidateEmail);
        variables.put("candidateName", candidateName);
        variables.put("currentRound", "OFFER_GENERATION");
        variables.put("documentsVerified", true);
        
        // Start hiring process instance - this will trigger offer generation
        try {
            // Check if hiring process already started
            String processInstanceId = (String) execution.getVariable("hiringProcessInstanceId");
            
            if (processInstanceId == null) {
                // Start new hiring process
                var processInstance = runtimeService.startProcessInstanceByKey(
                    "hiring-process",
                    candidateId.toString(),
                    variables
                );
                
                execution.setVariable("hiringProcessInstanceId", processInstance.getId());
                log.info("Hiring process started with instance ID: {}", processInstance.getId());
            } else {
                log.info("Hiring process already running with instance ID: {}", processInstanceId);
            }
            
        } catch (Exception e) {
            log.error("Failed to start hiring process", e);
            throw new RuntimeException("Failed to trigger offer generation: " + e.getMessage());
        }
        
        log.info("=== Offer Letter Generation Triggered Successfully ===");
    }
}
