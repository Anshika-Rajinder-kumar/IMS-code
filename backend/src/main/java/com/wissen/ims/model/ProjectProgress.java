package com.wissen.ims.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "intern_id", "project_id", "log_date" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ProjectProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intern_id", nullable = false)
    private Intern intern;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private Integer completionPercentage; // 0-100

    @Column(nullable = false)
    private LocalDate logDate;

    @Column(length = 2000)
    private String description; // General description

    @Column(length = 1000)
    private String achievements;

    @Column(length = 1000)
    private String challenges;

    @Column(length = 1000)
    private String nextSteps;

    @Column(length = 500)
    private String adminComment; // Review comment from admin (10-40 words)

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
