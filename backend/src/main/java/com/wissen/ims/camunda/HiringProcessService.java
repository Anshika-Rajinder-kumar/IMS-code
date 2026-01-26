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
 * Service for Managing Hiring Process Workflows
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HiringProcessService {

    private final RuntimeService runtimeService;
    private final TaskService taskService;

    /**
     * Start the hiring process for a candidate
     */
    public String startHiringProcess(Long candidateId, String candidateName, String candidateEmail) {
        log.info("Starting hiring process for candidate: {}", candidateId);
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("candidateId", candidateId);
        variables.put("candidateName", candidateName);
        variables.put("candidateEmail", candidateEmail);
        variables.put("currentRound", "RESUME_SCREENING");
        
        ProcessInstance instance = runtimeService.startProcessInstanceByKey(
            "hiring-process",
            candidateId.toString(),
            variables
        );
        
        log.info("Hiring process started with instance ID: {}", instance.getId());
        return instance.getId();
    }

    /**
     * Complete a hiring round task
     */
    public void completeRound(String taskId, String status, String feedback, Integer score) {
        log.info("Completing hiring round task: {} with status: {}", taskId, status);
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("status", status);
        variables.put("feedback", feedback);
        if (score != null) {
            variables.put("score", score);
        }
        
        taskService.complete(taskId, variables);
        log.info("Task completed successfully");
    }

    /**
     * Get pending tasks for a specific round
     */
    public List<Task> getPendingRoundTasks(String candidateGroup) {
        return taskService.createTaskQuery()
            .taskCandidateGroup(candidateGroup)
            .list();
    }

    /**
     * Get task by candidate ID
     */
    public Task getCurrentTask(Long candidateId) {
        return taskService.createTaskQuery()
            .processInstanceBusinessKey(candidateId.toString())
            .active()
            .singleResult();
    }

    /**
     * Get process instance by candidate ID
     */
    public ProcessInstance getProcessInstance(Long candidateId) {
        return runtimeService.createProcessInstanceQuery()
            .processInstanceBusinessKey(candidateId.toString())
            .active()
            .singleResult();
    }

    /**
     * Handle offer acceptance
     */
    public void acceptOffer(Long candidateId) {
        log.info("Processing offer acceptance for candidate: {}", candidateId);
        
        Task task = getCurrentTask(candidateId);
        if (task != null && "Task_CandidateDecision".equals(task.getTaskDefinitionKey())) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("offerStatus", "ACCEPTED");
            taskService.complete(task.getId(), variables);
            log.info("Offer accepted successfully");
        } else {
            log.warn("No active offer decision task found for candidate: {}", candidateId);
        }
    }

    /**
     * Handle offer decline
     */
    public void declineOffer(Long candidateId, String reason) {
        log.info("Processing offer decline for candidate: {}", candidateId);
        
        Task task = getCurrentTask(candidateId);
        if (task != null && "Task_CandidateDecision".equals(task.getTaskDefinitionKey())) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("offerStatus", "DECLINED");
            variables.put("declineReason", reason);
            taskService.complete(task.getId(), variables);
            log.info("Offer declined successfully");
        } else {
            log.warn("No active offer decision task found for candidate: {}", candidateId);
        }
    }

    /**
     * Get process variables for a candidate
     */
    public Map<String, Object> getProcessVariables(Long candidateId) {
        ProcessInstance instance = getProcessInstance(candidateId);
        if (instance != null) {
            return runtimeService.getVariables(instance.getId());
        }
        return new HashMap<>();
    }
}
