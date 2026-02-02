package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.model.Attendance;
import com.wissen.ims.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<Attendance>> getTodayAttendance() {
        return attendanceService.getTodayAttendance()
                .map(attendance -> ResponseEntity.ok(ApiResponse.success(attendance)))
                .orElse(ResponseEntity.ok(ApiResponse.success(null)));
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<Attendance>> checkIn(jakarta.servlet.http.HttpServletRequest request) {
        try {
            Attendance attendance = attendanceService.checkIn(request);
            return ResponseEntity.ok(ApiResponse.success(attendance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<Attendance>> checkOut(jakarta.servlet.http.HttpServletRequest request) {
        try {
            Attendance attendance = attendanceService.checkOut(request);
            return ResponseEntity.ok(ApiResponse.success(attendance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/admin/monthly")
    public ResponseEntity<ApiResponse<java.util.List<Attendance>>> getMonthlyAttendance(
            @RequestParam Long internId,
            @RequestParam int year,
            @RequestParam int month) {
        try {
            java.util.List<Attendance> attendanceList = attendanceService.getMonthlyAttendance(internId, year, month);
            return ResponseEntity.ok(ApiResponse.success(attendanceList));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
