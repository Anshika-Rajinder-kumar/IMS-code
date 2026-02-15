package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.dto.InternLearningResponse;
import com.wissen.ims.model.Intern;
import com.wissen.ims.service.InternService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/intern")
public class InternLearningController {

    @Autowired
    private InternService internService;

    @GetMapping("/learning")
    public ResponseEntity<ApiResponse<InternLearningResponse>> getMyLearning() {
        try {
            // Find user email from SecurityContext
            String email = SecurityContextHolder.getContext().getAuthentication().getName();

            // Find intern by email
            // Assuming we search intern by email since Intern entity has unique email field
            Intern intern = internService.searchInterns(email).stream()
                    .filter(i -> i.getEmail().equalsIgnoreCase(email))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Intern profile not found"));

            InternLearningResponse response = InternLearningResponse.builder()
                    .internId(intern.getId())
                    .internName(intern.getName())
                    .internEmail(intern.getEmail())
                    .joinDate(intern.getJoinDate())
                    .courses(intern.getAssignedCourses())
                    .projects(intern.getAssignedProjects())
                    .build();

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
