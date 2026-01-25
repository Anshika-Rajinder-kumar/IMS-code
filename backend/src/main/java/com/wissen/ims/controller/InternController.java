package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.model.Intern;
import com.wissen.ims.service.InternService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interns")
public class InternController {

    @Autowired
    private InternService internService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Intern>>> getAllInterns() {
        List<Intern> interns = internService.getAllInterns();
        return ResponseEntity.ok(ApiResponse.success(interns));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Intern>> getInternById(@PathVariable Long id) {
        try {
            Intern intern = internService.getInternById(id);
            return ResponseEntity.ok(ApiResponse.success(intern));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Intern>>> getInternsByStatus(@PathVariable String status) {
        try {
            Intern.InternStatus internStatus = Intern.InternStatus.valueOf(status.toUpperCase());
            List<Intern> interns = internService.getInternsByStatus(internStatus);
            return ResponseEntity.ok(ApiResponse.success(interns));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Intern>>> searchInterns(@RequestParam String term) {
        List<Intern> interns = internService.searchInterns(term);
        return ResponseEntity.ok(ApiResponse.success(interns));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Intern>> createIntern(@RequestBody Intern intern) {
        try {
            Intern createdIntern = internService.createIntern(intern);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdIntern));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Intern>> updateIntern(@PathVariable Long id, @RequestBody Intern intern) {
        try {
            Intern updatedIntern = internService.updateIntern(id, intern);
            return ResponseEntity.ok(ApiResponse.success(updatedIntern));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Intern>> updateInternStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Intern.InternStatus internStatus = Intern.InternStatus.valueOf(status.toUpperCase());
            Intern updatedIntern = internService.updateInternStatus(id, internStatus);
            return ResponseEntity.ok(ApiResponse.success(updatedIntern));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/hiring-status")
    public ResponseEntity<ApiResponse<Intern>> updateInternHiringStatus(
            @PathVariable Long id,
            @RequestParam String hiringRound,
            @RequestParam String hiringStatus,
            @RequestParam(required = false) Integer hiringScore) {
        try {
            Intern.HiringStatus status = Intern.HiringStatus.valueOf(hiringStatus.toUpperCase());
            Intern updatedIntern = internService.updateInternHiringStatus(id, hiringRound, status, hiringScore);
            return ResponseEntity.ok(ApiResponse.success(updatedIntern));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIntern(@PathVariable Long id) {
        try {
            internService.deleteIntern(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
