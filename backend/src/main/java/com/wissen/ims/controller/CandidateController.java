package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.model.Candidate;
import com.wissen.ims.model.Intern;
import com.wissen.ims.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/candidates")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Candidate>>> getAllCandidates() {
        List<Candidate> candidates = candidateService.getAllCandidates();
        return ResponseEntity.ok(ApiResponse.success(candidates));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Candidate>> getCandidateById(@PathVariable Long id) {
        try {
            Candidate candidate = candidateService.getCandidateById(id);
            return ResponseEntity.ok(ApiResponse.success(candidate));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Candidate>>> getCandidatesByStatus(@PathVariable String status) {
        try {
            Candidate.CandidateStatus candidateStatus = Candidate.CandidateStatus.valueOf(status.toUpperCase());
            List<Candidate> candidates = candidateService.getCandidatesByStatus(candidateStatus);
            return ResponseEntity.ok(ApiResponse.success(candidates));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status"));
        }
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<ApiResponse<List<Candidate>>> getCandidatesByCollegeId(@PathVariable Long collegeId) {
        List<Candidate> candidates = candidateService.getCandidatesByCollegeId(collegeId);
        return ResponseEntity.ok(ApiResponse.success(candidates));
    }

    @GetMapping("/college/name/{collegeName}")
    public ResponseEntity<ApiResponse<List<Candidate>>> getCandidatesByCollegeName(@PathVariable String collegeName) {
        List<Candidate> candidates = candidateService.getCandidatesByCollegeName(collegeName);
        return ResponseEntity.ok(ApiResponse.success(candidates));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Candidate>>> searchCandidates(@RequestParam String term) {
        List<Candidate> candidates = candidateService.searchCandidates(term);
        return ResponseEntity.ok(ApiResponse.success(candidates));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Candidate>> createCandidate(@RequestBody Candidate candidate) {
        try {
            Candidate createdCandidate = candidateService.createCandidate(candidate);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdCandidate));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Candidate>> updateCandidate(@PathVariable Long id, @RequestBody Candidate candidate) {
        try {
            Candidate updatedCandidate = candidateService.updateCandidate(id, candidate);
            return ResponseEntity.ok(ApiResponse.success(updatedCandidate));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Candidate>> updateCandidateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Candidate.CandidateStatus candidateStatus = Candidate.CandidateStatus.valueOf(status.toUpperCase());
            Candidate updatedCandidate = candidateService.updateCandidateStatus(id, candidateStatus);
            return ResponseEntity.ok(ApiResponse.success(updatedCandidate));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/convert-to-intern")
    public ResponseEntity<ApiResponse<Intern>> convertToIntern(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String joinDateStr = payload.get("joinDate");
            LocalDate joinDate = joinDateStr != null ? LocalDate.parse(joinDateStr) : LocalDate.now();
            
            Intern intern = candidateService.convertCandidateToIntern(id, joinDate);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(intern));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCandidate(@PathVariable Long id) {
        try {
            candidateService.deleteCandidate(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
