package com.wissen.ims.service;

import com.wissen.ims.model.Candidate;
import com.wissen.ims.model.Intern;
import com.wissen.ims.model.User;
import com.wissen.ims.repository.CandidateRepository;
import com.wissen.ims.repository.InternRepository;
import com.wissen.ims.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

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

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public Candidate getCandidateById(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + id));
    }

    public List<Candidate> getCandidatesByStatus(Candidate.CandidateStatus status) {
        return candidateRepository.findByStatus(status);
    }

    public List<Candidate> getCandidatesByCollegeId(Long collegeId) {
        return candidateRepository.findByCollegeId(collegeId);
    }

    public List<Candidate> getCandidatesByCollegeName(String collegeName) {
        return candidateRepository.findByCollegeName(collegeName);
    }

    public List<Candidate> searchCandidates(String searchTerm) {
        return candidateRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCollegeNameContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm);
    }

    public Candidate createCandidate(Candidate candidate) {
        if (candidateRepository.existsByEmail(candidate.getEmail())) {
            throw new RuntimeException("Candidate with this email already exists");
        }
        
        // Check if user already exists with this email
        if (userRepository.existsByEmail(candidate.getEmail())) {
            throw new RuntimeException("A user with email " + candidate.getEmail() + " already exists. Please use a different email.");
        }
        
        // Save candidate first
        Candidate savedCandidate = candidateRepository.save(candidate);
        
        // Note: We don't create user accounts for candidates yet
        // User accounts will be created when they are converted to interns
        
        return savedCandidate;
    }

    public Candidate updateCandidate(Long id, Candidate candidateDetails) {
        Candidate candidate = getCandidateById(id);
        
        candidate.setName(candidateDetails.getName());
        candidate.setEmail(candidateDetails.getEmail());
        candidate.setPhone(candidateDetails.getPhone());
        candidate.setEmergencyContact(candidateDetails.getEmergencyContact());
        candidate.setCollegeId(candidateDetails.getCollegeId());
        candidate.setCollegeName(candidateDetails.getCollegeName());
        candidate.setBranch(candidateDetails.getBranch());
        candidate.setCgpa(candidateDetails.getCgpa());
        candidate.setAddress(candidateDetails.getAddress());
        candidate.setHiringRound(candidateDetails.getHiringRound());
        candidate.setHiringStatus(candidateDetails.getHiringStatus());
        candidate.setHiringScore(candidateDetails.getHiringScore());
        candidate.setStatus(candidateDetails.getStatus());

        return candidateRepository.save(candidate);
    }

    public Candidate updateCandidateStatus(Long id, Candidate.CandidateStatus status) {
        Candidate candidate = getCandidateById(id);
        candidate.setStatus(status);
        return candidateRepository.save(candidate);
    }

    public void deleteCandidate(Long id) {
        Candidate candidate = getCandidateById(id);
        candidateRepository.delete(candidate);
    }

    public long countByStatus(Candidate.CandidateStatus status) {
        return candidateRepository.findByStatus(status).size();
    }

    /**
     * Convert a candidate to an intern after selection
     * This creates the intern record and user account with credentials
     */
    public Intern convertCandidateToIntern(Long candidateId, LocalDate joinDate) {
        Candidate candidate = getCandidateById(candidateId);
        
        // Check if already converted
        if (internRepository.existsByEmail(candidate.getEmail())) {
            throw new RuntimeException("This candidate has already been converted to intern");
        }
        
        // Create intern from candidate
        Intern intern = new Intern();
        intern.setName(candidate.getName());
        intern.setEmail(candidate.getEmail());
        intern.setPhone(candidate.getPhone());
        intern.setEmergencyContact(candidate.getEmergencyContact());
        intern.setCollegeName(candidate.getCollegeName());
        intern.setBranch(candidate.getBranch());
        intern.setCgpa(candidate.getCgpa());
        intern.setAddress(candidate.getAddress());
        intern.setJoinDate(joinDate);
        intern.setHiringRound(candidate.getHiringRound());
        // Map Candidate.HiringStatus to Intern.HiringStatus
        if (candidate.getHiringStatus() != null) {
            switch (candidate.getHiringStatus()) {
                case NOT_STARTED:
                    intern.setHiringStatus(Intern.HiringStatus.NOT_STARTED);
                    break;
                case PENDING:
                    intern.setHiringStatus(Intern.HiringStatus.PENDING);
                    break;
                case IN_PROGRESS:
                    intern.setHiringStatus(Intern.HiringStatus.IN_PROGRESS);
                    break;
                case CLEARED:
                    intern.setHiringStatus(Intern.HiringStatus.CLEARED);
                    break;
                case REJECTED:
                    intern.setHiringStatus(Intern.HiringStatus.REJECTED);
                    break;
                default:
                    intern.setHiringStatus(Intern.HiringStatus.NOT_STARTED);
            }
        }
        intern.setHiringScore(candidate.getHiringScore());
        intern.setStatus(Intern.InternStatus.DOCUMENT_PENDING);
        
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
        
        // Update candidate status to SELECTED
        candidate.setStatus(Candidate.CandidateStatus.SELECTED);
        candidateRepository.save(candidate);
        
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
}
