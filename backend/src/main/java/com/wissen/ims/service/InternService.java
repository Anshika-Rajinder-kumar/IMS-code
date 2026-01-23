package com.wissen.ims.service;

import com.wissen.ims.model.Intern;
import com.wissen.ims.model.User;
import com.wissen.ims.repository.InternRepository;
import com.wissen.ims.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
@Transactional
public class InternService {

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private static final String CHAR_LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPERCASE = CHAR_LOWERCASE.toUpperCase();
    private static final String DIGIT = "0123456789";
    private static final String SPECIAL_CHAR = "!@#$%&*";
    private static final String PASSWORD_CHARS = CHAR_LOWERCASE + CHAR_UPPERCASE + DIGIT + SPECIAL_CHAR;
    private static final SecureRandom random = new SecureRandom();

    public List<Intern> getAllInterns() {
        return internRepository.findAll();
    }

    public Intern getInternById(Long id) {
        return internRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intern not found with id: " + id));
    }

    public List<Intern> getInternsByStatus(Intern.InternStatus status) {
        return internRepository.findByStatus(status);
    }

    public List<Intern> searchInterns(String searchTerm) {
        return internRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCollegeNameContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm);
    }

    public Intern createIntern(Intern intern) {
        if (internRepository.existsByEmail(intern.getEmail())) {
            throw new RuntimeException("Intern with this email already exists");
        }
        
        // Check if user already exists with this email
        if (userRepository.existsByEmail(intern.getEmail())) {
            throw new RuntimeException("A user with email " + intern.getEmail() + " already exists. Please use a different email.");
        }
        
        // Save intern first
        Intern savedIntern = internRepository.save(intern);
        
        // Generate random password for intern user
        String generatedPassword = generateSecurePassword(12);
        
        // Create user account for the intern
        User internUser = new User();
        internUser.setFullName(intern.getName());
        internUser.setEmail(intern.getEmail());
        internUser.setPassword(passwordEncoder.encode(generatedPassword));
        internUser.setUserType(User.UserType.INTERN);
        internUser.setPhone(intern.getPhone());
        internUser.setActive(true);
        
        userRepository.save(internUser);
        
        // Send credentials via email
        emailService.sendInternCredentials(
            intern.getEmail(),
            intern.getName(),
            intern.getEmail(),
            generatedPassword
        );
        
        return savedIntern;
    }

    private String generateSecurePassword(int length) {
        StringBuilder password = new StringBuilder(length);
        
        // Ensure at least one of each required character type
        password.append(CHAR_LOWERCASE.charAt(random.nextInt(CHAR_LOWERCASE.length())));
        password.append(CHAR_UPPERCASE.charAt(random.nextInt(CHAR_UPPERCASE.length())));
        password.append(DIGIT.charAt(random.nextInt(DIGIT.length())));
        password.append(SPECIAL_CHAR.charAt(random.nextInt(SPECIAL_CHAR.length())));
        
        // Fill the rest randomly
        for (int i = 4; i < length; i++) {
            password.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        
        // Shuffle the password characters
        return shuffleString(password.toString());
    }

    private String shuffleString(String input) {
        char[] characters = input.toCharArray();
        for (int i = characters.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = characters[i];
            characters[i] = characters[j];
            characters[j] = temp;
        }
        return new String(characters);
    }

    public Intern updateIntern(Long id, Intern internDetails) {
        Intern intern = getInternById(id);
        
        intern.setName(internDetails.getName());
        intern.setEmail(internDetails.getEmail());
        intern.setPhone(internDetails.getPhone());
        intern.setEmergencyContact(internDetails.getEmergencyContact());
        intern.setCollege(internDetails.getCollege());
        intern.setCollegeName(internDetails.getCollegeName());
        intern.setBranch(internDetails.getBranch());
        intern.setCgpa(internDetails.getCgpa());
        intern.setJoinDate(internDetails.getJoinDate());
        intern.setAddress(internDetails.getAddress());
        intern.setStatus(internDetails.getStatus());

        return internRepository.save(intern);
    }

    public Intern updateInternStatus(Long id, Intern.InternStatus status) {
        Intern intern = getInternById(id);
        intern.setStatus(status);
        return internRepository.save(intern);
    }

    public void deleteIntern(Long id) {
        Intern intern = getInternById(id);
        internRepository.delete(intern);
    }

    public long countByStatus(Intern.InternStatus status) {
        return internRepository.findByStatus(status).size();
    }
}
