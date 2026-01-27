-- Verify and create projects table if it doesn't exist

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    duration VARCHAR(255),
    difficulty VARCHAR(255)
);

-- Verify projects table exists
SELECT COUNT(*) FROM projects;

-- Insert sample project if table is empty
INSERT INTO projects (title, description, duration, difficulty)
SELECT 'Sample Project', 'A sample project for testing', '4 weeks', 'Medium'
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);
