package com.wissen.ims.repository;

import com.wissen.ims.model.ProjectProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectProgressRepository extends JpaRepository<ProjectProgress, Long> {
    
    List<ProjectProgress> findByInternId(Long internId);
    
    List<ProjectProgress> findByProjectId(Long projectId);
    
    @Query("SELECT pp FROM ProjectProgress pp WHERE pp.intern.id = :internId AND pp.project.id = :projectId ORDER BY pp.updatedAt DESC")
    Optional<ProjectProgress> findLatestByInternAndProject(Long internId, Long projectId);
    
    @Query("SELECT pp FROM ProjectProgress pp ORDER BY pp.updatedAt DESC")
    List<ProjectProgress> findAllOrderByUpdatedAtDesc();
}
