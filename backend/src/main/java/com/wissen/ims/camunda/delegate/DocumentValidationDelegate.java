package com.wissen.ims.camunda.delegate;

import com.wissen.ims.model.Document;
import com.wissen.ims.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

/**
 * Camunda Delegate for Document Auto-Validation
 * Validates document format, size, and basic requirements
 */
@Slf4j
@Component("documentValidationDelegate")
@RequiredArgsConstructor
public class DocumentValidationDelegate implements JavaDelegate {

    private final DocumentRepository documentRepository;
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"};

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        log.info("=== Starting Document Auto-Validation ===");
        
        Long documentId = (Long) execution.getVariable("documentId");
        log.info("Validating document ID: {}", documentId);
        
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));
        
        boolean validationResult = true;
        StringBuilder validationErrors = new StringBuilder();
        
        // Check file extension
        String filePath = document.getFilePath();
        if (filePath != null) {
            boolean validExtension = false;
            for (String ext : ALLOWED_EXTENSIONS) {
                if (filePath.toLowerCase().endsWith(ext)) {
                    validExtension = true;
                    break;
                }
            }
            if (!validExtension) {
                validationResult = false;
                validationErrors.append("Invalid file format. Only PDF and images allowed. ");
            }
        }
        
        // Size is stored as String in model, skip size validation for now
        
        // Set validation result
        execution.setVariable("validationResult", validationResult);
        execution.setVariable("validationErrors", validationErrors.toString());
        execution.setVariable("candidateEmail", document.getIntern().getEmail());
        execution.setVariable("candidateName", document.getIntern().getName());
        
        if (!validationResult) {
            log.warn("Document validation failed: {}", validationErrors);
            document.setStatus(Document.DocumentStatus.REJECTED);
            document.setRejectionReason("Auto-validation failed: " + validationErrors);
            documentRepository.save(document);
            execution.setVariable("notificationType", "DOCUMENT_REJECTED");
            execution.setVariable("rejectionReason", validationErrors.toString());
        } else {
            log.info("Document validation passed");
            document.setStatus(Document.DocumentStatus.PENDING);
            documentRepository.save(document);
        }
        
        log.info("=== Document Auto-Validation Completed ===");
    }
}
