package com.wissen.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateCSVDTO {
    private String name;
    private String email;
    private String phone;
    private String branch;
    private String cgpa;
    private Integer graduationYear;
    private String emergencyContact;
    private String address;
    private String resumePath;
    
    // For validation errors
    private int rowNumber;
    private String errorMessage;
    
    public boolean hasError() {
        return errorMessage != null && !errorMessage.isEmpty();
    }
}
