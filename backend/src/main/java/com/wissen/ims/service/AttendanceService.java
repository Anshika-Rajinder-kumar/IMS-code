package com.wissen.ims.service;

import com.wissen.ims.model.Attendance;
import com.wissen.ims.model.AttendanceStatus;
import com.wissen.ims.model.Intern;
import com.wissen.ims.repository.AttendanceRepository;
import com.wissen.ims.repository.InternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

@Service
@Transactional
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private InternRepository internRepository;

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    private Intern getCurrentIntern() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return internRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Intern not found for email: " + email));
    }

    private LocalDate getTodayIST() {
        return LocalDate.now(IST_ZONE);
    }

    private LocalDateTime nowIST() {
        return LocalDateTime.now(IST_ZONE);
    }

    public Optional<Attendance> getTodayAttendance() {
        Intern intern = getCurrentIntern();
        return attendanceRepository.findByInternAndDate(intern, getTodayIST());
    }

    public Attendance checkIn(jakarta.servlet.http.HttpServletRequest request) {
        Intern intern = getCurrentIntern();
        LocalDate today = getTodayIST();

        if (attendanceRepository.findByInternAndDate(intern, today).isPresent()) {
            throw new RuntimeException("Attendance already marked for today");
        }

        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        boolean isTrusted = isIpTrusted(ipAddress);
        System.out.println("X-Forwarded-For = " + request.getHeader("X-Forwarded-For"));
        System.out.println("RemoteAddr = {}" + request.getRemoteAddr());

        if (!isTrusted) {
            throw new RuntimeException("Attendance action only allowed from Office WiFi");
        }

        Attendance attendance = new Attendance();
        attendance.setIntern(intern);
        attendance.setDate(today);
        attendance.setCheckInTime(nowIST());
        attendance.setStatus(AttendanceStatus.HALF_DAY);
        attendance.setIpAddress(ipAddress);
        attendance.setUserAgent(userAgent);
        attendance.setNetworkTrusted(true);

        return attendanceRepository.save(attendance);
    }

    private static final java.util.List<String> OFFICE_IPS = java.util.List.of(
            /* "127.0.0.1", "0:0:0:0:0:0:0:1", "103.110.174.19", */"171.48.96.178" // Example office IPs
    );

    private String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private boolean isIpTrusted(String ip) {
        return OFFICE_IPS.contains(ip);
    }

    public Attendance checkOut(jakarta.servlet.http.HttpServletRequest request) {
        Intern intern = getCurrentIntern();
        LocalDate today = getTodayIST();

        Attendance attendance = attendanceRepository.findByInternAndDate(intern, today)
                .orElseThrow(() -> new RuntimeException("Check-in required before check-out"));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Already checked out for today");
        }

        String ipAddress = getClientIp(request);
        if (!isIpTrusted(ipAddress)) {
            throw new RuntimeException("Attendance action only allowed from Office WiFi");
        }

        LocalDateTime checkInTime = attendance.getCheckInTime();
        LocalDateTime checkOutTime = nowIST();

        // Calculate duration and determine status
        java.time.Duration duration = java.time.Duration.between(checkInTime, checkOutTime);
        long hours = duration.toHours();

        attendance.setCheckOutTime(checkOutTime);

        // Threshold logic: >= 4 hours is PRESENT, else HALF_DAY
        if (hours >= 4) {
            attendance.setStatus(AttendanceStatus.PRESENT);
        } else {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        }

        return attendanceRepository.save(attendance);
    }

    public java.util.List<Attendance> getMonthlyAttendance(Long internId, int year, int month) {
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found"));

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        return attendanceRepository.findAllByInternAndDateBetween(intern, startDate, endDate);
    }
}
