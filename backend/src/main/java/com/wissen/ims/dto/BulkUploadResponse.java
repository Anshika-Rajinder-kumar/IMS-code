package com.wissen.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadResponse {
    private int totalRows;
    private int successCount;
    private int failureCount;
    private List<String> errors = new ArrayList<>();
    private List<String> successMessages = new ArrayList<>();
    
    public void addError(String error) {
        errors.add(error);
        failureCount++;
    }
    
    public void addSuccess(String message) {
        successMessages.add(message);
        successCount++;
    }
}
