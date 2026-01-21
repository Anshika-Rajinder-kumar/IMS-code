package com.wissen.ims.repository;

import com.wissen.ims.model.College;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {
    List<College> findByStatus(College.VisitStatus status);
    List<College> findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(String name, String location);
}
