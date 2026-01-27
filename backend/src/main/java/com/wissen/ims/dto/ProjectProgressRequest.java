package com.wissen.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectProgressRequest {
    private Long internId;
    private Long projectId;
    private Integer completionPercentage; // 0-100
    private String description;
    private String challenges;
    private String achievements;
    private String nextSteps;
}
