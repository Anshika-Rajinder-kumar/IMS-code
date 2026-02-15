-- Update project_progress table to support daily logging and admin reviews
ALTER TABLE project_progress ADD COLUMN log_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE project_progress ADD COLUMN task_description TEXT;
ALTER TABLE project_progress ADD COLUMN learnings TEXT;
ALTER TABLE project_progress ADD COLUMN admin_comment VARCHAR(500);

-- Update existing records to have a unique log_date if they happen to share the same intern/project
-- (This is a simplified approach, in a real prod env you might need more care)
-- For now, we'll just set the log_date to the created_at date for existing records
UPDATE project_progress SET log_date = DATE(created_at);

-- Add unique constraint to ensure one entry per day per project per intern
ALTER TABLE project_progress ADD UNIQUE INDEX intern_project_date_idx (intern_id, project_id, log_date);

-- Ensure description field can hold more content if needed (already 2000 in entity)
ALTER TABLE project_progress MODIFY COLUMN description TEXT;
ALTER TABLE project_progress MODIFY COLUMN challenges TEXT;
ALTER TABLE project_progress MODIFY COLUMN achievements TEXT;
ALTER TABLE project_progress MODIFY COLUMN next_steps TEXT;
