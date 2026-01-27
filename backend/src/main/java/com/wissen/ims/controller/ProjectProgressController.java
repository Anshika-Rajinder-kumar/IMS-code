package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.dto.ProjectProgressRequest;
import com.wissen.ims.dto.ProjectProgressResponse;
import com.wissen.ims.service.ProjectProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/project-progress")
@CrossOrigin(origins = "*")
public class ProjectProgressController {

    @Autowired
    private ProjectProgressService progressService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectProgressResponse>> createOrUpdateProgress(
            @RequestBody ProjectProgressRequest request) {
        try {
            System.out.println("Received progress request: " + request);
            System.out.println("Intern ID: " + request.getInternId());
            System.out.println("Project ID: " + request.getProjectId());
            System.out.println("Completion: " + request.getCompletionPercentage());
            
            ProjectProgressResponse response = progressService.createOrUpdateProgress(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to save progress: " + e.getMessage()));
        }
    }

    @GetMapping("/intern/{internId}")
    public ResponseEntity<ApiResponse<List<ProjectProgressResponse>>> getProgressByIntern(
            @PathVariable Long internId) {
        try {
            List<ProjectProgressResponse> progress = progressService.getProgressByIntern(internId);
            return ResponseEntity.ok(ApiResponse.success(progress));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch progress: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectProgressResponse>>> getAllProgress() {
        try {
            List<ProjectProgressResponse> progress = progressService.getAllProgress();
            return ResponseEntity.ok(ApiResponse.success(progress));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch progress: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectProgressResponse>> getProgressById(@PathVariable Long id) {
        try {
            ProjectProgressResponse progress = progressService.getProgressById(id);
            return ResponseEntity.ok(ApiResponse.success(progress));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch progress: " + e.getMessage()));
        }
    }
}
