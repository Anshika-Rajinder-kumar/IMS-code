package com.wissen.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectProgressResponse {
    private Long id;
    private Long internId;
    private String internName;
    private Long projectId;
    private String projectTitle;
    private Integer completionPercentage;
    private String description;
    private String challenges;
    private String achievements;
    private String nextSteps;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;
}
