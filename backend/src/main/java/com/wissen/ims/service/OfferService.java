package com.wissen.ims.service;

import com.wissen.ims.model.Intern;
import com.wissen.ims.model.Offer;
import com.wissen.ims.repository.InternRepository;
import com.wissen.ims.repository.OfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.Objects;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.util.StreamUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

@Service
public class OfferService {

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TemplateEngine templateEngine;

    @Autowired
    private ResourceLoader resourceLoader;

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
            // Generate PDF as single source of truth
            byte[] pdfBytes = generateOfferLetterPDF(intern, savedOffer);
            emailService.sendOfferLetter(intern, savedOffer, pdfBytes);
            System.out.println("✅ Offer letter email with PDF sent successfully to: " + intern.getEmail());
        } catch (Exception e) {
            System.err.println("❌ FAILED to send offer email to " + intern.getEmail());
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
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
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".pdf";
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
        try {
            String htmlContent = renderOfferLetterHTML(intern, offer);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();

            // Set base URI to templates directory for resources
            String baseUri = Objects.requireNonNull(getClass().getClassLoader().getResource("templates/"))
                    .toExternalForm();
            builder.withHtmlContent(htmlContent, baseUri);

            builder.toStream(outputStream);
            builder.run();

            byte[] pdfBytes = outputStream.toByteArray();

            if (pdfBytes == null || pdfBytes.length == 0) {
                throw new IllegalStateException("PDF generation failed: empty output");
            }

            return pdfBytes;
        } catch (Exception e) {
            System.err.println("❌ FAILED to generate PDF for intern: " + intern.getName());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    public String renderOfferLetterHTML(Intern intern, Offer offer) {
        Context context = new Context();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        String offerDate = LocalDateTime.now().format(formatter);
        String startDateStr = offer.getStartDate() != null ? offer.getStartDate().format(formatter) : "To be decided";

        // Calculate end date based on duration
        String endDateStr = "To be decided";
        if (offer.getStartDate() != null) {
            String durationStr = offer.getDuration();
            int months = 12; // default
            try {
                if (durationStr != null) {
                    months = Integer.parseInt(durationStr.replaceAll("[^0-9]", ""));
                }
            } catch (Exception e) {
                // Keep default 12
            }
            // For Wissen specific case in reference: 15 July 2025 to 30 June 2026 for 12
            // months?
            // Standard calc:
            endDateStr = offer.getStartDate().plusMonths(months).minusDays(15).withDayOfMonth(30).format(formatter);
            // Matching the reference logic roughly: end of month prior to full year?
            // Actually, let's just use a simple plusMonths and format it.
            endDateStr = offer.getStartDate().plusMonths(months).minusDays(1).format(formatter);
        }

        context.setVariable("offerDate", offerDate);
        context.setVariable("internName", intern.getName());
        context.setVariable("internSalutationName", intern.getName().split(" ")[0]);
        context.setVariable("internAddress", intern.getAddress() != null ? intern.getAddress() : "");
        context.setVariable("startDate", startDateStr);
        context.setVariable("duration", offer.getDuration());
        context.setVariable("endDate", endDateStr);
        context.setVariable("stipend", String.format("%,d", offer.getStipend()));
        context.setVariable("stipendInWords", convertNumberToWords(offer.getStipend()));

        // Add images as Base64
        context.setVariable("logoBase64", getResourceAsBase64("classpath:images/WissenLogo.jpg", "image/jpeg"));
        context.setVariable("signatureBase64",
                getResourceAsBase64("classpath:images/Mohan_mummadi_sign_IMS-project.png", "image/png"));

        return templateEngine.process("offer_letter", context);
    }

    private String getResourceAsBase64(String resourcePath, String mimeType) {
        try {
            Resource resource = resourceLoader.getResource(resourcePath);
            byte[] bytes = StreamUtils.copyToByteArray(resource.getInputStream());
            String base64 = Base64.getEncoder().encodeToString(bytes);
            return "data:" + mimeType + ";base64," + base64;
        } catch (IOException e) {
            System.err.println("❌ Failed to load resource for Base64 encoding: " + resourcePath);
            return "";
        }
    }

    private String convertNumberToWords(long number) {
        if (number == 0)
            return "Zero";

        String[] units = { "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
                "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen" };
        String[] tens = { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };

        if (number < 20)
            return units[(int) number];
        if (number < 100)
            return tens[(int) (number / 10)] + (number % 10 != 0 ? " " + units[(int) (number % 10)] : "");
        if (number < 1000)
            return units[(int) (number / 100)] + " Hundred"
                    + (number % 100 != 0 ? " and " + convertNumberToWords(number % 100) : "");
        if (number < 100000)
            return convertNumberToWords(number / 1000) + " Thousand"
                    + (number % 1000 != 0 ? " " + convertNumberToWords(number % 1000) : "");
        if (number < 10000000)
            return convertNumberToWords(number / 100000) + " Lakh"
                    + (number % 100000 != 0 ? " " + convertNumberToWords(number % 100000) : "");

        return String.valueOf(number); // Fallback
    }
}
