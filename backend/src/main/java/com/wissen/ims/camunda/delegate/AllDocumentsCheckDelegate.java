package com.wissen.ims.camunda.delegate;

import com.wissen.ims.model.Document;
import com.wissen.ims.model.Intern;
import com.wissen.ims.repository.DocumentRepository;
import com.wissen.ims.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Camunda Delegate to Check if All Documents are Verified
 * Determines if intern is ready for offer letter generation
 */
@Slf4j
@Component("allDocumentsCheckDelegate")
@RequiredArgsConstructor
public class AllDocumentsCheckDelegate implements JavaDelegate {

    private final DocumentRepository documentRepository;
    private final InternRepository internRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        log.info("=== Checking All Documents Status ===");
        
        Long internId = (Long) execution.getVariable("internId");
        log.info("Checking documents for intern ID: {}", internId);
        
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found: " + internId));
        
        List<Document> documents = documentRepository.findByInternId(internId);
        
        if (documents.isEmpty()) {
            log.warn("No documents found for intern: {}", internId);
            execution.setVariable("allDocsVerified", false);
            return;
        }
        
        // Check if all documents are verified
        long verifiedCount = documents.stream()
                .filter(doc -> "VERIFIED".equals(doc.getStatus()))
                .count();
        
        long totalRequired = documents.size();
        boolean allVerified = verifiedCount == totalRequired;
        
        log.info("Documents status - Verified: {}/{}", verifiedCount, totalRequired);
        
        execution.setVariable("allDocsVerified", allVerified);
        execution.setVariable("verifiedDocsCount", verifiedCount);
        execution.setVariable("totalDocsRequired", totalRequired);
        
        // Update intern status if all docs verified
        if (allVerified) {
            intern.setStatus(Intern.InternStatus.DOCUMENT_VERIFIED);
            internRepository.save(intern);
            log.info("All documents verified - Intern status updated to DOCUMENT_VERIFIED");
        }
        
        log.info("=== Document Check Completed ===");
    }
}
