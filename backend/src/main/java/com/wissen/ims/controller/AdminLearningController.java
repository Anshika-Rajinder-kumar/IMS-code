package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.dto.LearningAssignmentRequest;
import com.wissen.ims.model.Intern;
import com.wissen.ims.model.LearningCourse;
import com.wissen.ims.model.Project;
import com.wissen.ims.service.LearningAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminLearningController {

    @Autowired
    private LearningAssignmentService learningAssignmentService;

    @PostMapping("/assign-learning")
    public ResponseEntity<ApiResponse<Intern>> assignLearning(@RequestBody LearningAssignmentRequest request) {
        try {
            Intern updatedIntern = learningAssignmentService.assignLearning(
                    request.getInternId(),
                    request.getCourseIds(),
                    request.getProjectIds());
            return ResponseEntity.ok(ApiResponse.success(updatedIntern));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/interns/active")
    public ResponseEntity<ApiResponse<List<Intern>>> getActiveInterns(@RequestParam(required = false) String term) {
        return ResponseEntity.ok(ApiResponse.success(learningAssignmentService.getActiveInterns(term)));
    }

    @GetMapping("/course-pool")
    public ResponseEntity<ApiResponse<List<LearningCourse>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.success(learningAssignmentService.getAllCourses()));
    }

    @PostMapping("/course-pool")
    public ResponseEntity<ApiResponse<LearningCourse>> createCourse(@RequestBody LearningCourse course) {
        return ResponseEntity.ok(ApiResponse.success(learningAssignmentService.createCourse(course)));
    }

    @DeleteMapping("/course-pool/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        try {
            learningAssignmentService.deleteCourse(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/project-pool")
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.success(learningAssignmentService.getAllProjects()));
    }

    @PostMapping("/project-pool")
    public ResponseEntity<ApiResponse<Project>> createProject(@RequestBody Project project) {
        return ResponseEntity.ok(ApiResponse.success(learningAssignmentService.createProject(project)));
    }

    @DeleteMapping("/project-pool/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        try {
            learningAssignmentService.deleteProject(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
