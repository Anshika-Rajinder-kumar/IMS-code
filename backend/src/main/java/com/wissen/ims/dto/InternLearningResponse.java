package com.wissen.ims.dto;

import com.wissen.ims.model.LearningCourse;
import com.wissen.ims.model.Project;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class InternLearningResponse {
    private Set<LearningCourse> courses;
    private Set<Project> projects;
}
