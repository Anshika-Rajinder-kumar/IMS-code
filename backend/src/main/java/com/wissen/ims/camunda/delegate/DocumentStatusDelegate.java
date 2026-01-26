package com.wissen.ims.camunda.delegate;

import com.wissen.ims.model.Document;
import com.wissen.ims.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

/**
 * Camunda Delegate for Document Status Updates
 * Updates document status after HR review
 */
@Slf4j
@Component("documentStatusDelegate")
@RequiredArgsConstructor
public class DocumentStatusDelegate implements JavaDelegate {

    private final DocumentRepository documentRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        log.info("=== Updating Document Status ===");
        
        Long documentId = (Long) execution.getVariable("documentId");
        String docStatus = (String) execution.getVariable("docStatus");
        String remarks = (String) execution.getVariable("remarks");
        
        log.info("Updating document ID: {} to status: {}", documentId, docStatus);
        
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));
        
        document.setStatus(Document.DocumentStatus.valueOf(docStatus));
        if (remarks != null && !remarks.isEmpty()) {
            document.setRejectionReason(remarks);
        }
        
        documentRepository.save(document);
        
        // Set variables for notification
        execution.setVariable("candidateEmail", document.getIntern().getEmail());
        execution.setVariable("candidateName", document.getIntern().getName());
        execution.setVariable("internId", document.getIntern().getId());
        
        if ("VERIFIED".equals(docStatus)) {
            execution.setVariable("notificationType", "DOCUMENT_VERIFIED");
        } else if ("REJECTED".equals(docStatus)) {
            execution.setVariable("notificationType", "DOCUMENT_REJECTED");
            execution.setVariable("rejectionReason", remarks);
        }
        
        log.info("Document status updated successfully");
    }
}
