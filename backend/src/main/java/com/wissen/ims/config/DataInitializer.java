package com.wissen.ims.config;

import com.wissen.ims.model.LearningCourse;
import com.wissen.ims.model.Project;
import com.wissen.ims.repository.LearningCourseRepository;
import com.wissen.ims.repository.ProjectRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initLearningData(LearningCourseRepository courseRepository, ProjectRepository projectRepository) {
        return args -> {
            if (courseRepository.count() == 0) {
                courseRepository.saveAll(Arrays.asList(
                        new LearningCourse(null, "Java Fundamentals",
                                "Deep dive into OOP, Collections, and Exception Handling", "2 weeks", "Beginner", 
                                new HashSet<>(Arrays.asList("Java", "Agile"))),
                        new LearningCourse(null, "Spring Boot for Professionals",
                                "Mastering REST APIs, JPA, and Security with Spring Boot", "3 weeks", "Intermediate",
                                new HashSet<>(Arrays.asList("Spring Boot", "JPA", "PostgreSQL"))),
                        new LearningCourse(null, "Modern React with Hooks",
                                "Building responsive UIs with Functional Components and Hooks", "3 weeks",
                                "Intermediate", new HashSet<>(Arrays.asList("React", "JavaScript", "HTML", "CSS"))),
                        new LearningCourse(null, "PostgreSQL & Database Optimization",
                                "SQL best practices and performance tuning", "2 weeks", "Beginner",
                                new HashSet<>(Arrays.asList("SQL", "PostgreSQL", "Big Data")))));
            }

            if (projectRepository.count() == 0) {
                projectRepository.saveAll(Arrays.asList(
                        new Project(null, "E-Commerce API",
                                "Develop a high-performance backend for a shopping platform", "4 weeks", "Advanced",
                                new HashSet<>(Arrays.asList("Java", "Spring Boot", "PostgreSQL", "REST API"))),
                        new Project(null, "Employee Management System",
                                "Full-stack application with RBAC and report generation", "3 weeks", "Intermediate",
                                new HashSet<>(Arrays.asList("Java", "Hibernate", "React", "Spring Boot"))),
                        new Project(null, "Real-time Notification Service", "Implementation using WebSockets and Redis",
                                "2 weeks", "Advanced", new HashSet<>(Arrays.asList("Node.js", "Redis", "Docker")))));
            }
        };
    }
}
