package com.wissen.ims.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
