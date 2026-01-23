package com.wissen.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private Long id;
    private Long internId;
    private String name;
    private String label;
    private String icon;
    private String description;
    private Boolean required;
    private String type;
    private String size;
    private String status;
    private String rejectionReason;
    private String verifiedBy;
    private LocalDateTime verifiedAt;
    private LocalDateTime uploadedAt;
    private Boolean uploaded;
    
    // For frontend display
    private FileInfo file;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileInfo {
        private String name;
        private String type;
        private String size;
        private String uploadedAt;
    }
}
