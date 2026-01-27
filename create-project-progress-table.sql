-- Create project_progress table for tracking intern project completion
-- Run this in your PostgreSQL database

DROP TABLE IF EXISTS project_progress CASCADE;

CREATE TABLE project_progress (
    id BIGSERIAL PRIMARY KEY,
    intern_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    completion_percentage INTEGER NOT NULL CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    description TEXT,
    challenges VARCHAR(1000),
    achievements VARCHAR(1000),
    next_steps VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_progress_intern FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_progress_intern ON project_progress(intern_id);
CREATE INDEX idx_progress_project ON project_progress(project_id);
CREATE INDEX idx_progress_updated ON project_progress(updated_at DESC);

-- Verify table was created
SELECT table_name FROM information_schema.tables WHERE table_name = 'project_progress';
