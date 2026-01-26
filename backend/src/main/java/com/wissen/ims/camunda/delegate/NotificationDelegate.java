package com.wissen.ims.camunda.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * Camunda Delegate for Email Notifications
 * Handles sending notifications at various stages of the process
 */
@Slf4j
@Component("notificationDelegate")
@RequiredArgsConstructor
public class NotificationDelegate implements JavaDelegate {

    private final JavaMailSender mailSender;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        log.info("=== Sending Notification ===");
        
        String recipientEmail = (String) execution.getVariable("candidateEmail");
        String recipientName = (String) execution.getVariable("candidateName");
        String notificationType = (String) execution.getVariable("notificationType");
        
        if (recipientEmail == null || recipientEmail.isEmpty()) {
            log.warn("No recipient email found, skipping notification");
            return;
        }
        
        String subject = "";
        String body = "";
        
        // Determine notification type
        switch (notificationType != null ? notificationType : "OFFER_GENERATED") {
            case "OFFER_GENERATED":
                subject = "Congratulations! Your Offer Letter is Ready";
                body = String.format(
                    "Dear %s,\n\n" +
                    "Congratulations! We are pleased to inform you that your offer letter has been generated.\n\n" +
                    "Please log in to the Internship Management System to review and accept your offer.\n\n" +
                    "Best Regards,\n" +
                    "Wissen Technology HR Team",
                    recipientName != null ? recipientName : "Candidate"
                );
                break;
                
            case "DOCUMENT_VERIFIED":
                subject = "Document Verification - Approved";
                body = String.format(
                    "Dear %s,\n\n" +
                    "Your submitted document has been verified and approved by our HR team.\n\n" +
                    "You can check the status in your dashboard.\n\n" +
                    "Best Regards,\n" +
                    "Wissen Technology HR Team",
                    recipientName != null ? recipientName : "Intern"
                );
                break;
                
            case "DOCUMENT_REJECTED":
                String rejectionReason = (String) execution.getVariable("rejectionReason");
                subject = "Document Verification - Action Required";
                body = String.format(
                    "Dear %s,\n\n" +
                    "Your submitted document has been reviewed and requires resubmission.\n\n" +
                    "Reason: %s\n\n" +
                    "Please upload a corrected version of the document.\n\n" +
                    "Best Regards,\n" +
                    "Wissen Technology HR Team",
                    recipientName != null ? recipientName : "Intern",
                    rejectionReason != null ? rejectionReason : "Document does not meet requirements"
                );
                break;
                
            case "ONBOARDING_STARTED":
                subject = "Welcome to Wissen Technology - Onboarding Initiated";
                body = String.format(
                    "Dear %s,\n\n" +
                    "Welcome to Wissen Technology! Your onboarding process has been initiated.\n\n" +
                    "You will receive further instructions regarding your joining date and onboarding activities.\n\n" +
                    "We look forward to having you on our team!\n\n" +
                    "Best Regards,\n" +
                    "Wissen Technology HR Team",
                    recipientName != null ? recipientName : "New Intern"
                );
                break;
                
            default:
                log.warn("Unknown notification type: {}", notificationType);
                return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("noreply@wissen.com");
            
            mailSender.send(message);
            log.info("Email sent successfully to: {}", recipientEmail);
            
            execution.setVariable("notificationSent", true);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", recipientEmail, e);
            execution.setVariable("notificationSent", false);
            // Don't throw exception - notification failure shouldn't stop the process
        }
        
        log.info("=== Notification Process Completed ===");
    }
}
