package com.wissen.ims.service;

import com.wissen.ims.model.Intern;
import com.wissen.ims.model.LearningCourse;
import com.wissen.ims.model.Project;
import com.wissen.ims.repository.InternRepository;
import com.wissen.ims.repository.LearningCourseRepository;
import com.wissen.ims.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AutomatedAssignmentService {

    @Autowired
    private ResumeParsingService resumeParsingService;

    @Autowired
    private SkillExtractionService skillExtractionService;

    @Autowired
    private SkillAnalysisService skillAnalysisService;

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private LearningCourseRepository learningCourseRepository;

    @Transactional
    public AssignmentResult processInternResume(Long internId, MultipartFile file) throws IOException {
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found"));

        if (intern.getStatus() != Intern.InternStatus.ACTIVE) {
            throw new RuntimeException("Assignments can only be performed for active interns");
        }

        // 1. Extract Text
        String text = resumeParsingService.extractText(file);

        // 2. Extract Skills
        Set<String> skills = skillExtractionService.extractSkills(text);
        intern.getExtractedSkills().clear(); // Reset to current resume profile
        intern.getExtractedSkills().addAll(skills);
        internRepository.save(intern);

        // 3. Perform Analysis & Initial Assignment
        AssignmentResult result = performAnalysis(intern);

        // Apply initial best-guess assignments to the intern
        if (result.getAssignedProject() != null) {
            intern.getAssignedProjects().clear();
            intern.getAssignedProjects().add(result.getAssignedProject());
        }
        if (!result.getRecommendedCourses().isEmpty()) {
            intern.getAssignedCourses().clear();
            intern.getAssignedCourses().addAll(new HashSet<>(result.getRecommendedCourses().subList(0, Math.min(2, result.getRecommendedCourses().size()))));
        }

        internRepository.save(intern);
        return result;
    }

    public AssignmentResult getExistingAnalysis(Long internId) {
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found"));

        if (intern.getExtractedSkills().isEmpty()) {
            return null; // Never processed
        }

        return performAnalysis(intern);
    }

    private AssignmentResult performAnalysis(Intern intern) {
        // Find Best Project Match
        List<Project> allProjects = projectRepository.findAll();
        Project bestMatchProject = null;
        double highestMatch = -1;
        int maxRequiredSkills = -1;
        SkillAnalysisService.SkillGapReport bestReport = null;

        for (Project project : allProjects) {
            SkillAnalysisService.SkillGapReport report = skillAnalysisService.analyzeGap(intern, project);
            
            if (report.getMatchPercentage() > highestMatch || 
               (report.getMatchPercentage() == highestMatch && project.getRequiredSkills().size() > maxRequiredSkills)) {
                
                highestMatch = report.getMatchPercentage();
                maxRequiredSkills = project.getRequiredSkills().size();
                bestMatchProject = project;
                bestReport = report;
            }
        }

        // Recommend Courses for Missing Skills
        List<LearningCourse> recommendedCourses = new ArrayList<>();
        if (bestReport != null && !bestReport.getMissingSkills().isEmpty()) {
            List<LearningCourse> allCourses = learningCourseRepository.findAll();
            recommendedCourses = skillAnalysisService.recommendCourses(bestReport.getMissingSkills(), allCourses);
        }

        return new AssignmentResult(intern.getExtractedSkills(), bestReport, recommendedCourses, bestMatchProject);
    }

    public static class AssignmentResult {
        private Set<String> extractedSkills;
        private SkillAnalysisService.SkillGapReport gapReport;
        private List<LearningCourse> recommendedCourses;
        private Project assignedProject;

        public AssignmentResult(Set<String> extractedSkills, SkillAnalysisService.SkillGapReport gapReport, 
                               List<LearningCourse> recommendedCourses, Project assignedProject) {
            this.extractedSkills = extractedSkills;
            this.gapReport = gapReport;
            this.recommendedCourses = recommendedCourses;
            this.assignedProject = assignedProject;
        }

        // Getters
        public Set<String> getExtractedSkills() { return extractedSkills; }
        public SkillAnalysisService.SkillGapReport getGapReport() { return gapReport; }
        public List<LearningCourse> getRecommendedCourses() { return recommendedCourses; }
        public Project getAssignedProject() { return assignedProject; }
    }
}
