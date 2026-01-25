package com.wissen.ims.repository;

import com.wissen.ims.model.Candidate;
import com.wissen.ims.model.CandidateHiringRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateHiringRoundRepository extends JpaRepository<CandidateHiringRound, Long> {
    List<CandidateHiringRound> findByCandidate(Candidate candidate);
    List<CandidateHiringRound> findByCandidateId(Long candidateId);
    List<CandidateHiringRound> findByStatus(CandidateHiringRound.RoundStatus status);
    Optional<CandidateHiringRound> findByCandidateIdAndRoundName(Long candidateId, String roundName);
}
