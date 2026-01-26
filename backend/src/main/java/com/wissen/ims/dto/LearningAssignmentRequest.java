package com.wissen.ims.dto;

import lombok.Data;
import java.util.List;

@Data
public class LearningAssignmentRequest {
    private Long internId;
    private List<Long> courseIds;
    private List<Long> projectIds;
}
