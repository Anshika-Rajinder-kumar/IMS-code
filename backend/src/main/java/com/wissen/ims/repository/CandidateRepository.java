package com.wissen.ims.repository;

import com.wissen.ims.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    
    Optional<Candidate> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<Candidate> findByStatus(Candidate.CandidateStatus status);
    
    List<Candidate> findByCollegeId(Long collegeId);
    
    List<Candidate> findByCollegeName(String collegeName);
    
    List<Candidate> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCollegeNameContainingIgnoreCase(
            String name, String email, String collegeName);
}
