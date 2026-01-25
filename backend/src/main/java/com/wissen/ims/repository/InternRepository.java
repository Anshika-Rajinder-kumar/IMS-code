package com.wissen.ims.repository;

import com.wissen.ims.model.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternRepository extends JpaRepository<Intern, Long> {
    List<Intern> findByStatus(Intern.InternStatus status);
    List<Intern> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCollegeNameContainingIgnoreCase(
            String name, String email, String collegeName);
    Boolean existsByEmail(String email);
    Optional<Intern> findByEmail(String email);
}
