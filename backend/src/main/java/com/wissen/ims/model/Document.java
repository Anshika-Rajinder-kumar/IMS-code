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
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intern_id", nullable = false)
    private Intern intern;

    @Column(nullable = false)
    private String name;

    @Column(length = 100)
    private String label; // User-friendly label like "Aadhaar Card", "PAN Card"

    @Column(length = 10)
    private String icon; // Emoji icon for UI display

    @Column(length = 500)
    private String description; // Description of the document

    @Column(nullable = false)
    private Boolean required = true; // Whether document is mandatory

    @Column(nullable = false)
    private String type; // PDF, JPG, PNG, DOC, DOCX

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String size;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status = DocumentStatus.PENDING;

    @Column(length = 500)
    private String rejectionReason;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    private LocalDateTime verifiedAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum DocumentStatus {
        PENDING, VERIFIED, REJECTED
    }
}
