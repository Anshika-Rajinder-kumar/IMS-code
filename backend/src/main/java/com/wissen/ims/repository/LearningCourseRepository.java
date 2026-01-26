package com.wissen.ims.repository;

import com.wissen.ims.model.LearningCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningCourseRepository extends JpaRepository<LearningCourse, Long> {
}
