package com.wissen.ims.service;

import com.wissen.ims.model.Candidate;
import com.wissen.ims.model.CandidateHiringRound;
import com.wissen.ims.repository.CandidateHiringRoundRepository;
import com.wissen.ims.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CandidateHiringRoundService {

    @Autowired
    private CandidateHiringRoundRepository candidateHiringRoundRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    public List<CandidateHiringRound> getAllCandidateHiringRounds() {
        return candidateHiringRoundRepository.findAll();
    }

    public CandidateHiringRound getCandidateHiringRoundById(Long id) {
        return candidateHiringRoundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate hiring round not found with id: " + id));
    }

    public List<CandidateHiringRound> getCandidateHiringRoundsByCandidateId(Long candidateId) {
        return candidateHiringRoundRepository.findByCandidateId(candidateId);
    }

    public CandidateHiringRound createCandidateHiringRound(CandidateHiringRound candidateHiringRound) {
        if (candidateHiringRound.getStatus() == null) {
            candidateHiringRound.setStatus(CandidateHiringRound.RoundStatus.PENDING);
        }
        return candidateHiringRoundRepository.save(candidateHiringRound);
    }

    public CandidateHiringRound createOrUpdateCandidateHiringRound(CandidateHiringRound candidateHiringRound) {
        // Fetch the full candidate entity if only ID is provided
        if (candidateHiringRound.getCandidate() != null && candidateHiringRound.getCandidate().getId() != null) {
            Candidate candidate = candidateRepository.findById(candidateHiringRound.getCandidate().getId())
                    .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateHiringRound.getCandidate().getId()));
            candidateHiringRound.setCandidate(candidate);
        }
        
        // Check if a hiring round already exists for this candidate and round name
        if (candidateHiringRound.getCandidate() != null && candidateHiringRound.getRoundName() != null) {
            var existingRound = candidateHiringRoundRepository.findByCandidateIdAndRoundName(
                candidateHiringRound.getCandidate().getId(), 
                candidateHiringRound.getRoundName()
            );
            
            if (existingRound.isPresent()) {
                // Update existing round
                CandidateHiringRound existing = existingRound.get();
                existing.setStatus(candidateHiringRound.getStatus());
                existing.setScore(candidateHiringRound.getScore());
                existing.setFeedback(candidateHiringRound.getFeedback());
                existing.setInterviewer(candidateHiringRound.getInterviewer());
                existing.setScheduledAt(candidateHiringRound.getScheduledAt());
                existing.setCompletedAt(candidateHiringRound.getCompletedAt());
                existing.setDuration(candidateHiringRound.getDuration());
                return candidateHiringRoundRepository.save(existing);
            }
        }
        
        // Create new round if it doesn't exist
        if (candidateHiringRound.getStatus() == null) {
            candidateHiringRound.setStatus(CandidateHiringRound.RoundStatus.PENDING);
        }
        return candidateHiringRoundRepository.save(candidateHiringRound);
    }

    public CandidateHiringRound updateCandidateHiringRound(Long id, CandidateHiringRound hiringRoundDetails) {
        CandidateHiringRound hiringRound = getCandidateHiringRoundById(id);
        
        hiringRound.setRoundName(hiringRoundDetails.getRoundName());
        hiringRound.setStatus(hiringRoundDetails.getStatus());
        hiringRound.setScore(hiringRoundDetails.getScore());
        hiringRound.setFeedback(hiringRoundDetails.getFeedback());
        hiringRound.setInterviewer(hiringRoundDetails.getInterviewer());
        hiringRound.setScheduledAt(hiringRoundDetails.getScheduledAt());
        hiringRound.setCompletedAt(hiringRoundDetails.getCompletedAt());
        hiringRound.setDuration(hiringRoundDetails.getDuration());

        return candidateHiringRoundRepository.save(hiringRound);
    }

    public void deleteCandidateHiringRound(Long id) {
        CandidateHiringRound hiringRound = getCandidateHiringRoundById(id);
        candidateHiringRoundRepository.delete(hiringRound);
    }
}
