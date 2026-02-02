package com.wissen.ims.service;

import com.wissen.ims.model.Attendance;
import com.wissen.ims.model.AttendanceStatus;
import com.wissen.ims.repository.AttendanceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@Slf4j
public class AttendanceCleanupService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    /**
     * Nightly cleanup job runs at 12:05 AM IST.
     * Logic: If an intern checked in but forgot to check out for any previous day,
     * finalize their record with:
     * - checkOutTime = checkInTime + 2 hours
     * - status = HALF_DAY
     */
    @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void cleanupForgottenCheckOuts() {
        log.info("Starting nightly attendance cleanup for forgotten check-outs...");

        LocalDate today = LocalDate.now(IST_ZONE);
        List<Attendance> incompleteRecords = attendanceRepository.findAllByCheckOutTimeIsNullAndDateBefore(today);

        log.info("Found {} incomplete attendance records from previous days.", incompleteRecords.size());

        for (Attendance record : incompleteRecords) {
            try {
                LocalDateTime fakeCheckOut = record.getCheckInTime().plusHours(2);
                record.setCheckOutTime(fakeCheckOut);
                record.setStatus(AttendanceStatus.HALF_DAY);
                attendanceRepository.save(record);
                log.info("Finalized record for intern {} on date {}: marked as HALF_DAY with 2hr duration.",
                        record.getIntern().getName(), record.getDate());
            } catch (Exception e) {
                log.error("Failed to finalize attendance record ID {}: {}", record.getId(), e.getMessage());
            }
        }

        log.info("Attendance cleanup completed.");
    }

    public void manuallyTriggerCleanup() {
        log.info("Manually triggering attendance cleanup...");
        cleanupForgottenCheckOuts();
    }
}
