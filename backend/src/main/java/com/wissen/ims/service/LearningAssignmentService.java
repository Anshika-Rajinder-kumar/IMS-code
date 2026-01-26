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

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class LearningAssignmentService {

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private LearningCourseRepository courseRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public Intern assignLearning(Long internId, List<Long> courseIds, List<Long> projectIds) {
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found"));

        if (intern.getStatus() != Intern.InternStatus.ACTIVE) {
            throw new RuntimeException("Learning can only be assigned to ACTIVE interns");
        }

        Set<LearningCourse> courses = new HashSet<>(courseRepository.findAllById(courseIds));
        Set<Project> projects = new HashSet<>(projectRepository.findAllById(projectIds));

        intern.setAssignedCourses(courses);
        intern.setAssignedProjects(projects);

        return internRepository.save(intern);
    }

    public List<Intern> getActiveInterns(String searchTerm) {
        if (searchTerm == null || searchTerm.isEmpty()) {
            return internRepository.findByStatus(Intern.InternStatus.ACTIVE);
        }
        return internRepository
                .findByStatusAndNameContainingIgnoreCaseOrStatusAndEmailContainingIgnoreCaseOrStatusAndCollegeNameContainingIgnoreCase(
                        Intern.InternStatus.ACTIVE, searchTerm,
                        Intern.InternStatus.ACTIVE, searchTerm,
                        Intern.InternStatus.ACTIVE, searchTerm);
    }

    public List<LearningCourse> getAllCourses() {
        return courseRepository.findAll();
    }

    public LearningCourse createCourse(LearningCourse course) {
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        if (internRepository.countInternsByCourseId(id) > 0) {
            throw new RuntimeException("Cannot delete course: It is already assigned to one or more interns.");
        }
        courseRepository.deleteById(id);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        if (internRepository.countInternsByProjectId(id) > 0) {
            throw new RuntimeException("Cannot delete project: It is already assigned to one or more interns.");
        }
        projectRepository.deleteById(id);
    }
}
