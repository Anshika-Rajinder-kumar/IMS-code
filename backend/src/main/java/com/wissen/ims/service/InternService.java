package com.wissen.ims.service;

import com.wissen.ims.model.Intern;
import com.wissen.ims.repository.InternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class InternService {

    @Autowired
    private InternRepository internRepository;

    public List<Intern> getAllInterns() {
        return internRepository.findAll();
    }

    public Intern getInternById(Long id) {
        return internRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intern not found with id: " + id));
    }

    public List<Intern> getInternsByStatus(Intern.InternStatus status) {
        return internRepository.findByStatus(status);
    }

    public List<Intern> searchInterns(String searchTerm) {
        return internRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCollegeNameContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm);
    }

    public Intern createIntern(Intern intern) {
        if (internRepository.existsByEmail(intern.getEmail())) {
            throw new RuntimeException("Intern with this email already exists");
        }
        
        return internRepository.save(intern);
    }

    public Intern updateIntern(Long id, Intern internDetails) {
        Intern intern = getInternById(id);
        
        intern.setName(internDetails.getName());
        intern.setEmail(internDetails.getEmail());
        intern.setPhone(internDetails.getPhone());
        intern.setEmergencyContact(internDetails.getEmergencyContact());
        intern.setCollege(internDetails.getCollege());
        intern.setCollegeName(internDetails.getCollegeName());
        intern.setBranch(internDetails.getBranch());
        intern.setCgpa(internDetails.getCgpa());
        intern.setJoinDate(internDetails.getJoinDate());
        intern.setAddress(internDetails.getAddress());
        intern.setStatus(internDetails.getStatus());

        return internRepository.save(intern);
    }

    public Intern updateInternStatus(Long id, Intern.InternStatus status) {
        Intern intern = getInternById(id);
        intern.setStatus(status);
        return internRepository.save(intern);
    }

    public void deleteIntern(Long id) {
        Intern intern = getInternById(id);
        internRepository.delete(intern);
    }

    public long countByStatus(Intern.InternStatus status) {
        return internRepository.findByStatus(status).size();
    }
}
