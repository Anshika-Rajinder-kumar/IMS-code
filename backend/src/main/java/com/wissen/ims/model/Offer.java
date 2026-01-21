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
@Table(name = "offers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "intern_id", nullable = false)
    private Intern intern;

    @Column(nullable = false)
    private String position;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer stipend;

    @Column(nullable = false)
    private String duration;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private String location;

    private String reportingManager;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkMode workMode = WorkMode.HYBRID;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferStatus status = OfferStatus.GENERATED;

    @Column(name = "generated_by")
    private Long generatedBy;

    private LocalDateTime sentAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum WorkMode {
        ONSITE, REMOTE, HYBRID
    }

    public enum OfferStatus {
        GENERATED, SENT, ACCEPTED, REJECTED, EXPIRED
    }
}
