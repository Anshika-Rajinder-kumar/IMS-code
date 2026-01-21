package com.wissen.ims.service;

import com.wissen.ims.model.College;
import com.wissen.ims.repository.CollegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CollegeService {

    @Autowired
    private CollegeRepository collegeRepository;

    public List<College> getAllColleges() {
        return collegeRepository.findAll();
    }

    public College getCollegeById(Long id) {
        return collegeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("College not found with id: " + id));
    }

    public List<College> getCollegesByStatus(College.VisitStatus status) {
        return collegeRepository.findByStatus(status);
    }

    public List<College> searchColleges(String searchTerm) {
        return collegeRepository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(searchTerm, searchTerm);
    }

    public College createCollege(College college) {
        return collegeRepository.save(college);
    }

    public College updateCollege(Long id, College collegeDetails) {
        College college = getCollegeById(id);
        
        college.setName(collegeDetails.getName());
        college.setLocation(collegeDetails.getLocation());
        college.setCoordinator(collegeDetails.getCoordinator());
        college.setEmail(collegeDetails.getEmail());
        college.setPhone(collegeDetails.getPhone());
        college.setVisitDate(collegeDetails.getVisitDate());
        college.setSlots(collegeDetails.getSlots());
        college.setStatus(collegeDetails.getStatus());
        college.setNotes(collegeDetails.getNotes());

        return collegeRepository.save(college);
    }

    public void deleteCollege(Long id) {
        College college = getCollegeById(id);
        collegeRepository.delete(college);
    }
}
