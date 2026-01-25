package com.wissen.ims.service;

import com.wissen.ims.model.HiringRound;
import com.wissen.ims.model.Intern;
import com.wissen.ims.repository.HiringRoundRepository;
import com.wissen.ims.repository.InternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HiringRoundService {

    @Autowired
    private HiringRoundRepository hiringRoundRepository;

    @Autowired
    private InternRepository internRepository;

    public List<HiringRound> getAllHiringRounds() {
        return hiringRoundRepository.findAll();
    }

    public HiringRound getHiringRoundById(Long id) {
        return hiringRoundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hiring round not found with id: " + id));
    }

    public List<HiringRound> getHiringRoundsByInternId(Long internId) {
        return hiringRoundRepository.findByInternId(internId);
    }

    public List<HiringRound> getHiringRoundsByStatus(HiringRound.RoundStatus status) {
        return hiringRoundRepository.findByStatus(status);
    }

    public HiringRound createHiringRound(HiringRound hiringRound) {
        if (hiringRound.getStatus() == null) {
            hiringRound.setStatus(HiringRound.RoundStatus.PENDING);
        }
        return hiringRoundRepository.save(hiringRound);
    }

    public HiringRound createOrUpdateHiringRound(HiringRound hiringRound) {
        // Check if a hiring round already exists for this intern and round name
        if (hiringRound.getIntern() != null && hiringRound.getRoundName() != null) {
            var existingRound = hiringRoundRepository.findByInternIdAndRoundName(
                hiringRound.getIntern().getId(), 
                hiringRound.getRoundName()
            );
            
            if (existingRound.isPresent()) {
                // Update existing round
                HiringRound existing = existingRound.get();
                existing.setStatus(hiringRound.getStatus());
                existing.setScore(hiringRound.getScore());
                existing.setFeedback(hiringRound.getFeedback());
                existing.setInterviewer(hiringRound.getInterviewer());
                existing.setScheduledAt(hiringRound.getScheduledAt());
                existing.setCompletedAt(hiringRound.getCompletedAt());
                existing.setDuration(hiringRound.getDuration());
                return hiringRoundRepository.save(existing);
            }
        }
        
        // Create new round if it doesn't exist
        if (hiringRound.getStatus() == null) {
            hiringRound.setStatus(HiringRound.RoundStatus.PENDING);
        }
        return hiringRoundRepository.save(hiringRound);
    }

    public HiringRound updateHiringRound(Long id, HiringRound hiringRoundDetails) {
        HiringRound hiringRound = getHiringRoundById(id);
        
        hiringRound.setRoundName(hiringRoundDetails.getRoundName());
        hiringRound.setStatus(hiringRoundDetails.getStatus());
        hiringRound.setScore(hiringRoundDetails.getScore());
        hiringRound.setFeedback(hiringRoundDetails.getFeedback());
        hiringRound.setInterviewer(hiringRoundDetails.getInterviewer());
        hiringRound.setScheduledAt(hiringRoundDetails.getScheduledAt());
        hiringRound.setCompletedAt(hiringRoundDetails.getCompletedAt());
        hiringRound.setDuration(hiringRoundDetails.getDuration());

        return hiringRoundRepository.save(hiringRound);
    }

    public HiringRound updateRoundStatus(Long id, HiringRound.RoundStatus status) {
        HiringRound hiringRound = getHiringRoundById(id);
        hiringRound.setStatus(status);
        
        if (status == HiringRound.RoundStatus.CLEARED || 
            status == HiringRound.RoundStatus.REJECTED) {
            hiringRound.setCompletedAt(LocalDateTime.now());
        }
        
        return hiringRoundRepository.save(hiringRound);
    }

    public void deleteHiringRound(Long id) {
        HiringRound hiringRound = getHiringRoundById(id);
        hiringRoundRepository.delete(hiringRound);
    }

    public long countByStatus(HiringRound.RoundStatus status) {
        return hiringRoundRepository.findByStatus(status).size();
    }
}
