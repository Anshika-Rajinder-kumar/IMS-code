package com.wissen.ims.service;

import com.wissen.ims.model.Intern;
import com.wissen.ims.model.Offer;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@wissen.com}")
    private String fromEmail;

    @Value("${app.name:Wissen IMS}")
    private String appName;

    public void sendCollegeCredentials(String toEmail, String collegeName, String email, String password) {
        if (mailSender == null) {
            // Log credentials if email is not configured
            System.out.println("==============================================");
            System.out.println("EMAIL SERVICE NOT CONFIGURED");
            System.out.println("College: " + collegeName);
            System.out.println("Login Credentials:");
            System.out.println("Email: " + email);
            System.out.println("Password: " + password);
            System.out.println("Login URL: http://localhost:3000");
            System.out.println("==============================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to " + appName + " - College Login Credentials");
            message.setText(buildCollegeEmailBody(collegeName, email, password));

            mailSender.send(message);
        } catch (Exception e) {
            // Fallback to console logging if email fails
            System.err.println("Failed to send email to: " + toEmail);
            System.err.println("Error: " + e.getMessage());
            System.out.println("==============================================");
            System.out.println("College: " + collegeName);
            System.out.println("Login Credentials:");
            System.out.println("Email: " + email);
            System.out.println("Password: " + password);
            System.out.println("==============================================");
        }
    }

    public void sendInternCredentials(String toEmail, String internName, String email, String password) {
        if (mailSender == null) {
            // Log credentials if email is not configured
            System.out.println("==============================================");
            System.out.println("EMAIL SERVICE NOT CONFIGURED");
            System.out.println("Intern: " + internName);
            System.out.println("Login Credentials:");
            System.out.println("Email: " + email);
            System.out.println("Password: " + password);
            System.out.println("Login URL: http://localhost:3000");
            System.out.println("==============================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to " + appName + " - Intern Login Credentials");
            message.setText(buildInternEmailBody(internName, email, password));

            mailSender.send(message);
        } catch (Exception e) {
            // Fallback to console logging if email fails
            System.err.println("Failed to send email to: " + toEmail);
            System.err.println("Error: " + e.getMessage());
            System.out.println("==============================================");
            System.out.println("Intern: " + internName);
            System.out.println("Login Credentials:");
            System.out.println("Email: " + email);
            System.out.println("Password: " + password);
            System.out.println("==============================================");
        }
    }

    public void sendOfferLetter(Intern intern, Offer offer, byte[] pdfBytes) {
        if (mailSender == null) {
            // Log offer details if email is not configured
            System.out.println("==============================================");
            System.out.println("EMAIL SERVICE NOT CONFIGURED");
            System.out.println("Offer Letter for: " + intern.getName());
            System.out.println("Email: " + intern.getEmail());
            System.out.println("Position: " + offer.getPosition());
            System.out.println("Stipend: Rs. " + offer.getStipend() + " per month");
            System.out.println("Start Date: " + offer.getStartDate());
            System.out.println("Duration: " + offer.getDuration() + " months");
            System.out.println("Location: " + offer.getLocation());
            System.out.println("Login URL: http://localhost:3000");
            System.out.println("==============================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            // Enable multipart support for attachment
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(intern.getEmail());
            helper.setSubject("Congratulations! Internship Offer Letter from " + appName);
            helper.setText(buildOfferEmailBody(intern, offer), true);

            // Attach PDF
            if (pdfBytes != null && pdfBytes.length > 0) {
                String filename = "Internship_Offer_" + intern.getName().replace(" ", "_") + ".pdf";
                helper.addAttachment(filename, new ByteArrayResource(pdfBytes));
                System.out.println("📎 Attached PDF to offer email: " + filename);
            }

            mailSender.send(message);
            System.out.println("✅ Offer letter email sent successfully with attachment to: " + intern.getEmail());
        } catch (MessagingException e) {
            // Log the actual error
            System.err.println("❌ Failed to send offer email to: " + intern.getEmail());
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private String buildOfferEmailBody(Intern intern, Offer offer) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        String startDate = offer.getStartDate() != null ? offer.getStartDate().format(formatter) : "To be decided";

        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                                         color: white; padding: 30px; text-align: center; }
                                .content { padding: 30px; background: #f9fafb; }
                                .offer-box { background: white; border-left: 4px solid #667eea;
                                            padding: 20px; margin: 20px 0; border-radius: 8px; }
                                .detail { margin: 10px 0; }
                                .label { font-weight: bold; color: #667eea; }
                                .button { display: inline-block; padding: 12px 30px;
                                         background: #667eea; color: white; text-decoration: none;
                                         border-radius: 6px; margin: 20px 0; }
                                .footer { text-align: center; color: #666; padding: 20px;
                                         border-top: 1px solid #ddd; margin-top: 30px; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>🎉 Congratulations!</h1>
                                <h2>Internship Offer Letter</h2>
                            </div>
                            <div class="content">
                                <p>Dear <strong>%s</strong>,</p>

                                <p>We are pleased to extend an offer for the <strong>%s</strong> position at <strong>%s</strong>!</p>

                                <div class="offer-box">
                                    <h3 style="color: #667eea; margin-top: 0;">Offer Details</h3>
                                    <div class="detail">
                                        <span class="label">Position:</span> %s
                                    </div>
                                    <div class="detail">
                                        <span class="label">Department:</span> %s
                                    </div>
                                    <div class="detail">
                                        <span class="label">Stipend:</span> Rs. %d per month
                                    </div>
                                    <div class="detail">
                                        <span class="label">Duration:</span> %s
                                    </div>
                                    <div class="detail">
                                        <span class="label">Start Date:</span> %s
                                    </div>
                                    <div class="detail">
                                        <span class="label">Location:</span> %s (%s)
                                    </div>
                                    <div class="detail">
                                        <span class="label">Reporting Manager:</span> %s
                                    </div>
                                </div>

                                <p><strong>📄 Offer Letter:</strong> You can download your official offer letter from the portal after logging in.</p>

                                <p>To accept this offer, please:</p>
                                <ol>
                                    <li>Log in to the portal using the link below</li>
                                    <li>Navigate to "My Offer" section</li>
                                    <li>Download and review the offer letter</li>
                                    <li>Upload the signed offer letter</li>
                                    <li>Click on "Accept Offer" button</li>
                                </ol>

                                <div style="text-align: center;">
                                    <a href="http://localhost:3000" class="button">Login to Portal</a>
                                </div>

                                <p>We look forward to having you on our team!</p>

                                <p><strong>Important:</strong> This offer is valid for 7 days from the date of this email.</p>
                            </div>
                            <div class="footer">
                                <p>Best regards,<br>
                                <strong>%s Team</strong></p>
                                <p style="font-size: 12px; color: #999;">
                                    This is an automated email. Please do not reply to this message.<br>
                                    If you have any questions, please contact hr@wissen.com
                                </p>
                            </div>
                        </body>
                        </html>
                        """,
                intern.getName(),
                offer.getPosition(),
                appName,
                offer.getPosition(),
                offer.getDepartment(),
                offer.getStipend(),
                offer.getDuration(),
                startDate,
                offer.getLocation(),
                offer.getWorkMode(),
                offer.getReportingManager(),
                appName);
    }

    private String buildCollegeEmailBody(String collegeName, String email, String password) {
        return String.format("""
                Dear %s,

                Welcome to %s!

                Your college has been successfully registered in our Intern Management System.
                You can now log in to the portal to view and track your students' hiring progress.

                Login Credentials:
                ------------------
                Email: %s
                Password: %s
                Portal URL: http://localhost:3000

                Instructions:
                1. Visit the portal URL
                2. Select "College" as your user type
                3. Enter your credentials
                4. For security reasons, please change your password after first login

                Features available to you:
                - View students' hiring status
                - Track interview rounds and scores
                - Monitor offer generation and acceptance
                - View comprehensive reports

                If you have any questions or face any issues, please contact our support team.

                Best regards,
                %s Team

                ---
                This is an automated email. Please do not reply to this message.
                """,
                collegeName, appName, email, password, appName);
    }

    private String buildInternEmailBody(String internName, String email, String password) {
        return String.format("""
                Dear %s,

                Welcome to %s!

                You have been registered as an intern in our Intern Management System.
                You can now log in to the portal to manage your documents and view offers.

                Login Credentials:
                ------------------
                Email: %s
                Password: %s
                Portal URL: http://localhost:3000

                Instructions:
                1. Visit the portal URL
                2. Select "Intern" as your user type
                3. Enter your credentials
                4. For security reasons, please change your password after first login

                Features available to you:
                - Upload and manage required documents
                - View your hiring status and interview rounds
                - Access and respond to offer letters
                - Track your progress through the hiring process

                If you have any questions or face any issues, please contact our support team.

                Best regards,
                %s Team

                ---
                This is an automated email. Please do not reply to this message.
                """,
                internName, appName, email, password, appName);
    }
}
