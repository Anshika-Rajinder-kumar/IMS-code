package com.wissen.ims.controller;

import com.wissen.ims.camunda.HiringProcessService;
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
 * REST Controller for Camunda Hiring Process Workflows
 */
@Slf4j
@RestController
@RequestMapping("/workflow/hiring")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HiringWorkflowController {

    private final HiringProcessService hiringProcessService;

    /**
     * Start hiring process for a candidate
     */
    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, String>> startHiringProcess(@RequestBody StartProcessRequest request) {
        log.info("Starting hiring process for candidate: {}", request.getCandidateId());
        
        String processInstanceId = hiringProcessService.startHiringProcess(
            request.getCandidateId(),
            request.getCandidateName(),
            request.getCandidateEmail()
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("processInstanceId", processInstanceId);
        response.put("message", "Hiring process started successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Complete a hiring round
     */
    @PostMapping("/complete-round")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, String>> completeRound(@RequestBody CompleteRoundRequest request) {
        log.info("Completing hiring round task: {}", request.getTaskId());
        
        hiringProcessService.completeRound(
            request.getTaskId(),
            request.getStatus(),
            request.getFeedback(),
            request.getScore()
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hiring round completed successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get pending hiring tasks for HR/Admin
     */
    @GetMapping("/pending-tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<TaskDto>> getPendingTasks() {
        log.info("Fetching pending hiring tasks");
        
        List<Task> tasks = hiringProcessService.getPendingRoundTasks("HR,ADMIN");
        List<TaskDto> taskDtos = tasks.stream()
            .map(this::mapToTaskDto)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(taskDtos);
    }

    /**
     * Get current task for a candidate
     */
    @GetMapping("/candidate/{candidateId}/current-task")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<TaskDto> getCurrentTask(@PathVariable Long candidateId) {
        log.info("Fetching current task for candidate: {}", candidateId);
        
        Task task = hiringProcessService.getCurrentTask(candidateId);
        if (task != null) {
            return ResponseEntity.ok(mapToTaskDto(task));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get process status for a candidate
     */
    @GetMapping("/candidate/{candidateId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> getProcessStatus(@PathVariable Long candidateId) {
        log.info("Fetching process status for candidate: {}", candidateId);
        
        Map<String, Object> variables = hiringProcessService.getProcessVariables(candidateId);
        if (!variables.isEmpty()) {
            return ResponseEntity.ok(variables);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Accept offer letter
     */
    @PostMapping("/offer/accept")
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<Map<String, String>> acceptOffer(@RequestBody OfferDecisionRequest request) {
        log.info("Processing offer acceptance for candidate: {}", request.getCandidateId());
        
        hiringProcessService.acceptOffer(request.getCandidateId());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Offer accepted successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Decline offer letter
     */
    @PostMapping("/offer/decline")
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<Map<String, String>> declineOffer(@RequestBody OfferDecisionRequest request) {
        log.info("Processing offer decline for candidate: {}", request.getCandidateId());
        
        hiringProcessService.declineOffer(request.getCandidateId(), request.getReason());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Offer declined successfully");
        
        return ResponseEntity.ok(response);
    }

    // Helper method to map Task to DTO
    private TaskDto mapToTaskDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setTaskId(task.getId());
        dto.setTaskName(task.getName());
        dto.setTaskDefinitionKey(task.getTaskDefinitionKey());
        dto.setProcessInstanceId(task.getProcessInstanceId());
        dto.setCreatedDate(task.getCreateTime());
        return dto;
    }

    // DTOs
    @Data
    public static class StartProcessRequest {
        private Long candidateId;
        private String candidateName;
        private String candidateEmail;
    }

    @Data
    public static class CompleteRoundRequest {
        private String taskId;
        private String status;
        private String feedback;
        private Integer score;
    }

    @Data
    public static class OfferDecisionRequest {
        private Long candidateId;
        private String reason;
    }

    @Data
    public static class TaskDto {
        private String taskId;
        private String taskName;
        private String taskDefinitionKey;
        private String processInstanceId;
        private java.util.Date createdDate;
    }
}
