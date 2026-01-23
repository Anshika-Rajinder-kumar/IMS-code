package com.wissen.ims.service;

import com.wissen.ims.model.College;
import com.wissen.ims.model.User;
import com.wissen.ims.repository.CollegeRepository;
import com.wissen.ims.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
@Transactional
public class CollegeService {

    @Autowired
    private CollegeRepository collegeRepository;

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

    public List<College> getAllColleges() {
        return collegeRepository.findAll();
    }

    public College getCollegeById(Long id) {
        return collegeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("College not found with id: " + id));
    }

    public List<College> getCollegesByStatus(College.VisitStatus status) {
        return collegeRepository.findByStatus(status);
    }

    public List<College> searchColleges(String searchTerm) {
        return collegeRepository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(searchTerm, searchTerm);
    }

    public College createCollege(College college) {
        // Check if user already exists with this email
        if (userRepository.existsByEmail(college.getEmail())) {
            throw new RuntimeException("A user with email " + college.getEmail() + " already exists. Please use a different email.");
        }
        
        // Save college first
        College savedCollege = collegeRepository.save(college);
        
        // Generate random password for college user
        String generatedPassword = generateSecurePassword(12);
        
        // Create user account for the college
        User collegeUser = new User();
        collegeUser.setFullName(college.getName());
        collegeUser.setEmail(college.getEmail());
        collegeUser.setPassword(passwordEncoder.encode(generatedPassword));
        collegeUser.setUserType(User.UserType.COLLEGE);
        collegeUser.setPhone(college.getPhone());
        collegeUser.setCollegeId(savedCollege.getId());
        collegeUser.setActive(true);
        
        userRepository.save(collegeUser);
        
        // Send credentials via email
        emailService.sendCollegeCredentials(
            college.getEmail(),
            college.getName(),
            college.getEmail(),
            generatedPassword
        );
        
        return savedCollege;
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

    public College updateCollege(Long id, College collegeDetails) {
        College college = getCollegeById(id);
        
        college.setName(collegeDetails.getName());
        college.setLocation(collegeDetails.getLocation());
        college.setCoordinator(collegeDetails.getCoordinator());
        college.setEmail(collegeDetails.getEmail());
        college.setPhone(collegeDetails.getPhone());
        college.setVisitDate(collegeDetails.getVisitDate());
        college.setSlots(collegeDetails.getSlots());
        college.setStatus(collegeDetails.getStatus());
        college.setNotes(collegeDetails.getNotes());

        return collegeRepository.save(college);
    }

    public void deleteCollege(Long id) {
        College college = getCollegeById(id);
        collegeRepository.delete(college);
    }
}
