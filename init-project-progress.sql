-- Connect to PostgreSQL and run this script
-- docker exec -it wissen-postgres psql -U wissen_user -d wissen_ims

-- Create the project_progress table
CREATE TABLE IF NOT EXISTS project_progress (
    id BIGSERIAL PRIMARY KEY,
    intern_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    completion_percentage INTEGER NOT NULL,
    description TEXT,
    challenges VARCHAR(1000),
    achievements VARCHAR(1000),
    next_steps VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE project_progress 
DROP CONSTRAINT IF EXISTS fk_progress_intern;

ALTER TABLE project_progress 
ADD CONSTRAINT fk_progress_intern 
FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE;

ALTER TABLE project_progress 
DROP CONSTRAINT IF EXISTS fk_progress_project;

ALTER TABLE project_progress 
ADD CONSTRAINT fk_progress_project 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_progress_intern ON project_progress(intern_id);
CREATE INDEX IF NOT EXISTS idx_progress_project ON project_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_updated ON project_progress(updated_at DESC);

-- Verify the table was created
\d project_progress

-- Show all tables to confirm
\dt
