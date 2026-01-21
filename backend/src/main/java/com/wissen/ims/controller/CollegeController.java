package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.model.College;
import com.wissen.ims.service.CollegeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/colleges")
public class CollegeController {

    @Autowired
    private CollegeService collegeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<College>>> getAllColleges() {
        List<College> colleges = collegeService.getAllColleges();
        return ResponseEntity.ok(ApiResponse.success(colleges));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<College>> getCollegeById(@PathVariable Long id) {
        try {
            College college = collegeService.getCollegeById(id);
            return ResponseEntity.ok(ApiResponse.success(college));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<College>>> getCollegesByStatus(@PathVariable String status) {
        try {
            College.VisitStatus visitStatus = College.VisitStatus.valueOf(status.toUpperCase());
            List<College> colleges = collegeService.getCollegesByStatus(visitStatus);
            return ResponseEntity.ok(ApiResponse.success(colleges));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<College>>> searchColleges(@RequestParam String term) {
        List<College> colleges = collegeService.searchColleges(term);
        return ResponseEntity.ok(ApiResponse.success(colleges));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<College>> createCollege(@RequestBody College college) {
        try {
            College createdCollege = collegeService.createCollege(college);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdCollege));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<College>> updateCollege(@PathVariable Long id, @RequestBody College college) {
        try {
            College updatedCollege = collegeService.updateCollege(id, college);
            return ResponseEntity.ok(ApiResponse.success(updatedCollege));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCollege(@PathVariable Long id) {
        try {
            collegeService.deleteCollege(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
