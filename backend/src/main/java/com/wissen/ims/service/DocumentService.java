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

    public Document uploadDocument(Long internId, String name, String type, MultipartFile file) throws IOException {
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

        // Create document record
        Document document = new Document();
        document.setIntern(intern);
        document.setName(name);
        document.setType(type);
        document.setFilePath(filePath.toString());
        document.setSize(String.valueOf(file.getSize()));
        document.setStatus(Document.DocumentStatus.PENDING);

        return documentRepository.save(document);
    }

    public Document verifyDocument(Long id, String verifiedBy) {
        Document document = getDocumentById(id);
        document.setStatus(Document.DocumentStatus.VERIFIED);
        document.setVerifiedBy(verifiedBy);
        document.setVerifiedAt(LocalDateTime.now());
        return documentRepository.save(document);
    }

    public Document rejectDocument(Long id, String reason, String verifiedBy) {
        Document document = getDocumentById(id);
        document.setStatus(Document.DocumentStatus.REJECTED);
        document.setRejectionReason(reason);
        document.setVerifiedBy(verifiedBy);
        document.setVerifiedAt(LocalDateTime.now());
        return documentRepository.save(document);
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
}
