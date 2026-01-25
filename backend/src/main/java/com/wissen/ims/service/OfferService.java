package com.wissen.ims.service;

import com.wissen.ims.model.Intern;
import com.wissen.ims.model.Offer;
import com.wissen.ims.repository.InternRepository;
import com.wissen.ims.repository.OfferRepository;
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
public class OfferService {

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private EmailService emailService;
    
    @Value("${file.upload-dir}")
    private String uploadDir;

    public List<Offer> getAllOffers() {
        return offerRepository.findAll();
    }

    public Offer getOfferById(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found with id: " + id));
    }

    public List<Offer> getOffersByStatus(Offer.OfferStatus status) {
        return offerRepository.findByStatus(status);
    }

    public List<Offer> getOffersByInternId(Long internId) {
        return offerRepository.findByInternId(internId);
    }

    public Offer createOffer(Offer offer) {
        if (offer.getStatus() == null) {
            offer.setStatus(Offer.OfferStatus.GENERATED);
        }
        return offerRepository.save(offer);
    }

    public Offer updateOffer(Long id, Offer offerDetails) {
        Offer offer = getOfferById(id);
        
        offer.setPosition(offerDetails.getPosition());
        offer.setDepartment(offerDetails.getDepartment());
        offer.setStipend(offerDetails.getStipend());
        offer.setDuration(offerDetails.getDuration());
        offer.setStartDate(offerDetails.getStartDate());
        offer.setLocation(offerDetails.getLocation());
        offer.setReportingManager(offerDetails.getReportingManager());
        offer.setWorkMode(offerDetails.getWorkMode());
        offer.setStatus(offerDetails.getStatus());
        offer.setGeneratedBy(offerDetails.getGeneratedBy());

        return offerRepository.save(offer);
    }

    public Offer sendOffer(Long id) {
        Offer offer = getOfferById(id);
        
        // Get intern details
        Intern intern = internRepository.findById(offer.getIntern().getId())
                .orElseThrow(() -> new RuntimeException("Intern not found"));
        
        // Update offer status
        offer.setStatus(Offer.OfferStatus.SENT);
        offer.setSentAt(LocalDateTime.now());
        Offer savedOffer = offerRepository.save(offer);
        
        // Send email with offer letter
        try {
            emailService.sendOfferLetter(intern, savedOffer);
            System.out.println("✅ Offer letter email sent successfully to: " + intern.getEmail());
        } catch (Exception e) {
            System.err.println("❌ FAILED to send offer email to " + intern.getEmail());
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            // Don't fail the operation if email fails - offer status is still updated
        }
        
        return savedOffer;
    }

    public Offer acceptOffer(Long id, MultipartFile signedOfferFile) throws IOException {
        Offer offer = getOfferById(id);
        
        if (signedOfferFile != null && !signedOfferFile.isEmpty()) {
            // Create upload directory if it doesn't exist
            File uploadDirectory = new File(uploadDir);
            if (!uploadDirectory.exists()) {
                uploadDirectory.mkdirs();
            }

            // Generate unique filename for signed offer
            String originalFilename = signedOfferFile.getOriginalFilename();
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".pdf";
            String filename = "signed_offer_" + offer.getId() + "_" + UUID.randomUUID().toString() + extension;
            
            // Save file
            Path filePath = Paths.get(uploadDir, filename);
            Files.write(filePath, signedOfferFile.getBytes());
            
            offer.setSignedOfferPath(filePath.toString());
        }
        
        offer.setStatus(Offer.OfferStatus.ACCEPTED);
        offer.setAcceptedAt(LocalDateTime.now());
        
        // Update intern status to ACTIVE
        Intern intern = offer.getIntern();
        if (intern != null) {
            intern.setStatus(Intern.InternStatus.ACTIVE);
            internRepository.save(intern);
        }
        
        return offerRepository.save(offer);
    }

    public Offer rejectOffer(Long id) {
        Offer offer = getOfferById(id);
        offer.setStatus(Offer.OfferStatus.REJECTED);
        return offerRepository.save(offer);
    }

    public void deleteOffer(Long id) {
        Offer offer = getOfferById(id);
        offerRepository.delete(offer);
    }

    public long countByStatus(Offer.OfferStatus status) {
        return offerRepository.findByStatus(status).size();
    }
    
    public byte[] downloadOfferLetter(Long offerId) {
        Offer offer = getOfferById(offerId);
        Intern intern = offer.getIntern();
        
        // Generate offer letter PDF
        return generateOfferLetterPDF(intern, offer);
    }
    
    private byte[] generateOfferLetterPDF(Intern intern, Offer offer) {
        // Simple text-based PDF generation
        String offerDate = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        String startDate = offer.getStartDate() != null ? 
            offer.getStartDate().format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy")) : "To be decided";
        
        String pdfContent = String.format("""
            ============================================================
            WISSEN TECHNOLOGIES
            INTERNSHIP OFFER LETTER
            ============================================================
            
            Date: %s
            
            To,
            %s
            %s
            
            Dear %s,
            
            Subject: Offer for Internship - %s
            
            We are pleased to offer you an internship position with the following details:
            
            POSITION DETAILS:
            ----------------
            Position Title:      %s
            Department:          %s
            Reporting Manager:   %s
            
            COMPENSATION:
            ------------
            Stipend:            Rs. %s per month
            Duration:           %d months
            
            WORK DETAILS:
            ------------
            Start Date:         %s
            Location:           %s
            Work Mode:          %s
            
            TERMS AND CONDITIONS:
            --------------------
            1. This internship is for a fixed duration as mentioned above.
            2. The stipend will be paid monthly.
            3. You are required to maintain confidentiality of company information.
            4. Regular attendance and punctuality are expected.
            5. Performance will be evaluated periodically.
            
            Please sign and upload this letter to confirm your acceptance.
            
            We look forward to having you join our team!
            
            Best regards,
            
            HR Department
            Wissen Technologies
            
            ============================================================
            Generated by Wissen IMS - Intern Management System
            ============================================================
            """,
            offerDate,
            intern.getName(),
            intern.getEmail(),
            intern.getName(),
            offer.getPosition(),
            offer.getPosition(),
            offer.getDepartment(),
            offer.getReportingManager(),
            offer.getStipend(),
            offer.getDuration(),
            startDate,
            offer.getLocation(),
            offer.getWorkMode()
        );
        
        return pdfContent.getBytes();
    }
}
