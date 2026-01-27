package com.wissen.ims.service;

import com.wissen.ims.dto.ProjectProgressRequest;
import com.wissen.ims.dto.ProjectProgressResponse;
import com.wissen.ims.model.Intern;
import com.wissen.ims.model.Project;
import com.wissen.ims.model.ProjectProgress;
import com.wissen.ims.repository.InternRepository;
import com.wissen.ims.repository.ProjectProgressRepository;
import com.wissen.ims.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectProgressService {

    @Autowired
    private ProjectProgressRepository progressRepository;

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Transactional
    public ProjectProgressResponse createOrUpdateProgress(ProjectProgressRequest request) {
        Intern intern = internRepository.findById(request.getInternId())
                .orElseThrow(() -> new RuntimeException("Intern not found"));
        
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Check if progress already exists for this intern-project combination
        ProjectProgress progress = progressRepository
                .findLatestByInternAndProject(request.getInternId(), request.getProjectId())
                .orElse(new ProjectProgress());

        progress.setIntern(intern);
        progress.setProject(project);
        progress.setCompletionPercentage(request.getCompletionPercentage());
        progress.setDescription(request.getDescription());
        progress.setChallenges(request.getChallenges());
        progress.setAchievements(request.getAchievements());
        progress.setNextSteps(request.getNextSteps());

        progress = progressRepository.save(progress);

        return mapToResponse(progress);
    }

    public List<ProjectProgressResponse> getProgressByIntern(Long internId) {
        return progressRepository.findByInternId(internId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProjectProgressResponse> getAllProgress() {
        return progressRepository.findAllOrderByUpdatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProjectProgressResponse getProgressById(Long id) {
        ProjectProgress progress = progressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Progress record not found"));
        return mapToResponse(progress);
    }

    private ProjectProgressResponse mapToResponse(ProjectProgress progress) {
        return ProjectProgressResponse.builder()
                .id(progress.getId())
                .internId(progress.getIntern().getId())
                .internName(progress.getIntern().getName())
                .projectId(progress.getProject().getId())
                .projectTitle(progress.getProject().getTitle())
                .completionPercentage(progress.getCompletionPercentage())
                .description(progress.getDescription())
                .challenges(progress.getChallenges())
                .achievements(progress.getAchievements())
                .nextSteps(progress.getNextSteps())
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }
}
