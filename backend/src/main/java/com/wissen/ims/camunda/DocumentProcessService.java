package com.wissen.ims.camunda;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for Managing Document Verification Workflows
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentProcessService {

    private final RuntimeService runtimeService;
    private final TaskService taskService;

    /**
     * Start document verification process
     */
    public String startDocumentVerification(Long documentId, Long internId) {
        log.info("Starting document verification process for document: {}", documentId);
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("documentId", documentId);
        variables.put("internId", internId);
        
        ProcessInstance instance = runtimeService.startProcessInstanceByKey(
            "document-verification-process",
            documentId.toString(),
            variables
        );
        
        log.info("Document verification process started with instance ID: {}", instance.getId());
        return instance.getId();
    }

    /**
     * Complete HR document review task
     */
    public void completeDocumentReview(String taskId, String status, String remarks) {
        log.info("Completing document review task: {} with status: {}", taskId, status);
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("docStatus", status);
        if (remarks != null && !remarks.isEmpty()) {
            variables.put("remarks", remarks);
        }
        
        taskService.complete(taskId, variables);
        log.info("Document review completed successfully");
    }

    /**
     * Get pending document review tasks for HR
     */
    public List<Task> getPendingDocumentReviews() {
        return taskService.createTaskQuery()
            .taskCandidateGroup("HR")
            .taskDefinitionKey("Task_HRReview")
            .list();
    }

    /**
     * Get task by document ID
     */
    public Task getDocumentTask(Long documentId) {
        return taskService.createTaskQuery()
            .processInstanceBusinessKey(documentId.toString())
            .active()
            .singleResult();
    }

    /**
     * Get all pending review tasks for a specific HR user
     */
    public List<Task> getPendingTasksForUser(String userId) {
        return taskService.createTaskQuery()
            .taskCandidateGroup("HR")
            .active()
            .list();
    }

    /**
     * Get process instance by document ID
     */
    public ProcessInstance getDocumentProcessInstance(Long documentId) {
        return runtimeService.createProcessInstanceQuery()
            .processInstanceBusinessKey(documentId.toString())
            .active()
            .singleResult();
    }

    /**
     * Get process variables for a document
     */
    public Map<String, Object> getDocumentProcessVariables(Long documentId) {
        ProcessInstance instance = getDocumentProcessInstance(documentId);
        if (instance != null) {
            return runtimeService.getVariables(instance.getId());
        }
        return new HashMap<>();
    }

    /**
     * Check if document process is still active
     */
    public boolean isDocumentProcessActive(Long documentId) {
        ProcessInstance instance = getDocumentProcessInstance(documentId);
        return instance != null;
    }
}
