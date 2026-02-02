package com.wissen.ims.repository;

import com.wissen.ims.model.Attendance;
import com.wissen.ims.model.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByInternAndDate(Intern intern, LocalDate date);

    java.util.List<Attendance> findAllByInternAndDateBetween(Intern intern, LocalDate startDate, LocalDate endDate);

    java.util.List<Attendance> findAllByCheckOutTimeIsNullAndDateBefore(LocalDate date);
}
