package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.model.Document;
import com.wissen.ims.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Document>>> getAllDocuments() {
        List<Document> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Document>> getDocumentById(@PathVariable Long id) {
        try {
            Document document = documentService.getDocumentById(id);
            return ResponseEntity.ok(ApiResponse.success(document));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/intern/{internId}")
    public ResponseEntity<ApiResponse<List<Document>>> getDocumentsByInternId(@PathVariable Long internId) {
        List<Document> documents = documentService.getDocumentsByInternId(internId);
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Document>>> getDocumentsByStatus(@PathVariable String status) {
        try {
            Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
            List<Document> documents = documentService.getDocumentsByStatus(docStatus);
            return ResponseEntity.ok(ApiResponse.success(documents));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status"));
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Document>> uploadDocument(
            @RequestParam Long internId,
            @RequestParam String name,
            @RequestParam String type,
            @RequestParam("file") MultipartFile file) {
        try {
            Document document = documentService.uploadDocument(internId, name, type, file);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(document));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<Document>> verifyDocument(
            @PathVariable Long id,
            @RequestParam String verifiedBy) {
        try {
            Document document = documentService.verifyDocument(id, verifiedBy);
            return ResponseEntity.ok(ApiResponse.success(document));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Document>> rejectDocument(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestParam String verifiedBy) {
        try {
            Document document = documentService.rejectDocument(id, reason, verifiedBy);
            return ResponseEntity.ok(ApiResponse.success(document));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        try {
            Document document = documentService.getDocumentById(id);
            Path filePath = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + document.getName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
