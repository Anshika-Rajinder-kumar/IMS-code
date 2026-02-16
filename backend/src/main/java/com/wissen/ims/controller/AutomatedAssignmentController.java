package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.model.Intern;
import com.wissen.ims.repository.InternRepository;
import com.wissen.ims.repository.LearningCourseRepository;
import com.wissen.ims.repository.ProjectRepository;
import com.wissen.ims.service.AutomatedAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/automated-assignment")
public class AutomatedAssignmentController {

    @Autowired
    private AutomatedAssignmentService automatedAssignmentService;

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private LearningCourseRepository learningCourseRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam Long internId, @RequestParam("file") MultipartFile file) {
        try {
            AutomatedAssignmentService.AssignmentResult result = automatedAssignmentService.processInternResume(internId, file);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File processing error: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/override")
    public ResponseEntity<?> overrideAssignments(
            @RequestParam Long internId,
            @RequestBody Map<String, List<Long>> overrides) {
        
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found"));

        if (overrides.containsKey("projectIds")) {
            intern.getAssignedProjects().clear();
            intern.getAssignedProjects().addAll(
                projectRepository.findAllById(overrides.get("projectIds"))
            );
        }

        if (overrides.containsKey("courseIds")) {
            intern.getAssignedCourses().clear();
            intern.getAssignedCourses().addAll(
                learningCourseRepository.findAllById(overrides.get("courseIds"))
            );
        }

        return ResponseEntity.ok(ApiResponse.success(internRepository.save(intern)));
    }

    @GetMapping("/analysis")
    public ResponseEntity<?> getInternAnalysis(@RequestParam Long internId) {
        try {
            AutomatedAssignmentService.AssignmentResult result = automatedAssignmentService.getExistingAnalysis(internId);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
