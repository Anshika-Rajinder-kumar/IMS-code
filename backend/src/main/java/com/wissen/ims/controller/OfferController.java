package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.model.Offer;
import com.wissen.ims.service.OfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/offers")
public class OfferController {

    @Autowired
    private OfferService offerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Offer>>> getAllOffers() {
        List<Offer> offers = offerService.getAllOffers();
        return ResponseEntity.ok(ApiResponse.success(offers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Offer>> getOfferById(@PathVariable Long id) {
        try {
            Offer offer = offerService.getOfferById(id);
            return ResponseEntity.ok(ApiResponse.success(offer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Offer>>> getOffersByStatus(@PathVariable String status) {
        try {
            Offer.OfferStatus offerStatus = Offer.OfferStatus.valueOf(status.toUpperCase());
            List<Offer> offers = offerService.getOffersByStatus(offerStatus);
            return ResponseEntity.ok(ApiResponse.success(offers));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status"));
        }
    }

    @GetMapping("/intern/{internId}")
    public ResponseEntity<ApiResponse<List<Offer>>> getOffersByInternId(@PathVariable Long internId) {
        List<Offer> offers = offerService.getOffersByInternId(internId);
        return ResponseEntity.ok(ApiResponse.success(offers));
    }

    @GetMapping("/intern/{internId}/latest")
    public ResponseEntity<ApiResponse<Offer>> getLatestOfferByInternId(@PathVariable Long internId) {
        try {
            List<Offer> offers = offerService.getOffersByInternId(internId);
            if (offers.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No offer found for intern"));
            }
            // Return the latest offer
            Offer latestOffer = offers.get(offers.size() - 1);
            return ResponseEntity.ok(ApiResponse.success(latestOffer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Offer>> createOffer(@RequestBody Offer offer) {
        try {
            Offer createdOffer = offerService.createOffer(offer);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdOffer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Offer>> updateOffer(@PathVariable Long id, @RequestBody Offer offer) {
        try {
            Offer updatedOffer = offerService.updateOffer(id, offer);
            return ResponseEntity.ok(ApiResponse.success(updatedOffer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/send")
    public ResponseEntity<ApiResponse<Offer>> sendOffer(@PathVariable Long id) {
        try {
            Offer offer = offerService.sendOffer(id);
            return ResponseEntity.ok(ApiResponse.success(offer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<Offer>> acceptOffer(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile signedOffer) {
        try {
            Offer offer = offerService.acceptOffer(id, signedOffer);
            return ResponseEntity.ok(ApiResponse.success(offer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Offer>> rejectOffer(@PathVariable Long id) {
        try {
            Offer offer = offerService.rejectOffer(id);
            return ResponseEntity.ok(ApiResponse.success(offer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadOfferLetter(@PathVariable Long id) {
        try {
            Offer offer = offerService.getOfferById(id);
            byte[] pdfBytes = offerService.downloadOfferLetter(id);

            String filename = "Internship_Offer_" + offer.getIntern().getName().replace(" ", "_") + ".pdf";
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(pdfBytes.length))
                    .body(resource);
        } catch (Exception e) {
            System.err.println("❌ Download error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<Resource> viewOfferLetter(@PathVariable Long id) {
        try {
            Offer offer = offerService.getOfferById(id);
            byte[] pdfBytes = offerService.downloadOfferLetter(id);

            String filename = "Offer_Letter_" + offer.getIntern().getName().replace(" ", "_") + ".pdf";
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(pdfBytes.length))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<String> previewOfferLetter(@PathVariable Long id) {
        try {
            Offer offer = offerService.getOfferById(id);
            String htmlContent = offerService.renderOfferLetterHTML(offer.getIntern(), offer);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(htmlContent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating preview: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOffer(@PathVariable Long id) {
        try {
            offerService.deleteOffer(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
