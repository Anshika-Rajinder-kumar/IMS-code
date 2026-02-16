package com.wissen.ims.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "interns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Intern {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id")
    private College college;

    @Column(nullable = false)
    private String collegeName;

    @Column(nullable = false)
    private String branch;

    @Column(nullable = false)
    private String cgpa;

    private LocalDate joinDate;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String hiringRound; // Current hiring round: "Technical Round 1", "HR Round", etc.

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private HiringStatus hiringStatus; // Current status in hiring process

    @Column
    private Integer hiringScore; // Overall hiring score

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InternStatus status = InternStatus.DOCUMENT_PENDING;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "intern_courses", joinColumns = @JoinColumn(name = "intern_id"), inverseJoinColumns = @JoinColumn(name = "course_id"))
    private Set<LearningCourse> assignedCourses = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "intern_projects", joinColumns = @JoinColumn(name = "intern_id"), inverseJoinColumns = @JoinColumn(name = "project_id"))
    private Set<Project> assignedProjects = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "intern_skills", joinColumns = @JoinColumn(name = "intern_id"))
    @Column(name = "skill")
    private Set<String> extractedSkills = new HashSet<>();

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

    public enum InternStatus {
        DOCUMENT_PENDING,
        DOCUMENT_VERIFICATION,
        DOCUMENT_VERIFIED,
        INTERVIEW_SCHEDULED,
        OFFER_GENERATED,
        ONBOARDING,
        ACTIVE,
        COMPLETED,
        TERMINATED
    }
}
