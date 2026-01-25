package com.wissen.ims.service;

import com.wissen.ims.dto.AuthResponse;
import com.wissen.ims.dto.LoginRequest;
import com.wissen.ims.dto.RegisterRequest;
import com.wissen.ims.model.College;
import com.wissen.ims.model.Intern;
import com.wissen.ims.model.User;
import com.wissen.ims.repository.CollegeRepository;
import com.wissen.ims.repository.InternRepository;
import com.wissen.ims.repository.UserRepository;
import com.wissen.ims.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get college info for COLLEGE user type
        String collegeName = null;
        Long collegeId = null;
        if (user.getUserType() == User.UserType.COLLEGE && user.getCollegeId() != null) {
            collegeId = user.getCollegeId();
            College college = collegeRepository.findById(user.getCollegeId()).orElse(null);
            if (college != null) {
                collegeName = college.getName();
            }
        }

        // Get intern ID for INTERN user type
        Long internId = null;
        if (user.getUserType() == User.UserType.INTERN) {
            Intern intern = internRepository.findByEmail(user.getEmail()).orElse(null);
            if (intern != null) {
                internId = intern.getId();
            }
        }

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getFullName())
                .userType(user.getUserType().name())
                .collegeId(collegeId)
                .collegeName(collegeName)
                .internId(internId)
                .build();
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setUserType(User.UserType.valueOf(registerRequest.getUserType().toUpperCase()));
        user.setDepartment(registerRequest.getDepartment());
        user.setPhone(registerRequest.getPhone());
        user.setActive(true);

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getFullName())
                .userType(user.getUserType().name())
                .build();
    }
}
