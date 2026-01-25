package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.dto.BulkUploadResponse;
import com.wissen.ims.model.Candidate;
import com.wissen.ims.model.Intern;
import com.wissen.ims.service.CandidateService;
import com.wissen.ims.service.CSVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/candidates")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @Autowired
    private CSVService csvService;

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

    @PostMapping("/{id}/upload-resume")
    public ResponseEntity<ApiResponse<Candidate>> uploadResume(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Please select a file to upload"));
            }

            // Create upload directory if it doesn't exist
            String uploadDir = "uploads/resumes/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = "candidate_" + id + fileExtension;
            
            // Save file
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update candidate with resume filename
            Candidate candidate = candidateService.getCandidateById(id);
            candidate.setResumeUrl(newFilename);
            Candidate updatedCandidate = candidateService.updateCandidate(id, candidate);

            return ResponseEntity.ok(ApiResponse.success(updatedCandidate));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long id) {
        try {
            Candidate candidate = candidateService.getCandidateById(id);
            
            if (candidate.getResumeUrl() == null || candidate.getResumeUrl().isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // Get the file path using the stored filename
            String uploadDir = "uploads/resumes/";
            Path filePath = Paths.get(uploadDir).resolve(candidate.getResumeUrl()).normalize();
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<ApiResponse<BulkUploadResponse>> bulkUploadCandidates(
            @RequestParam("file") MultipartFile file,
            @RequestParam("collegeId") Long collegeId,
            @RequestParam("collegeName") String collegeName) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Please upload a CSV file"));
            }
            
            if (!file.getOriginalFilename().endsWith(".csv")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Only CSV files are allowed"));
            }
            
            BulkUploadResponse response = csvService.processCandidateCSV(file, collegeId, collegeName);
            
            // Always return the response with details, use appropriate status code
            if (response.getSuccessCount() > 0) {
                return ResponseEntity.ok(ApiResponse.success(response));
            } else {
                // Even if all failed, return 200 with the detailed response
                return ResponseEntity.ok(ApiResponse.success(response));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to process CSV file: " + e.getMessage()));
        }
    }
}

