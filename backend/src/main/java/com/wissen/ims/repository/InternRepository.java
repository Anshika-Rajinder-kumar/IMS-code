package com.wissen.ims.repository;

import com.wissen.ims.model.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternRepository extends JpaRepository<Intern, Long> {
    List<Intern> findByStatus(Intern.InternStatus status);

    List<Intern> findByStatusAndNameContainingIgnoreCaseOrStatusAndEmailContainingIgnoreCaseOrStatusAndCollegeNameContainingIgnoreCase(
            Intern.InternStatus status1, String name,
            Intern.InternStatus status2, String email,
            Intern.InternStatus status3, String collegeName);

    List<Intern> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCollegeNameContainingIgnoreCase(
            String name, String email, String collegeName);

    Optional<Intern> findByEmail(String email);

    Boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(i) FROM Intern i JOIN i.assignedCourses c WHERE c.id = :courseId")
    long countInternsByCourseId(Long courseId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(i) FROM Intern i JOIN i.assignedProjects p WHERE p.id = :projectId")
    long countInternsByProjectId(Long projectId);
}
