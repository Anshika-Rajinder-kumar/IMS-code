package com.wissen.ims.repository;

import com.wissen.ims.model.HiringRound;
import com.wissen.ims.model.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HiringRoundRepository extends JpaRepository<HiringRound, Long> {
    List<HiringRound> findByIntern(Intern intern);
    List<HiringRound> findByInternId(Long internId);
    List<HiringRound> findByStatus(HiringRound.RoundStatus status);
    List<HiringRound> findByInternAndStatus(Intern intern, HiringRound.RoundStatus status);
}
