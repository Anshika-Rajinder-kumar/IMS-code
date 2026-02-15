package com.wissen.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectProgressRequest {
    private Long internId;
    private Long projectId;
    private Integer completionPercentage;
    private LocalDate logDate;
    private String description;
    private String achievements;
    private String challenges;
    private String nextSteps;
}
