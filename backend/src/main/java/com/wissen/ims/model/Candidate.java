package com.wissen.ims.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    private String emergencyContact;

    @Column(nullable = false)
    private Long collegeId;

    @Column(nullable = false)
    private String collegeName;

    @Column(nullable = false)
    private String branch;

    @Column(nullable = false)
    private String cgpa;

    @Column
    private Integer graduationYear;

    @Column(length = 500)
    private String address;

    @Column(length = 500)
    private String resumeUrl; // Path to uploaded resume file

    @Column(length = 100)
    private String hiringRound; // Current hiring round: "Applied", "Technical Round 1", "HR Round", etc.

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private HiringStatus hiringStatus; // Current status in hiring process

    @Column
    private Integer hiringScore; // Overall hiring score

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStatus status = CandidateStatus.APPLIED;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum HiringStatus {
        NOT_STARTED,
        PENDING,
        IN_PROGRESS,
        CLEARED,
        REJECTED,
        ON_HOLD
    }

    public enum CandidateStatus {
        APPLIED, // Initial application
        SCREENING, // Under screening
        INTERVIEW_SCHEDULED, // Interview scheduled
        INTERVIEWING, // Currently interviewing
        SELECTED, // Selected for internship
        REJECTED, // Not selected
        WITHDRAWN // Candidate withdrew
    }
}
