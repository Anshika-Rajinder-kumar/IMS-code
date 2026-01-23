package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.model.HiringRound;
import com.wissen.ims.service.HiringRoundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hiring-rounds")
public class HiringRoundController {

    @Autowired
    private HiringRoundService hiringRoundService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HiringRound>>> getAllHiringRounds() {
        List<HiringRound> hiringRounds = hiringRoundService.getAllHiringRounds();
        return ResponseEntity.ok(ApiResponse.success(hiringRounds));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HiringRound>> getHiringRoundById(@PathVariable Long id) {
        try {
            HiringRound hiringRound = hiringRoundService.getHiringRoundById(id);
            return ResponseEntity.ok(ApiResponse.success(hiringRound));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/intern/{internId}")
    public ResponseEntity<ApiResponse<List<HiringRound>>> getHiringRoundsByInternId(@PathVariable Long internId) {
        List<HiringRound> hiringRounds = hiringRoundService.getHiringRoundsByInternId(internId);
        return ResponseEntity.ok(ApiResponse.success(hiringRounds));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<HiringRound>>> getHiringRoundsByStatus(@PathVariable String status) {
        try {
            HiringRound.RoundStatus roundStatus = HiringRound.RoundStatus.valueOf(status.toUpperCase());
            List<HiringRound> hiringRounds = hiringRoundService.getHiringRoundsByStatus(roundStatus);
            return ResponseEntity.ok(ApiResponse.success(hiringRounds));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status"));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HiringRound>> createHiringRound(@RequestBody HiringRound hiringRound) {
        try {
            HiringRound createdHiringRound = hiringRoundService.createHiringRound(hiringRound);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdHiringRound));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HiringRound>> updateHiringRound(
            @PathVariable Long id, 
            @RequestBody HiringRound hiringRound) {
        try {
            HiringRound updatedHiringRound = hiringRoundService.updateHiringRound(id, hiringRound);
            return ResponseEntity.ok(ApiResponse.success(updatedHiringRound));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<HiringRound>> updateRoundStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            HiringRound.RoundStatus roundStatus = HiringRound.RoundStatus.valueOf(status.toUpperCase());
            HiringRound updatedHiringRound = hiringRoundService.updateRoundStatus(id, roundStatus);
            return ResponseEntity.ok(ApiResponse.success(updatedHiringRound));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHiringRound(@PathVariable Long id) {
        try {
            hiringRoundService.deleteHiringRound(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
