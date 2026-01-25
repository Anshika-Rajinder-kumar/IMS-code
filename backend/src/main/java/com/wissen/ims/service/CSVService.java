package com.wissen.ims.service;

import com.wissen.ims.dto.BulkUploadResponse;
import com.wissen.ims.dto.CandidateCSVDTO;
import com.wissen.ims.model.Candidate;
import com.wissen.ims.repository.CandidateRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class CSVService {

    @Autowired
    private CandidateRepository candidateRepository;

    public BulkUploadResponse processCandidateCSV(MultipartFile file, Long collegeId, String collegeName) {
        BulkUploadResponse response = new BulkUploadResponse();
        
        try {
            List<CandidateCSVDTO> candidates = parseCSV(file);
            response.setTotalRows(candidates.size());
            
            int rowNum = 2; // Starting from 2 because row 1 is header
            for (CandidateCSVDTO dto : candidates) {
                try {
                    // Validate required fields
                    if (!validateCandidate(dto, rowNum, response)) {
                        rowNum++;
                        continue;
                    }
                    
                    // Check if candidate already exists
                    if (candidateRepository.findByEmail(dto.getEmail()).isPresent()) {
                        response.addError("Row " + rowNum + ": Email '" + dto.getEmail() + "' already exists");
                        rowNum++;
                        continue;
                    }
                    
                    // Create candidate
                    Candidate candidate = new Candidate();
                    candidate.setName(dto.getName());
                    candidate.setEmail(dto.getEmail());
                    candidate.setPhone(dto.getPhone());
                    candidate.setBranch(dto.getBranch());
                    candidate.setCgpa(dto.getCgpa());
                    candidate.setGraduationYear(dto.getGraduationYear());
                    candidate.setEmergencyContact(dto.getEmergencyContact());
                    candidate.setAddress(dto.getAddress());
                    candidate.setResumeUrl(dto.getResumePath());
                    candidate.setCollegeId(collegeId);
                    candidate.setCollegeName(collegeName);
                    candidate.setStatus(Candidate.CandidateStatus.APPLIED);
                    
                    candidateRepository.save(candidate);
                    response.addSuccess("Row " + rowNum + ": Successfully created candidate " + dto.getName());
                    
                } catch (Exception e) {
                    response.addError("Row " + rowNum + ": " + e.getMessage());
                }
                rowNum++;
            }
            
        } catch (Exception e) {
            response.addError("Failed to process CSV file: " + e.getMessage());
        }
        
        return response;
    }
    
    private List<CandidateCSVDTO> parseCSV(MultipartFile file) throws Exception {
        List<CandidateCSVDTO> candidates = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                    .withFirstRecordAsHeader()
                    .withIgnoreHeaderCase()
                    .withTrim());
            
            for (CSVRecord record : csvParser) {
                CandidateCSVDTO dto = new CandidateCSVDTO();
                dto.setName(record.get("name"));
                dto.setEmail(record.get("email"));
                dto.setPhone(record.get("phone"));
                dto.setBranch(record.get("branch"));
                dto.setCgpa(record.get("cgpa"));
                
                // Optional fields
                try {
                    String gradYear = record.get("graduationYear");
                    if (gradYear != null && !gradYear.trim().isEmpty()) {
                        dto.setGraduationYear(Integer.parseInt(gradYear.trim()));
                    }
                } catch (Exception e) {
                    // Ignore graduation year parsing errors
                }
                
                try {
                    dto.setEmergencyContact(record.get("emergencyContact"));
                } catch (Exception e) {
                    // Optional field
                }
                
                try {
                    dto.setAddress(record.get("address"));
                } catch (Exception e) {
                    // Optional field
                }
                
                try {
                    dto.setResumePath(record.get("resumePath"));
                } catch (Exception e) {
                    // Optional field
                }
                
                candidates.add(dto);
            }
        }
        
        return candidates;
    }
    
    private boolean validateCandidate(CandidateCSVDTO dto, int rowNum, BulkUploadResponse response) {
        List<String> errors = new ArrayList<>();
        
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            errors.add("Name is required");
        }
        
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            errors.add("Email is required");
        } else if (!dto.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            errors.add("Invalid email format");
        }
        
        if (dto.getPhone() == null || dto.getPhone().trim().isEmpty()) {
            errors.add("Phone is required");
        }
        
        if (dto.getBranch() == null || dto.getBranch().trim().isEmpty()) {
            errors.add("Branch is required");
        }
        
        if (dto.getCgpa() == null || dto.getCgpa().trim().isEmpty()) {
            errors.add("CGPA is required");
        } else {
            try {
                double cgpa = Double.parseDouble(dto.getCgpa());
                if (cgpa < 0 || cgpa > 10) {
                    errors.add("CGPA must be between 0 and 10");
                }
            } catch (NumberFormatException e) {
                errors.add("Invalid CGPA format");
            }
        }
        
        if (!errors.isEmpty()) {
            response.addError("Row " + rowNum + ": " + String.join(", ", errors));
            return false;
        }
        
        return true;
    }
}
