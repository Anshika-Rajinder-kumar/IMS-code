package com.wissen.ims.service;

import com.wissen.ims.model.Document;
import com.wissen.ims.model.Intern;
import com.wissen.ims.repository.DocumentRepository;
import com.wissen.ims.repository.InternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private InternRepository internRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
    }

    public List<Document> getDocumentsByInternId(Long internId) {
        return documentRepository.findByInternId(internId);
    }

    public List<Document> getDocumentsByStatus(Document.DocumentStatus status) {
        return documentRepository.findByStatus(status);
    }

    public Document uploadDocument(Long internId, String name, String label, String icon, 
                                   String description, String type, MultipartFile file) throws IOException {
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found with id: " + internId));

        // Create upload directory if it doesn't exist
        File uploadDirectory = new File(uploadDir);
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = Paths.get(uploadDir, filename);
        Files.write(filePath, file.getBytes());

        // Format file size
        String formattedSize = formatFileSize(file.getSize());

        // Create document record
        Document document = new Document();
        document.setIntern(intern);
        document.setName(name);
        document.setLabel(label != null ? label : name);
        document.setIcon(icon != null ? icon : "📄");
        document.setDescription(description != null ? description : "Document uploaded by intern");
        document.setRequired(true);
        document.setType(type);
        document.setFilePath(filePath.toString());
        document.setSize(formattedSize);
        document.setStatus(Document.DocumentStatus.PENDING);

        Document savedDocument = documentRepository.save(document);
        
        // Update intern status to DOCUMENT_VERIFICATION if all required docs are uploaded
        updateInternDocumentStatus(internId);
        
        return savedDocument;
    }

    // Helper method to format file size
    private String formatFileSize(long size) {
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.2f KB", size / 1024.0);
        } else {
            return String.format("%.2f MB", size / (1024.0 * 1024.0));
        }
    }

    public Document verifyDocument(Long id, String verifiedBy) {
        Document document = getDocumentById(id);
        document.setStatus(Document.DocumentStatus.VERIFIED);
        document.setVerifiedBy(verifiedBy);
        document.setVerifiedAt(LocalDateTime.now());
        Document savedDocument = documentRepository.save(document);
        
        // Update intern status if all documents are verified
        updateInternDocumentStatus(document.getIntern().getId());
        
        return savedDocument;
    }

    public Document rejectDocument(Long id, String reason, String verifiedBy) {
        Document document = getDocumentById(id);
        document.setStatus(Document.DocumentStatus.REJECTED);
        document.setRejectionReason(reason);
        document.setVerifiedBy(verifiedBy);
        document.setVerifiedAt(LocalDateTime.now());
        Document savedDocument = documentRepository.save(document);
        
        // Update intern status back to DOCUMENT_PENDING if any doc is rejected
        Intern intern = document.getIntern();
        if (intern.getStatus() == Intern.InternStatus.DOCUMENT_VERIFICATION || 
            intern.getStatus() == Intern.InternStatus.DOCUMENT_VERIFIED) {
            intern.setStatus(Intern.InternStatus.DOCUMENT_PENDING);
            internRepository.save(intern);
        }
        
        return savedDocument;
    }

    public void deleteDocument(Long id) {
        Document document = getDocumentById(id);
        
        // Delete physical file
        try {
            Path filePath = Paths.get(document.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + e.getMessage());
        }

        documentRepository.delete(document);
    }

    public long countByInternAndStatus(Long internId, Document.DocumentStatus status) {
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found"));
        return documentRepository.countByInternAndStatus(intern, status);
    }

    /**
     * Update intern status based on document upload/verification status
     * - DOCUMENT_PENDING: No documents or some rejected
     * - DOCUMENT_VERIFICATION: All required docs uploaded, waiting for admin verification
     * - DOCUMENT_VERIFIED: All required docs verified by admin
     */
    private void updateInternDocumentStatus(Long internId) {
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found"));
        
        List<Document> documents = documentRepository.findByInternId(internId);
        
        // Required document types
        List<String> requiredDocs = List.of("AADHAAR", "PAN", "CLASS_10", "CLASS_12", "DEGREE", "PHOTO", "BANK_PASSBOOK");
        
        // Check if all required documents are uploaded
        long uploadedCount = documents.stream()
                .filter(doc -> requiredDocs.contains(doc.getName()))
                .count();
        
        // Check if any document is rejected
        boolean hasRejected = documents.stream()
                .anyMatch(doc -> doc.getStatus() == Document.DocumentStatus.REJECTED);
        
        // Check if all required documents are verified
        long verifiedCount = documents.stream()
                .filter(doc -> requiredDocs.contains(doc.getName()))
                .filter(doc -> doc.getStatus() == Document.DocumentStatus.VERIFIED)
                .count();
        
        // Update intern status based on document state
        if (hasRejected) {
            // If any document is rejected, go back to DOCUMENT_PENDING
            intern.setStatus(Intern.InternStatus.DOCUMENT_PENDING);
        } else if (verifiedCount == requiredDocs.size()) {
            // All required documents verified
            intern.setStatus(Intern.InternStatus.DOCUMENT_VERIFIED);
        } else if (uploadedCount == requiredDocs.size()) {
            // All required documents uploaded, waiting for verification
            intern.setStatus(Intern.InternStatus.DOCUMENT_VERIFICATION);
        } else {
            // Still uploading documents
            intern.setStatus(Intern.InternStatus.DOCUMENT_PENDING);
        }
        
        internRepository.save(intern);
    }
}
