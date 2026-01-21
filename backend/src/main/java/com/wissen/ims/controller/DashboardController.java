package com.wissen.ims.controller;

import com.wissen.ims.dto.ApiResponse;
import com.wissen.ims.model.Intern;
import com.wissen.ims.model.Offer;
import com.wissen.ims.service.CollegeService;
import com.wissen.ims.service.InternService;
import com.wissen.ims.service.OfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private CollegeService collegeService;

    @Autowired
    private InternService internService;

    @Autowired
    private OfferService offerService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // College stats
        stats.put("totalColleges", collegeService.getAllColleges().size());

        // Intern stats
        stats.put("totalInterns", internService.getAllInterns().size());
        stats.put("activeInterns", internService.countByStatus(Intern.InternStatus.ACTIVE));
        stats.put("onboardingInterns", internService.countByStatus(Intern.InternStatus.ONBOARDING));
        stats.put("documentPending", internService.countByStatus(Intern.InternStatus.DOCUMENT_PENDING));

        // Offer stats
        stats.put("totalOffers", offerService.getAllOffers().size());
        stats.put("generatedOffers", offerService.countByStatus(Offer.OfferStatus.GENERATED));
        stats.put("sentOffers", offerService.countByStatus(Offer.OfferStatus.SENT));
        stats.put("acceptedOffers", offerService.countByStatus(Offer.OfferStatus.ACCEPTED));

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
