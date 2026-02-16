package com.wissen.ims.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SkillExtractionService {

    // A comprehensive dictionary of relevant skills
    private static final Set<String> SKILL_DICTIONARY = new HashSet<>(Arrays.asList(
        "Java", "Spring Boot", "Hibernate", "JPA", "SQL", "PostgreSQL", "MySQL", "Oracle",
        "JavaScript", "React", "Angular", "Vue", "Node.js", "Express", "HTML", "CSS",
        "Python", "Django", "Flask", "Pandas", "NumPy", "TensorFlow", "PyTorch",
        "C++", "C#", "DotNet", "Go", "Rust", "Swift", "Kotlin",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "CI/CD", "Git",
        "Agile", "Scrum", "REST API", "GraphQL", "Microservices", "Unit Testing",
        "Project Management", "UI/UX", "Data Science", "Machine Learning", "Big Data",
        "Cybersecurity", "Blockchain", "DevOps"
    ));

    public Set<String> extractSkills(String text) {
        if (text == null || text.isEmpty()) {
            return new HashSet<>();
        }

        String lowercaseText = text.toLowerCase();
        
        // Match skills using case-insensitive comparison
        return SKILL_DICTIONARY.stream()
            .filter(skill -> lowercaseText.contains(skill.toLowerCase()))
            .collect(Collectors.toSet());
    }
}
