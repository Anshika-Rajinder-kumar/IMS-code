package com.wissen.ims.repository;

import com.wissen.ims.model.Document;
import com.wissen.ims.model.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByIntern(Intern intern);
    List<Document> findByInternId(Long internId);
    List<Document> findByStatus(Document.DocumentStatus status);
    Long countByInternAndStatus(Intern intern, Document.DocumentStatus status);
}
