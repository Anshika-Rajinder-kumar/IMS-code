package com.wissen.ims.service;

import com.wissen.ims.model.Intern;
import com.wissen.ims.model.LearningCourse;
import com.wissen.ims.model.Project;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SkillAnalysisService {

    public SkillGapReport analyzeGap(Intern intern, Project project) {
        Set<String> internSkills = intern.getExtractedSkills();
        Set<String> requiredSkills = project.getRequiredSkills();

        Set<String> matchingSkills = new HashSet<>(internSkills);
        matchingSkills.retainAll(requiredSkills);

        Set<String> missingSkills = new HashSet<>(requiredSkills);
        missingSkills.removeAll(internSkills);

        double matchPercentage = requiredSkills.isEmpty() ? 100.0 : 
                                 (double) matchingSkills.size() / requiredSkills.size() * 100;

        return new SkillGapReport(project.getTitle(), matchingSkills, missingSkills, matchPercentage);
    }

    public List<LearningCourse> recommendCourses(Set<String> missingSkills, List<LearningCourse> availableCourses) {
        return availableCourses.stream()
            .filter(course -> {
                Set<String> taught = course.getTaughtSkills();
                return taught.stream().anyMatch(missingSkills::contains);
            })
            .collect(Collectors.toList());
    }

    public static class SkillGapReport {
        private String projectTitle;
        private Set<String> matchingSkills;
        private Set<String> missingSkills;
        private double matchPercentage;

        public SkillGapReport(String projectTitle, Set<String> matchingSkills, Set<String> missingSkills, double matchPercentage) {
            this.projectTitle = projectTitle;
            this.matchingSkills = matchingSkills;
            this.missingSkills = missingSkills;
            this.matchPercentage = matchPercentage;
        }

        // Getters
        public String getProjectTitle() { return projectTitle; }
        public Set<String> getMatchingSkills() { return matchingSkills; }
        public Set<String> getMissingSkills() { return missingSkills; }
        public double getMatchPercentage() { return matchPercentage; }
    }
}
