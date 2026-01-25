package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.model.CandidateHiringRound;
import com.wissen.ims.service.CandidateHiringRoundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/candidate-hiring-rounds")
public class CandidateHiringRoundController {

    @Autowired
    private CandidateHiringRoundService candidateHiringRoundService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CandidateHiringRound>>> getAllCandidateHiringRounds() {
        List<CandidateHiringRound> rounds = candidateHiringRoundService.getAllCandidateHiringRounds();
        return ResponseEntity.ok(ApiResponse.success(rounds));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CandidateHiringRound>> getCandidateHiringRoundById(@PathVariable Long id) {
        try {
            CandidateHiringRound round = candidateHiringRoundService.getCandidateHiringRoundById(id);
            return ResponseEntity.ok(ApiResponse.success(round));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<ApiResponse<List<CandidateHiringRound>>> getCandidateHiringRoundsByCandidateId(@PathVariable Long candidateId) {
        List<CandidateHiringRound> rounds = candidateHiringRoundService.getCandidateHiringRoundsByCandidateId(candidateId);
        return ResponseEntity.ok(ApiResponse.success(rounds));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CandidateHiringRound>> createCandidateHiringRound(@RequestBody CandidateHiringRound candidateHiringRound) {
        try {
            CandidateHiringRound created = candidateHiringRoundService.createCandidateHiringRound(candidateHiringRound);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/create-or-update")
    public ResponseEntity<ApiResponse<CandidateHiringRound>> createOrUpdateCandidateHiringRound(@RequestBody CandidateHiringRound candidateHiringRound) {
        try {
            CandidateHiringRound saved = candidateHiringRoundService.createOrUpdateCandidateHiringRound(candidateHiringRound);
            return ResponseEntity.ok(ApiResponse.success(saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CandidateHiringRound>> updateCandidateHiringRound(
            @PathVariable Long id, 
            @RequestBody CandidateHiringRound candidateHiringRound) {
        try {
            CandidateHiringRound updated = candidateHiringRoundService.updateCandidateHiringRound(id, candidateHiringRound);
            return ResponseEntity.ok(ApiResponse.success(updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCandidateHiringRound(@PathVariable Long id) {
        try {
            candidateHiringRoundService.deleteCandidateHiringRound(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
