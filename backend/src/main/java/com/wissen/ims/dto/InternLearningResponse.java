package com.wissen.ims.dto;

import com.wissen.ims.model.LearningCourse;
import com.wissen.ims.model.Project;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
public class InternLearningResponse {
    private Long internId;
    private String internName;
    private String internEmail;
    private LocalDate joinDate;
    private Set<LearningCourse> courses;
    private Set<Project> projects;
}
