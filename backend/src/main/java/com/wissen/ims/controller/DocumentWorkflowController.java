package com.wissen.ims.controller;

import com.wissen.ims.camunda.DocumentProcessService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.task.Task;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for Camunda Document Verification Workflows
 */
@Slf4j
@RestController
@RequestMapping("/workflow/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentWorkflowController {

    private final DocumentProcessService documentProcessService;

    /**
     * Start document verification process
     */
    @PostMapping("/start")
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<Map<String, String>> startDocumentVerification(@RequestBody StartDocVerificationRequest request) {
        log.info("Starting document verification for document: {}", request.getDocumentId());
        
        String processInstanceId = documentProcessService.startDocumentVerification(
            request.getDocumentId(),
            request.getInternId()
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("processInstanceId", processInstanceId);
        response.put("message", "Document verification process started");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Complete document review (HR/Admin)
     */
    @PostMapping("/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, String>> reviewDocument(@RequestBody ReviewDocumentRequest request) {
        log.info("Reviewing document task: {}", request.getTaskId());
        
        documentProcessService.completeDocumentReview(
            request.getTaskId(),
            request.getStatus(),
            request.getRemarks()
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Document review completed successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get pending document reviews for HR
     */
    @GetMapping("/pending-reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<DocumentTaskDto>> getPendingReviews() {
        log.info("Fetching pending document reviews");
        
        List<Task> tasks = documentProcessService.getPendingDocumentReviews();
        List<DocumentTaskDto> taskDtos = tasks.stream()
            .map(this::mapToDocumentTaskDto)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(taskDtos);
    }

    /**
     * Get current task for a document
     */
    @GetMapping("/document/{documentId}/task")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'INTERN')")
    public ResponseEntity<DocumentTaskDto> getDocumentTask(@PathVariable Long documentId) {
        log.info("Fetching task for document: {}", documentId);
        
        Task task = documentProcessService.getDocumentTask(documentId);
        if (task != null) {
            return ResponseEntity.ok(mapToDocumentTaskDto(task));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get process status for a document
     */
    @GetMapping("/document/{documentId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'INTERN')")
    public ResponseEntity<Map<String, Object>> getDocumentProcessStatus(@PathVariable Long documentId) {
        log.info("Fetching process status for document: {}", documentId);
        
        Map<String, Object> variables = documentProcessService.getDocumentProcessVariables(documentId);
        boolean isActive = documentProcessService.isDocumentProcessActive(documentId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("isActive", isActive);
        response.put("variables", variables);
        
        return ResponseEntity.ok(response);
    }

    // Helper method to map Task to DTO
    private DocumentTaskDto mapToDocumentTaskDto(Task task) {
        DocumentTaskDto dto = new DocumentTaskDto();
        dto.setTaskId(task.getId());
        dto.setTaskName(task.getName());
        dto.setTaskDefinitionKey(task.getTaskDefinitionKey());
        dto.setProcessInstanceId(task.getProcessInstanceId());
        dto.setCreatedDate(task.getCreateTime());
        return dto;
    }

    // DTOs
    @Data
    public static class StartDocVerificationRequest {
        private Long documentId;
        private Long internId;
    }

    @Data
    public static class ReviewDocumentRequest {
        private String taskId;
        private String status; // VERIFIED or REJECTED
        private String remarks;
    }

    @Data
    public static class DocumentTaskDto {
        private String taskId;
        private String taskName;
        private String taskDefinitionKey;
        private String processInstanceId;
        private java.util.Date createdDate;
    }
}
